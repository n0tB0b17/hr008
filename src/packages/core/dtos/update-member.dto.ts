import { WorkspaceMemberRole } from "../enums/workspace-member-role.enum";


export class UpdateMemberRoleDto {
    role: WorkspaceMemberRole = WorkspaceMemberRole.MEMBER;
}