import { PrismaClient, Workspace, WorkspaceMember } from "../../../generated/prisma";
import { IworkspaceRepository } from "./iworkspace.repository";
import { CreateWorkspaceDto } from "../dto/create-workspace.dto";
import { IWorkspace } from "../../../core/interface/iworkspace.interface";
import { UpdateWorkspaceDto } from "../dto/update-workspace.dto";
import { WorkspaceMemberRole } from "../../../core/enums/workspace-member-role.enum";
import { IWorkspaceMember } from "../../../core/interface/iworkspacemember.interface";
import { NotFoundError } from "../../../core/errors/custom-error";


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
        const resp = await this.prisma.workspace.findUnique({
            where: { workspaceId }
        })

        return resp ? toDomainInWorkspace(resp) : null;
    }

    // find workspace by ownerId
    async findByUserId(ownerId: string): Promise<IWorkspace[]> {
        const resp = await this.prisma.workspace.findMany({
            where: { ownerId }
        })
        return resp.map(toDomainInWorkspace);
    }

    async delete(workspaceId: string): Promise<boolean> {
        return false;
    }

    async update(workspaceId: string, docs: Partial<UpdateWorkspaceDto>): Promise<IWorkspace | null> {
        const dataToUpdate: any = {};
        if (docs.name !== undefined) dataToUpdate["name"] = docs.name;
        if (docs.description !== undefined) dataToUpdate["description"] = docs.description;
        if (docs.visibility !== undefined) dataToUpdate["visibility"] = docs.visibility as any;

        if (Object.keys(dataToUpdate).length === 0) {
            return this.findById(workspaceId);
        }

        const resp = await this.prisma.workspace.update({
            where: { workspaceId },
            data: dataToUpdate,
        })

        return toDomainInWorkspace(resp);
    }


    async addMember(workspaceId: string, userId: string, role: WorkspaceMemberRole): Promise<IWorkspaceMember | null> {
        try {
            const resp = await this.prisma.workspaceMember.create({
                data: {
                    workspaceId,
                    userId,
                    role: role as any
                }
            })


            return toDomainInWorkspaceMember(resp);
        } catch (e: any) {
            if (e.code === "P2002") {
                return this.findMember(workspaceId, userId);
            }

            console.error(`Error added member to workspace`);
            return null;
        }
    }

    async findMember(workspaceId: string, userId: string): Promise<IWorkspaceMember | null> {
        const resp = await this.prisma.workspaceMember.findUnique({
            where: {
                workspaceId_userId: {
                    workspaceId,
                    userId
                }
            }
        })


        return resp ? toDomainInWorkspaceMember(resp) : null;
    }

    async getMembers(workspaceId: string): Promise<IWorkspaceMember[]> {
        const resp = await this.prisma.workspaceMember.findMany({
            where: {
                workspaceId
            }
        });
        return resp.map(toDomainInWorkspaceMember);
    }

    async updateMemberRole(workspaceId: string, userId: string, role: WorkspaceMemberRole): Promise<IWorkspaceMember | null> {
        const reps = await this.prisma.workspaceMember.update({
            where: {
                workspaceId_userId: {
                    workspaceId,
                    userId,
                }
            },
            data: {
                role: role as any
            }
        });

        return reps ? toDomainInWorkspaceMember(reps) : null;
    }

    async removeMember(workspaceId: string, userId: string): Promise<boolean> {
        try {
            await this.prisma.workspaceMember.delete({
                where: {
                    workspaceId_userId: {
                        workspaceId,
                        userId,
                    }
                }
            })

            return true;
        } catch (e: any) {
            if (e.code === "P2025") {
                throw new NotFoundError("not found...");
            }

            console.error(`error while deleting member from workspace`);
            return false;
        }
    }
}

export {
    WorkspaceRepository
}