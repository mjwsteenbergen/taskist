import { baseRestUrl, TodoistTask, TodoistProject, TodoistSection, baseSyncUrl, TodoistMoveArgs, createArg, TodoistCommand } from "./types";
import { TodoistApi } from "@doist/todoist-api-typescript";

type TodoistCursorResponse<T> =  {
    nextCursor: string | null;
    results: T[];
}

async function getAll<T>(func: (data: {
    cursor?: string | null,
}) => Promise<TodoistCursorResponse<T>>): Promise<T[]> { 
    let cursor: string | undefined | null;
    const items: T[] = [];
    do {
        const response = await func({
            cursor
        });
        cursor = response.nextCursor;
    } while(cursor !== null && cursor !== undefined)
    return items;
}

export const getApi = (token: string) => {
    const api = new TodoistApi(token)

    const auth = {
        "Authorization": "Bearer " + token
    }

    const sync = (commands: TodoistCommand[]) => fetch(baseSyncUrl + "sync?commands=" + encodeURIComponent(JSON.stringify(commands)), {
        headers: {
            ...auth,
            "Content-Type": "application/json"
        },
    })

    return {
        getTasks: () => getAll(api.getTasks) as Promise<TodoistTask[]>,
        getProjects: () => getAll(api.getProjects) as Promise<TodoistProject[]>,
        getSections: () => getAll(api.getSections) as Promise<TodoistSection[]>,
        createTask: api.addTask,
        updateTask: api.updateTask,
        complete: api.closeTask,
        uncomplete: api.reopenTask,
        createSection: api.addSection,
        sync,
        moveTask: api.moveTask
    }
}