import { WorkspaceMemberRole } from "../enums/workspace-member-role.enum";


export class AddMemberDto{
    userId: string = "";
    role: WorkspaceMemberRole = WorkspaceMemberRole.MEMBER;
}