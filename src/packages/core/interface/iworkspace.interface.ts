import { WorkspaceVisibility } from '../enums/workspace-visibility.enum'

export interface IWorkspace{
    workspaceId: string;
    name: string;
    description: string;
    ownerId: string;
    visibility: WorkspaceVisibility;
    createdAt: Date;
    updatedAt: Date;
}
