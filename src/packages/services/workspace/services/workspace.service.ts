import { CreateWorkspaceDto } from '../dto/create-workspace.dto';
import { IworkspaceRepository } from '../repository/iworkspace.repository';
import { BadRequestError, ForbiddenError, NotFoundError } from '../../../core/errors/custom-error';
import { IWorkspace } from '@/packages/core/interface/iworkspace.interface';
import { WorkspaceMemberRole } from '../../../core/enums/workspace-member-role.enum';
import { WorkspaceVisibility } from '../../../core/enums/workspace-visibility.enum';
import { IWorkspaceMember } from '../../../core/interface/iworkspacemember.interface';
import { UpdateWorkspaceDto } from '../dto/update-workspace.dto';
import { AddMemberDto } from '../dto/add-member.dto';
import { UpdateMemberRoleDto } from '../dto/update-member.dto';
import { ICacheService } from '@/packages/core/cache/cache.interface';
import { INatsService } from '@/packages/core/nats/nats.interface';


const WORKSPACE_CACHE_PREFIX = "workspace";
const WORKSPACE_MEMBER_CACHE_PREFIX = "workspace_member"
const USER_WORKSPACE_CACHE_PREFIX = "user_workspace"
const DEFAULT_CACHE_TTL = 3600;

export class WorkspaceService {
    constructor(
        private readonly workspaceRepository: IworkspaceRepository,
        private readonly cacheRepository: ICacheService,
        private readonly natsRepository: INatsService
    ) { }

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
        const cacheKey: string = `${WORKSPACE_CACHE_PREFIX}:${workspaceId}`;

        const cachedWorkspace: IWorkspace | null = await this.cacheRepository.get<IWorkspace>(cacheKey);
        if (cachedWorkspace) {
            if (cachedWorkspace.visibility === WorkspaceVisibility.PRIVATE) {
                const member = await this.workspaceRepository.findMember(workspaceId, userId);
                if (!member) {
                    throw new ForbiddenError(`You do not have permission to workspace: ${cachedWorkspace.name}`);
                }
            }
            return cachedWorkspace;
        }

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

        await this.cacheRepository.set<IWorkspace>(cacheKey, workspace, DEFAULT_CACHE_TTL);
        return workspace;
    }


    async getWorkspacesForUser(userId: string): Promise<IWorkspace[]> {
        // complex query can be added to repository to fetch all Workspace user belong to
        // currently it only returns workspace owned by user

        const cacheKey: string = `${USER_WORKSPACE_CACHE_PREFIX}:${userId}`;
        const cachedWorkspace: IWorkspace[] | null = await this.cacheRepository.getWithPopulate(
            cacheKey,
            () => this.workspaceRepository.findByUserId(userId),
            DEFAULT_CACHE_TTL
        )

        if (!cachedWorkspace) return [];

        return cachedWorkspace;
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

        const cacheKey: string = `${WORKSPACE_CACHE_PREFIX}:${workspaceId}`
        await this.cacheRepository.del(cacheKey)

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
        if (deleteResp) {
            const cacheKey: string = `${WORKSPACE_CACHE_PREFIX}:${workspaceId}`;
            const cacheKeyMember: string = `${WORKSPACE_MEMBER_CACHE_PREFIX}:${workspaceId}`;

            await this.cacheRepository.del([cacheKey, cacheKeyMember]);
        }

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

        return await this.workspaceRepository.addMember(workspaceId, docs.userId, docs.role);
    }


    async removeMemberFromWorkspace(workspaceId: string, userId: string, memberToRemoveId: string): Promise<boolean> {
        return false
    }
    async updateMemberRoleInWorkspace(workspaceId: string, userId: string, dto: UpdateMemberRoleDto): Promise<IWorkspaceMember> {
        return {} as IWorkspaceMember
    }
}