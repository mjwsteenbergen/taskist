import React, { PropsWithChildren, useContext, useEffect, useMemo } from "react";
import { useCallback, useState } from "react";
import { cachedApi, TodoistProject, TodoistTask } from "./fetch";
import { OfState } from "./task";

export const TodoContext = React.createContext<OfState<TodoistTask[]> | undefined>(undefined);
export const TodoContextProvider = (props: PropsWithChildren<{ v: TodoistTask[] }>) => {
    const [tasks, setTasks] = useState(props.v);
    useEffect(() => {
        cachedApi.getTasks().then(i => i && setTasks(i))
    }, []);
    return <TodoContext.Provider value={[tasks, setTasks]}>{props.children}</TodoContext.Provider>
}

export const updateProject = (id: string, p: Partial<TodoistTask>, val: OfState<TodoistProject[]>) => {
    console.log("Sending", p)
    const [items, setItems] = val;
    const item = items.find(i => i.id === id);
    if (item) {
        setItems([...items.filter(i => i !== item), {
            ...item,
            ...p
        }]);
    }
    return Promise.resolve({} as TodoistTask);
}

export const createProject = (p: Partial<TodoistProject>, val: OfState<TodoistProject[]>) => {
    console.log("Sending", p)
    const [items, setItems] = val;
    const newProject: TodoistProject = {
        id: Math.random().toLocaleString(),
        name: "assad",
        order: 1,
        ...p,
    };
    setItems([...items, newProject]);
    return Promise.resolve({} as TodoistTask);
}

export const updateTask = (p: Partial<TodoistTask> & Pick<TodoistTask, 'id'>, val: OfState<TodoistTask[]>) => {
    console.log("Sending", p)
    const [items, setItems] = val;
    const item = items.find(i => i.id === p.id);
    if (item) {        
        setItems([...items.filter(i => i !== item), {
            ...item,
            ...p
        }]);
    }

    return cachedApi.update(p);
}

export const createTask = (p: Partial<TodoistTask> & Pick<TodoistTask, 'project_id' >, val: OfState<TodoistTask[]>) => {
    console.log("Sending", p)
    const [items, setItems] = val;
    return cachedApi.createTask(p).then(i => {
        setItems([...items, i]);
        return i;
    });
}

function delay<T extends (...args: any) => any>(fn: T, ms: number) {
    let timer = 0
    return function (...args: Parameters<T>) {
        clearTimeout(timer)
        timer = setTimeout(fn.bind(this as any, ...args as any), ms || 0)
    }
}

export function then<Y, Z, P extends any[]>(first: (...args: P) => Promise<Y>, then: (arg: Y) => Z) {
    return function (...args: P) {
        console.log("thenargs", args)
        return first(...args).then(i => then(i))
    }
}

function focus(...args: any) {
    (document.querySelector(`li[id='${args[0].id}'] input[type='text']`) as HTMLInputElement)?.focus();
    return args;
}

type TaskChange = {
    order: Record<TodoistTask['id'], TodoistTask['order']>,
    changes: Partial<TodoistTask>[];
}

type TodoistTaskId = Partial<TodoistTask> & Pick<TodoistTask, 'id'>;

export const useTodoContext = (state: OfState<Partial<TodoistTask>>) => {
    const [pendingChanges, setPendingChanges] = useState<TaskChange>({
        changes: [],
        order: {}
    });

    const val = useContext(TodoContext);
    if (!val) {
        throw new Error("AAA");
    }

    const [items, setItems] = val;

    const setNewItems = (...todos: (Partial<TodoistTask> & Pick<TodoistTask, 'id'>)[]) => {
        setItems([...items.filter(i => !todos.some(j => j.id === i.id)), ...todos.map(i => {
            const existing = items.find(j => j.id === i.id);
            if (!existing) {
                throw new Error("AAAA");
            }
            return {
                ...existing,
                ...i,
            } as TodoistTask;
        })]);
        
    }

    return {
        todos: items,
        get: (id: string) => {
            const todo = items.find(i => i.id === id);
            function resetChanges<T>(args: T) {
                setPendingChanges({
                    changes: [],
                    order: {}
                })
                return args;
            }

            const update = then(updateTask, (i: TodoistTask) => resetChanges(i));
            const delayedUpdate = useMemo(() => delay(update, 1000), [id]);

            if (!todo) {
                throw new Error("AAA");
            }


            return {
                todo: todo,
                children: items.filter(i => i.parent_id === todo.id),
                update: (p: Partial<TodoistTask>) => {
                    const item = items.find(i => i.id === id);
                    if (item) {
                        console.log("hasitem");
                        setItems([...items.filter(i => i !== item), {
                            ...item,
                            ...p
                        }]);
                    }

                    const { is_completed, ...rest } = p;

                    if (is_completed !== undefined) {
                        if (is_completed) {
                            cachedApi.complete(p.id ?? todo.id);
                        } else {
                            cachedApi.uncomplete(p.id ?? todo.id);
                        }
                        return;
                    }

                    delayedUpdate({
                        id: todo.id,
                        ...rest
                    }, val)
                },
                moveUp: () => {
                    const up = items
                        .filter(i => i.project_id === todo.project_id && i.parent_id === todo.parent_id && todo.id !== i.id)
                        .reduce<TodoistTask | undefined>((closest, item) => (todo.order - item.order > 0) && (item.order > (closest?.order ?? Number.MIN_SAFE_INTEGER)) ? item : closest, undefined)
                    
                    const options = items
                        .filter(i => i.project_id === todo.project_id && i.parent_id === todo.parent_id);

                    console.log(options.map(item => { return { a: todo.order - item.order, c: item.content, o: item.order } }))
                    console.log(up);
                    if (up) {
                        setPendingChanges({
                            changes: pendingChanges.changes,
                            order: {
                                ...pendingChanges.order,
                                [up.id]: todo.order,
                                [todo.id]: up.order,
                            }
                        });

                        setNewItems({
                            id: todo.id,
                            order: up.order
                        }, {
                            id: up.id,
                            order: todo.order
                        })
                    }
                },
                moveDown: () => {
                    const down = items
                        .filter(i => i.project_id === todo.project_id && i.parent_id === todo.parent_id && todo.id !== i.id)
                        .reduce<TodoistTask | undefined>((closest, item) => (todo.order - item.order < 0) && (item.order < (closest?.order ?? Number.MAX_SAFE_INTEGER)) ? item : closest, undefined)
                    if (down) {
                        setPendingChanges({
                            changes: pendingChanges.changes,
                            order: {
                                ...pendingChanges.order,
                                [down.id]: todo.order,
                                [todo.id]: down.order,
                            }
                        });

                        setNewItems({
                            id: todo.id,
                            order: down.order
                        }, {
                            id: down.id,
                            order: todo.order
                        })
                    }
                }
            }
        },
        create: (p: Partial<TodoistTask> & Pick<TodoistTask, 'project_id'>) => createTask(p, val)
    }
}

export const ProjectContext = React.createContext<OfState<TodoistProject[]> | undefined>(undefined);
export const ProjectContextProvider = (props: PropsWithChildren<{ v: TodoistProject[] }>) => {
    const [state, setState] = useState(props.v);
    useEffect(() => {
        cachedApi.getProjects().then(i => setState(i));
    }, []);
    return <ProjectContext.Provider value={[state, setState]}>{props.children}</ProjectContext.Provider>
}

export const useProjectContext = (state: OfState<Partial<TodoistProject>>) => {
    const [changes, setChanges] = state;
    const val = useContext(ProjectContext);
    if (!val) {
        throw new Error("AAA");
    }

    const [projects] = val;

    return {
        projects,
        get: (id: string) => {
            const project = projects.find(i => i.id === id);

            if (!project) {
                throw new Error("AAA");
            }

            const delayedUpdate = delay(updateProject, 200);
            const delayedCreate = createProject;

            return {
                project: {
                    ...project,
                    ...changes
                },
                children: projects.filter(i => i.parent_id === project.id),
                update: (p: Partial<TodoistProject>) => {
                    const fullChanges = {
                        ...changes,
                        ...p
                    };
                    setChanges(fullChanges);
                    delayedUpdate(project.id, p, val)
                },
                create: (p: Partial<TodoistProject>) => then(delayedCreate, focus)(p, val)
            }
        }
    }
}