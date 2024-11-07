import express from 'express';
import authenticationRoutes from './routes/authenticationRoutes';
import { dbSync, sequelize } from './config/database';
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
    
    app.listen(port, async () => {
        console.log(`Server running on ${process.env.URL}${port}`)
        try {
			await sequelize.authenticate();
			console.log(
				"La conexión con la base de datos ha sido establecida correctamente.",
			);
		} catch (error) {
			console.error("No se pudo conectar a la base de datos:", error);
		}
    })
};

main();