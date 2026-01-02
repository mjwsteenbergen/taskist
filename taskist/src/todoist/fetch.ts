import { baseRestUrl, TodoistTask, TodoistProject, TodoistSection, baseSyncUrl, TodoistMoveArgs, createArg, TodoistCommand } from "./types";
import { TodoistApi } from "@doist/todoist-api-typescript";

type TodoistCursorResponse<T> =  {
    nextCursor: string | null;
    results: T[];
}

async function getAll<T>(func: (data: {
    cursor?: string | null,
    limit?: number
}) => Promise<TodoistCursorResponse<T>>): Promise<T[]> { 
    console.log("Starting");

    let cursor: string | undefined | null = null;
    let items: T[] = [];
    do {
        const response: TodoistCursorResponse<T> = await func({
            cursor,
            limit: 200
        }).then(i => i);
        cursor = response.nextCursor;
        items = items.concat(response.results);
    } while(cursor !== null && cursor !== undefined)

    return items;
}

export const getApi = (token: string) => {
    const api = new TodoistApi(token);

    const auth = {
        "Authorization": "Bearer " + token
    }

    const sync = (commands: TodoistCommand[]) => fetch(baseSyncUrl + "sync?commands=" + encodeURIComponent(JSON.stringify(commands)), {
        headers: {
            ...auth,
            "Content-Type": "application/json"
        },
    })

    const tries = (func: () => Promise<any>) => {
        func().then(i => console.log(i));
    }

    return {
        getTasks: () => getAll((props: Parameters<typeof api.getTasks>[0]) => api.getTasks(props)) as Promise<TodoistTask[]>,
        getProjects: () => getAll((props: Parameters<typeof api.getProjects>[0]) => api.getProjects(props)) as Promise<TodoistProject[]>,
        getSections: () => getAll((props: Parameters<typeof api.getSections>[0]) => api.getSections(props)) as Promise<TodoistSection[]>,
        createTask: (...props: Parameters<typeof api.addTask>) => api.addTask(...props),
        updateTask: (...props: Parameters<typeof api.updateTask>) => api.updateTask(...props),
        complete: (...props: Parameters<typeof api.closeTask>) => api.closeTask(...props),
        uncomplete: (...props: Parameters<typeof api.reopenTask>) => api.reopenTask(...props),
        createSection: (...props: Parameters<typeof api.addSection>) => api.addSection(...props),
        sync,
        moveTask: (...props: Parameters<typeof api.moveTask>) => api.moveTask(...props)
    }
}