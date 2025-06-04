import { CreateWorkspaceDto } from '@/packages/core/dtos/create-workspace.dto';
import { IworkspaceRepository } from '../repository/iworkspace.repository';
import { BadRequestError, ForbiddenError, NotFoundError } from '@/packages/core/errors/custom-error';
import { IWorkspace } from '@/packages/core/interface/iworkspace.interface';
import { WorkspaceMemberRole } from '@/packages/core/enums/workspace-member-role.enum';
import { WorkspaceVisibility } from '@/packages/core/enums/workspace-visibility.enum';
import { IWorkspaceMember } from '@/packages/core/interface/iworkspacemember.interface';
import { UpdateWorkspaceDto } from '@/packages/core/dtos/update-workspace.dto';
import { AddMemberDto } from '@/packages/core/dtos/add-member.dto';
import { UpdateMemberRoleDto } from '@/packages/core/dtos/update-member.dto';

export class WorkspaceService {
    constructor(private readonly workspaceRepository: IworkspaceRepository) { }

    async createWorkspace(docs: CreateWorkspaceDto, ownerId: string): Promise<IWorkspace> {
        if (!docs.name || docs.name.trim() === "") {
            throw new BadRequestError("workspace name cannot be empty");
        }

        const workspace: IWorkspace = await this.workspaceRepository.create(docs, ownerId);
        await this.workspaceRepository.addMember(
            workspace.workspaceId,
            ownerId,
            WorkspaceMemberRole.ADMIN
        );

        return workspace;
    }

    // userId: requesting user's id
    async getWorkspaceById(workspaceId: string, userId: string): Promise<IWorkspace> {
        const workspace: IWorkspace | null = await this.workspaceRepository.findById(workspaceId);
        if (!workspace) {
            throw new NotFoundError(`Workspace with ID: ${workspaceId} not found`);
        }

        if (workspace.visibility === WorkspaceVisibility.PRIVATE) {
            const member: IWorkspaceMember | null = await this.workspaceRepository.findMember(workspace.workspaceId, userId);
            if (!member) {
                throw new ForbiddenError(`You do not have permission to workspace: ${workspace.name}`);
            }
        }

        return workspace;
    }


    async getWorkspacesForUser(userId: string): Promise<IWorkspace[]> {
        // complex query can be added to repository to fetch all Workspace user is belong to
        // currently it only returns workspace owned by user
        const workspace: IWorkspace[] = await this.workspaceRepository.findByUserId(userId);
        return workspace;
    }


    async updateWorkspace(docs: UpdateWorkspaceDto, workspaceId: string, userId: string): Promise<IWorkspace> {
        const workspace: IWorkspace | null = await this.workspaceRepository.findById(workspaceId);
        if (!workspace) {
            throw new NotFoundError(`Workspace with ID: ${workspaceId} not found`);
        }

        const member: IWorkspaceMember | null = await this.workspaceRepository.findMember(workspaceId, userId);
        if (!member || member.role !== WorkspaceMemberRole.ADMIN) {
            throw new ForbiddenError(`You do not have permission to update workspace: ${workspace.name}`);
        }

        if (!docs.name || docs.name.trim() === "") {
            throw new BadRequestError(`workspace name cannot be empty`);
        }

        const updatedWorkspace: IWorkspace | null = await this.workspaceRepository.update(workspaceId, docs);
        if (!updatedWorkspace) {
            throw new NotFoundError(`Workspace with id: ${workspaceId} cannot be updated or be found`)
        }

        return updatedWorkspace;
    }

    async deleteWorkspace(workspaceId: string, userId: string): Promise<boolean> {
        const workspace: IWorkspace | null = await this.workspaceRepository.findById(workspaceId);
        if (!workspace) {
            throw new NotFoundError(`Workspace not found for given id: ${workspaceId}`);
        }

        if (workspace.ownerId != userId) {
            throw new ForbiddenError(`You do not have permission to delete workspace: ${workspace.name}`);
        }

        const members: IWorkspaceMember[] = await this.workspaceRepository.getMembers(workspaceId);
        for (const member of members) {
            await this.workspaceRepository.removeMember(workspace.workspaceId, member.userId);
        }

        const deleteResp: boolean = await this.workspaceRepository.delete(workspace.workspaceId);
        return deleteResp;
    }


    async addMemberToWorkspace(workspaceId: string, docs: AddMemberDto, userId: string): Promise<IWorkspaceMember | null> {
        const workspace: IWorkspace | null = await this.workspaceRepository.findById(workspaceId);
        if (!workspace) {
            throw new NotFoundError(`Workspace not found for given id: ${workspaceId}`);
        }

        const member: IWorkspaceMember | null = await this.workspaceRepository.findMember(workspace.workspaceId, userId);
        if (!member || member.role !== WorkspaceMemberRole.ADMIN) {
            throw new ForbiddenError(`You do not have permission to add new member to workspace: ${workspaceId}`)
        }


        const existingMember: IWorkspaceMember | null = await this.workspaceRepository.findMember(workspaceId, docs.userId);
        if (existingMember) {
            throw new BadRequestError(`User: ${docs.userId} already member of workspace`)
        }

        // Todo:  check if user existing in user table

        return await this.workspaceRepository.addMember(workspaceId, docs.userId, docs.role);
    }


    async removeMemberFromWorkspace(workspaceId: string, userId: string, memberToRemoveId: string): Promise<boolean> { return false }
    async updateMemberRoleInWorkspace(workspaceId: string, userId: string, dto: UpdateMemberRoleDto) { }
    async getMembersFromWorkspace(workspaceId: string, userId: string) { }
}