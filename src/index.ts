import express from 'express';
import authenticationRoutes from './routes/authenticationRoutes';
import { dbSync, sequelize } from './config/mysql_db';
import { connectToMongo } from './config/mongo_db';
import { User } from './dataAccess/models/User';

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

    // await User.create({ email: "user@gmail.com", password: "1234" });
    
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