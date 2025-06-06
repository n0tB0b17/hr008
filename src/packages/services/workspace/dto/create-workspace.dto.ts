import { WorkspaceVisibility } from "../enums/workspace-visibility.enum";

export class CreateWorkspaceDto{
    name: string = "";
    description?: string;
    visibility: WorkspaceVisibility = WorkspaceVisibility.PRIVATE;
}