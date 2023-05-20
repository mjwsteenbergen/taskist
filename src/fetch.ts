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
    is_completed: boolean;
    order: number;
    project_id: string;
    section_id?: string;
    parent_id?: string | null;
    due: TodoistTaskDue | null;
    priority: 1 | 2 | 3 | 4;
};

export type TodoistProject = {
    id: string;
    name: string;
    order: number;
    color?: string;
    parent_id?: string | null;
};

export type TodoistSection = {
    id: string;
    project_id: string;
    name: string;
}

type CommandOf<T extends string, Y> = {
    type: T,
    uuid: string,
    args: Y
}

type TodoistCommand = TodoistMoveCommand

type TodoistMoveCommand = CommandOf<"item_move", TodoistMoveArgs>;

export type TodoistMoveArgs = {
    id: TodoistTask['id'],
    parent_id?: TodoistTask["id"],
    project_id?: TodoistProject["id"],
    section_id?: TodoistSection['id']
}

type createArgsType<T> = T extends CommandOf<infer Y, infer Z> ? [Y,Z] : never 

function createArg(type: TodoistCommand['type'], args: TodoistCommand['args']): TodoistCommand {
    return {
        type,
        uuid: crypto.randomUUID(),
        args
    }
}

const baseUrl = "https://api.todoist.com";
const baseRestUrl = baseUrl + "/rest/v2/";
const baseSyncUrl = baseUrl + "/sync/v9/";

const getToken = () => {
    const token = window.localStorage.getItem("todoist_key");

    if (!token) {
        const requestedToken = window.prompt("Enter todoist key");
        window.localStorage.setItem("todoist_key", requestedToken ?? "");
    }
    return token;
}
const token = getToken();
const auth = {
    "Authorization": "Bearer " + token
}
export const api = {
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
    sync: (commands: TodoistCommand[]) => fetch(baseSyncUrl + "sync?commands=" + encodeURIComponent(JSON.stringify(commands)), {
        headers: {
            ...auth,
            "Content-Type": "application/json"
        },
    }),
    moveTask: (args: TodoistMoveArgs) => api.sync([createArg("item_move", args)])
}

export const cachedApi = {
    getTasks: cache(api.getTasks, 0),
    getProjects: cache(api.getProjects, 0),
    getSections: cache(api.getSections, 0),
    createTask: api.createTask,
    updateTask: api.updateTask,
    createSection: api.createSection,
    complete: api.complete,
    uncomplete: api.uncomplete,
    moveTask: api.moveTask,
}

type cacheItem<Y> = {
    item: Y;
    added: number;
}

export function cache<Y, Arg>(func: (...args: Arg[]) => Promise<Y>, waitForS: number) {
    return async function (...args: Arg[]) {
        return new Promise<Y>((resolve, reject) => {
            const json = window.localStorage.getItem("cache." + func.name);
            if (json) {
                const c = JSON.parse(json) as cacheItem<Y>;
                resolve(c.item);
                if ((Date.now() - c.added) / 1000 < waitForS) {
                    console.debug("getting from cache: " + func.name);
                    return;     
                }
            }

            func(...args).then(result => {
                window.localStorage.setItem("cache." + func.name, JSON.stringify({
                    added: Date.now(),
                    item: result
                } as cacheItem<Y>))
                resolve(result);
            }).catch((err) => {
                if (!json) {
                    reject(err);
                }
            });
        });
    }
    
    
}