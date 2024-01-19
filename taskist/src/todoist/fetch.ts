import { baseRestUrl, TodoistTask, TodoistProject, TodoistSection, baseSyncUrl, TodoistMoveArgs, createArg, TodoistCommand } from "./types";

export const getApi = (token: string) => {
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
        getTasks: () => fetch(baseRestUrl + "tasks", {
            headers: auth
        }).then(i => i.json())
            .then(i => i as TodoistTask[]),
        getProjects: () => fetch(baseRestUrl + "projects", {
            headers: auth
        }).then(i => i.json()).then(i => i as TodoistProject[]),
        getSections: () => fetch(baseRestUrl + "sections", {
            headers: auth
        }).then(i => i.json()).then(i => i as TodoistSection[]),
        createTask: (p: Partial<TodoistTask>) => fetch(baseRestUrl + "tasks", {
            headers: {
                ...auth,
                "Content-Type": "application/json"
            },
            method: 'post',
            body: JSON.stringify(p)
        }).then(i => i.json()).then(i => i as TodoistTask),
        updateTask: (fullPartial: Partial<TodoistTask> & Pick<TodoistTask, 'id'>) => {
            const { id, ...rest } = fullPartial;
            return fetch(baseRestUrl + "tasks/" + id, {
                headers: {
                    ...auth,
                    "Content-Type": "application/json"
                },
                method: 'post',
                body: JSON.stringify(rest)
            }).then(i => i.json()).then(i => i as TodoistTask)
        },
        complete: (id: string) => fetch(baseRestUrl + "tasks/" + id + "/close", {
            headers: {
                ...auth,
                "Content-Type": "application/json"
            },
            method: 'post',
        }),
        uncomplete: (id: string) => fetch(baseRestUrl + "tasks/" + id + "/reopen", {
            headers: {
                ...auth,
                "Content-Type": "application/json"
            },
            method: 'post',
        }),
        createSection: (p: Partial<TodoistSection> & Pick<TodoistSection, "name" | "project_id">) => fetch(baseRestUrl + "sections", {
            headers: {
                ...auth,
                "Content-Type": "application/json"
            },
            method: 'post',
            body: JSON.stringify(p)
        }).then(i => i.json()).then(i => i as TodoistSection),
        sync,
        moveTask: (args: TodoistMoveArgs) => sync([createArg("item_move", args)])
    }
}