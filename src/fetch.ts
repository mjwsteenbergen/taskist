type TodoistTaskDue = {
    date: string;
    string: string;
    lang: string;
    is_recurring: boolean;
}

export type TodoistTask = {
    description?: string;
    url?: string;
    content: string;
    id: string;
    is_completed: boolean;
    order: number;
    project_id: string;
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

const baseUrl = "https://api.todoist.com/rest/v2/";
const token = window.localStorage.getItem("todoist_key");
const auth = {
    "Authorization": "Bearer " + token
}
export const api = {
    getTasks: () => fetch(baseUrl + "tasks", {
            headers: auth
        }).then(i => i.json())
            .then(i => i as TodoistTask[]),
    getProjects: () => fetch(baseUrl + "projects", {
        headers: auth
    }).then(i => i.json()).then(i => i as TodoistProject[]),
    createTask: (p: Partial<TodoistTask>) => fetch(baseUrl + "tasks", {
        headers: {
            ...auth,
            "Content-Type": "application/json"
        },
        method: 'post',
        body: JSON.stringify(p)
    }).then(i => i.json()).then(i => i as TodoistTask),
    update: (fullPartial: Partial<TodoistTask> & Pick<TodoistTask, 'id'>) => {
        const { id, ...rest } = fullPartial;
        return fetch(baseUrl + "tasks/" + id, {
            headers: {
                ...auth,
                "Content-Type": "application/json"
            },
            method: 'post',
            body: JSON.stringify(rest)
        }).then(i => i.json()).then(i => i as TodoistTask)
    },
    complete: (id: string) => fetch(baseUrl + "tasks/" + id + "/close", {
        headers: {
            ...auth,
            "Content-Type": "application/json"
        },
        method: 'post',
    }),
    uncomplete: (id: string) => fetch(baseUrl + "tasks/" + id + "/reopen", {
        headers: {
            ...auth,
            "Content-Type": "application/json"
        },
        method: 'post',
    }),
}

export const cachedApi = {
    getTasks: cache(api.getTasks, 30),
    getProjects: cache(api.getProjects, 30),
    createTask: api.createTask,
    update: api.update,
    complete: api.complete,
    uncomplete: api.uncomplete
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