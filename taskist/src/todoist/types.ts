type TodoistTaskDue = {
    date: string;
    string: string;
    lang: string;
    is_recurring: boolean;
}

export type TodoistTask = {
    labels: string[];
    description?: string;
    url?: string;
    content: string;
    id: string;
    checked: boolean;
    childOrder: number;
    projectId: string;
    sectionId?: string;
    parentId?: string | null;
    due: TodoistTaskDue | null;
    priority: 1 | 2 | 3 | 4;
};

export type TodoistProject = {
    id: string;
    name: string;
    childOrder: number;
    color?: string;
    parentId?: string | null;
};

export type TodoistSection = {
    id: string;
    projectId: string;
    name: string;
}

type CommandOf<T extends string, Y> = {
    type: T,
    uuid: string,
    args: Y
}

export type TodoistCommand = TodoistMoveCommand

export type TodoistMoveCommand = CommandOf<"item_move", TodoistMoveArgs>;

export type TodoistMoveArgs = {
    id: TodoistTask['id'],
    parent_id?: TodoistTask["id"],
    project_id?: TodoistProject["id"],
    section_id?: TodoistSection['id']
}

export type createArgsType<T> = T extends CommandOf<infer Y, infer Z> ? [Y, Z] : never

export function createArg(type: TodoistCommand['type'], args: TodoistCommand['args']): TodoistCommand {
    return {
        type,
        uuid: self.crypto.randomUUID(),
        args
    }
}

export const baseUrl = "https://api.todoist.com";
export const baseRestUrl = baseUrl + "/rest/v1/";
export const baseSyncUrl = baseUrl + "/sync/v9/";