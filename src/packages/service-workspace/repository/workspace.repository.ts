import { PrismaClient, Workspace, WorkspaceMember } from "../../generated/prisma";
import { IworkspaceRepository } from "./iworkspace.repository";
import { CreateWorkspaceDto } from "@/packages/core/dtos/create-workspace.dto";
import { IWorkspace } from "@/packages/core/interface/iworkspace.interface";
import { UpdateWorkspaceDto } from "@/packages/core/dtos/update-workspace.dto";
import { WorkspaceMemberRole } from "@/packages/core/enums/workspace-member-role.enum";
import { IWorkspaceMember } from "@/packages/core/interface/iworkspacemember.interface";



const toDomainInWorkspace = (prismaWorkspace: Workspace): IWorkspace => {
    return {
        ...prismaWorkspace,
        visibility: prismaWorkspace.visibility as any,
    } as IWorkspace;
}

const toDomainInWorkspaceMember = (prismaWorkspaceMember: WorkspaceMember): IWorkspaceMember => {
    return {
        ...prismaWorkspaceMember,
        role: prismaWorkspaceMember.role as any,
    } as IWorkspaceMember;
}

class WorkspaceRepository implements IworkspaceRepository {
    constructor(private readonly prisma: PrismaClient) { }

    async create(docs: CreateWorkspaceDto, ownerId: string): Promise<IWorkspace> {
        const resp = await this.prisma.workspace.create({
            data: {
                name: docs.name,
                description: docs.description,
                ownerId: ownerId,
            }
        })

        return toDomainInWorkspace(resp);
    }

    async findById(workspaceId: string): Promise<IWorkspace | null> {
        return null;
    }

    async findByUserId(ownerId: string): Promise<IWorkspace[]> {
        return []
    }

    async delete(workspaceId: string): Promise<boolean> {
        return false;
    }

    async update(workspaceId: string, docs: Partial<UpdateWorkspaceDto>): Promise<IWorkspace | null> {
        return null;
    }


    async addMember(workspaceId: string, userId: string, role: WorkspaceMemberRole): Promise<IWorkspaceMember | null> {
        return null;
    }

    async findMember(workspaceId: string, userId: string): Promise<IWorkspaceMember | null> {
        return null;
    }

    async getMembers(workspaceId: string): Promise<IWorkspaceMember[]> {
        return [];
    }

    async updateMemberRole(workspaceId: string, userId: string, role: WorkspaceMemberRole): Promise<IWorkspaceMember | null> {
        return null;
    }

    async removeMember(workspaceId: string, userId: string): Promise<boolean> {
        return false;
    }
}

export {
    WorkspaceRepository
}