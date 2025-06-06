import express, { Request, Response } from 'express'
import cors from 'cors'
import { WorkspaceRepository } from './packages/services/workspace/repository/workspace.repository';
import { PrismaClient } from './packages/generated/prisma/client'
import { WorkspaceService } from './packages/services/workspace/services/workspace.service';
import { CreateWorkspaceDto } from './packages/services/workspace/dto/create-workspace.dto';
import { IWorkspace } from './packages/core/interface/iworkspace.interface';
import { cacheService } from './packages/core/cache/redis.cache';
import { natsService } from './packages/core/nats/nats';


const Server = () => {
    const app = express();
    const prismaClient = new PrismaClient();

    app.use(cors());
    app.use(express.json())
    app.use(express.urlencoded({ extended: true }));

    app.post("/api/v1/workspace", async (req: Request, res: Response) => {
        const workspaceRepo = new WorkspaceRepository(prismaClient);
        const workspaceService = new WorkspaceService(workspaceRepo, cacheService, natsService);

        const { name, description, visibility } = req.body;
        if (!name) {
            res.status(404).send({
                message: "bad request",
                status: "failed"
            })
            return
        }

        const createDTO: CreateWorkspaceDto = {
            name,
            description,
            visibility
        };

        const workspace: IWorkspace = await workspaceService.createWorkspace(createDTO, "1");
        res.status(200).send({
            mesage: "health check",
            status: "ok",
            workspace
        })
        return
    });

    return app;
}

export {
    Server
}