import { CreateWorkspaceDto } from "@/packages/core/dtos/create-workspace.dto";
import { UpdateWorkspaceDto } from "@/packages/core/dtos/update-workspace.dto";
import { WorkspaceMemberRole } from "@/packages/core/enums/workspace-member-role.enum";
import { IWorkspace } from "@/packages/core/interface/iworkspace.interface";
import { IWorkspaceMember } from "@/packages/core/interface/iworkspacemember.interface";

export interface IworkspaceRepository {
    create(docs: CreateWorkspaceDto, ownerId: string): Promise<IWorkspace>;
    findById(workspaceId: string): Promise<IWorkspace | null>;
    findByOwnerId(ownerId: string): Promise<IWorkspace[]>;
    delete(workspaceId: string): Promise<boolean>;
    update(workspaceId: string, docs: Partial<UpdateWorkspaceDto>): Promise<IWorkspace | null>;


    addMember(workspaceId: string, userId: string, role: WorkspaceMemberRole): Promise<IWorkspaceMember | null>
    findMember(workspaceId: string, userId: string): Promise<IWorkspaceMember | null>;
    getMembers(workspaceId: string): Promise<IWorkspaceMember[]>;
    updateMemberRole(workspaceId: string, userId: string, role: WorkspaceMemberRole): Promise<IWorkspaceMember | null>;
    removeMember(workspaceId: string, userId: string): Promise<boolean>;
}