import { WorkspaceMemberRole } from "../enums/workspace-member-role.enum";

export interface IWorkspaceMember {
    workspaceId: string;
    userId: string;
    role: WorkspaceMemberRole;
    joinedAt: Date
}