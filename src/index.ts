import express from 'express';
import authenticationRoutes from './routes/authenticationRoutes';
import { dbSync, sequelize } from './config/mysql_db';
import { connectToMongo } from './config/mongo_db';
import { connect, disconnect, getConnectionsByGameRoom, send, broadcast, disconnectAll } from './helpers/connectionManager';
import * as gamesService from './services/gamesService';

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
        const game_room = parseInt(url.split('/')[2]);

        send(player_id, `Player ${player_id} connected to game room ${game_room}`);
        connect(ws, player_id, game_room);

        let playersInRoom = getConnectionsByGameRoom(game_room);
        if (playersInRoom.length < 2) {
            setTimeout(() => {
                playersInRoom = getConnectionsByGameRoom(game_room);
                if (playersInRoom.length < 2) {
                    console.log(`Game room ${game_room} did not get enough players. Closing room.`);
                    disconnectAll(game_room);
                } else {
                    console.log(`Game room ${game_room} is starting with ${playersInRoom.length} players.`);
                    gamesService.start(playersInRoom.map(player => player.player_id));
                }
            }, MAX_WAIT_TIME);
        }

        ws.on('message', (message: any) => {
            console.log('Received:', message);
        });

        ws.on('close', () => {
            console.log('WebSocket connection closed');
        });
    })

};

main();