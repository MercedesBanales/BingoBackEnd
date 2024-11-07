import express from 'express';
import authenticationRoutes from './routes/authenticationRoutes';
import { dbSync, sequelize } from './config/mysql_db';
import { connectToMongo } from './config/mongo_db';

const app = express();
const port = parseInt(process.env.PORT!);

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
    
    app.listen(port, async () => {
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
};

main();