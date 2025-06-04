import express, { Request, Response } from 'express'
import cors from 'cors'


const Server = () => {
    const app = express();

    app.use(cors());
    app.use(express.json())
    app.use(express.urlencoded({ extended: true }));


    app.get("/health", (req: Request, res: Response) => {
        res.status(200).send({
            mesage: "health check",
            status: "ok"
        })
        return
    })

    return app;
}

export {
    Server
}