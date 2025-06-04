import { WorkspaceMemberRole } from "../enums/workspace-member-role.enum";


export class AddMemberRoleDto{
    userId: string = "";
    role: WorkspaceMemberRole = WorkspaceMemberRole.MEMBER;
}