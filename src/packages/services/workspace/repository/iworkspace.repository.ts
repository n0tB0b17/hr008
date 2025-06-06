import { CreateWorkspaceDto } from "../dto/create-workspace.dto";
import { UpdateWorkspaceDto } from "../dto/update-workspace.dto";
import { WorkspaceMemberRole } from "../../../core/enums/workspace-member-role.enum";
import { IWorkspace } from "../../../core/interface/iworkspace.interface";
import { IWorkspaceMember } from "../../../core/interface/iworkspacemember.interface";

export interface IworkspaceRepository {
    create(docs: CreateWorkspaceDto, ownerId: string): Promise<IWorkspace>;
    findById(workspaceId: string): Promise<IWorkspace | null>;
    findByUserId(ownerId: string): Promise<IWorkspace[]>;
    delete(workspaceId: string): Promise<boolean>;
    update(workspaceId: string, docs: Partial<UpdateWorkspaceDto>): Promise<IWorkspace | null>;


    addMember(workspaceId: string, userId: string, role: WorkspaceMemberRole): Promise<IWorkspaceMember | null>
    findMember(workspaceId: string, userId: string): Promise<IWorkspaceMember | null>;
    getMembers(workspaceId: string): Promise<IWorkspaceMember[]>;
    updateMemberRole(workspaceId: string, userId: string, role: WorkspaceMemberRole): Promise<IWorkspaceMember | null>;
    removeMember(workspaceId: string, userId: string): Promise<boolean>;
}