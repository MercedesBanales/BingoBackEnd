import express from 'express';
import authenticationRoutes from './routes/authenticationRoutes';
import { dbSync, sequelize } from './config/mysql_db';
import { connectToMongo } from './config/mongo_db';
import * as connectionManager from './helpers/connectionManager';
import * as gamesService from './services/gamesService';
import { PlayResponse } from './utils/interfaces/PlayResponse';
import corsMiddleware from 'cors';

const WebSocket = require('ws');
const app = express();
const port = parseInt(process.env.PORT!);
const server = require('http').createServer(app);

const MIN_WAIT_TIME = 30000; // 30 seconds
const MAX_WAIT_TIME = 60000; // 1 minute

const main = async () => {
    try {
		await dbSync();
        console.log('Database synced');
    } catch (error: any) {
        console.log(error)
    }

    app.use(corsMiddleware({
        origin: `${process.env.URL}3001`,
        methods: 'GET,POST,PUT,DELETE',
        credentials: true
    }));

    app.use(express.json());
    app.use("/api", authenticationRoutes);

    // Default route handler
    app.get("/", (req, res) => {
        res.send('Main');
    });

    // await User.create({ email: "user@gmail.com", password: "1234" });
    
    server.listen(port, async () => {
        console.log(`Server running on ${process.env.URL}${port}`)
        try {
			await sequelize.authenticate();
            await connectToMongo();
            console.log(
				"Successfully connected to database.",
			);
		} catch (error) {
			console.error("Error when connecting to database:", error);
		}
    })

    const wsServer = new WebSocket.Server({ server: server }) 
    wsServer.on('connection', (ws: any, req: any) => {
        const url = req.url;
        const player_id = url.split('/')[1];

        console.log(`Player ${player_id} connected to lobby`);
        connectionManager.connect(ws, player_id);

        setTimeout(() => {
            connectionManager.setAvailable(player_id);
        }, MIN_WAIT_TIME);

        setTimeout(async () => {
            const availablePlayersInLobby = connectionManager.getAvailablePlayersInLobby();
            if (connectionManager.getCurrentPlayer(player_id).status === "PLAYING") return;
            if (availablePlayersInLobby.length < 2) {
                console.log(`Not enough players in lobby. Disconnecting player ${player_id}`);
                connectionManager.send(player_id, false, 'Game room did not get enough players. Closing room.');
                connectionManager.disconnectAll();
            } else {
                const game_id = await gamesService.start(availablePlayersInLobby.map(player => player.player_id));
                console.log(`Game ${game_id} is starting with ${availablePlayersInLobby.length} players.`);
                connectionManager.start(game_id);
            }
        }, MAX_WAIT_TIME);



        ws.on('message', async (message: any) => {
            const data = JSON.parse(message.toString());
            switch (data.action) {
                case 'PUT':
                    try {
                        const play_response : PlayResponse = await gamesService.play(player_id, data.game_id, data.coord_x, data.coord_y);
                        connectionManager.send(player_id, true, play_response.message);
                        break;
                    } catch (error: any) {
                        connectionManager.send(player_id, false, error.message);
                    }
                case 'BINGO':
                    try {
                        const bingo_response : PlayResponse = await gamesService.bingo(player_id, data.game_id);
                        let success = true;
                        if (bingo_response.message === gamesService.StatusType.DISQUALIFIED) success = false;
                        connectionManager.broadcast(data.game_id, bingo_response.message, success);
                        break;
                    } catch (error: any) {
                        connectionManager.send(player_id, false, error.message);
                    }
            }
        });

        ws.on('close', () => {
            connectionManager.disconnect(ws);
            console.log('WebSocket connection closed');
        });
    })

};

main();