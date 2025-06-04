import { WorkspaceVisibility } from "../enums/workspace-visibility.enum";


export class UpdateWorkspaceDto {
    name?: string;
    description?: string;
    visibility?: WorkspaceVisibility = WorkspaceVisibility.PRIVATE;
}