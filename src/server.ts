import { Express } from 'express'
import { Server } from "./app";
import dotenv from 'dotenv';

dotenv.config();

const StartServer = () => {
    const port: string = process.env.PORT || "5555";
    const app: Express = Server();

    app.listen(port, () => {
        console.log(`Server is running on port: ${port}`);
    })
}

StartServer();