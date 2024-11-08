import express from 'express';
import authenticationRoutes from './routes/authenticationRoutes';
import { dbSync, sequelize } from './config/mysql_db';
import { connectToMongo } from './config/mongo_db';
import { connect, disconnect, getConnectionsByGameRoom, send, broadcast, disconnectAll } from './helpers/connectionManager';

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
    wsServer.on('connection', function connection(ws: any) {
        console.log('WebSocket connection established');
        ws.send('Welcome to the WebSocket server');

        ws.on('message', function incoming(message: any) {
            console.log('Received:', message);
        });

        ws.on('close', () => {
            console.log('WebSocket connection closed');
        });
    })

};

main();