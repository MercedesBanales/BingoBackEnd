import express from 'express';
import authenticationRoutes from './routes/authenticationRoutes';
import { dbSync, sequelize } from './config/mysql_db';
import { connectToMongo } from './config/mongo_db';
import * as connectionManager from './helpers/connectionManager';
import * as gamesService from './services/gamesService';
import { PlayResponse } from './utils/interfaces/PlayResponse';
import corsMiddleware from 'cors';
import { BingoDataPacket, CardDataPacket, PlayersDataPacket, PutDataPacket } from './utils/interfaces/DataPacket';
import * as gameHandler from './handlers/gameHandler';

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
                connectionManager.send(player_id, false, '', '', 'Game room did not get enough players. Closing room.');
                connectionManager.disconnectAll();
            } else {
                const game_id = await gamesService.start(availablePlayersInLobby.map(player => player.player_id));
                console.log(`Game ${game_id} is starting with ${availablePlayersInLobby.length} players.`);
                connectionManager.start(game_id);
            }
        }, MAX_WAIT_TIME);

        ws.on('message', async (message: any) => {
            const response = JSON.parse(message.toString());
            switch (response.action) {
                case 'PUT':
                    try {
                        response as PutDataPacket;
                        const play_response : PlayResponse = await gamesService.play(player_id, response.data.game_id, response.data.coord_x, response.data.coord_y);
                        connectionManager.send(player_id, true, 'PUT', response.data.game_id, play_response.message, play_response.card);
                    } catch (error: any) {
                        connectionManager.send(player_id, false,'PUT', response.data.game_id, error.message);
                    }
                    break;
                case 'BINGO':
                    try {
                        response as BingoDataPacket;
                        const bingo_response : PlayResponse = await gamesService.bingo(player_id, response.data.game_id);
                        if (bingo_response.message === gamesService.StatusType.DISQUALIFIED) {
                            connectionManager.send(response.data.player_id, false, 'BINGO', response.data.game_id, 'You have been disqualified');
                            const players = await connectionManager.getGamePlayers(response.data.game_id);
                            const remaining_players = players.filter(player => player.id !== response.data.player_id);
                            remaining_players.forEach(async player => {
                                connectionManager.send(player.id, true, 'GET_PLAYERS', response.data.game_id, '', [[]], remaining_players);
                            })
                        } else {
                            connectionManager.broadcast(response.data.game_id, 'BINGO', `${bingo_response.winner!.id}/${bingo_response.winner!.email}`, true);
                        }
                    } catch (error: any) {
                        connectionManager.send(player_id, false, 'BINGO', '', error.message);
                    }
                    break;
                case 'GET_CARD':
                    try {
                        response as CardDataPacket;
                        const card = await gamesService.getCard(response.data.player_id, response.data.game_id);
                        connectionManager.send(response.data.player_id, true, 'GET_CARD', response.data.game_id, '', card.card);
                    } catch (error: any) {
                        connectionManager.send(response.data.player_id, false, 'GET_CARD', response.data.game_id, error.message);
                    }
                    break;
                case 'GET_PLAYERS':
                    try {
                        response as PlayersDataPacket;
                        const players = await connectionManager.getGamePlayers(response.data.game_id);
                        connectionManager.send(player_id, true, 'GET_PLAYERS', '', '', [[]], players);
                    }
                    catch (error: any) {
                        connectionManager.send(player_id, false, 'GET_PLAYERS', response.game_id, error.message);
                    }
                    break;
                default:
                    break;
            }
        });

        ws.on('close', () => {
            connectionManager.disconnect(ws);
            console.log('WebSocket connection closed');
        });
    })

};

main();