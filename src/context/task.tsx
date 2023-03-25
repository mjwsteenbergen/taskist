import React, { PropsWithChildren, useContext, useEffect, useState } from "react";
import { TodoistTask, cachedApi, TodoistMoveArgs } from "../fetch";

export type OfState<T> = [T, (item: T) => void];
export const TodoContext = React.createContext<OfState<TodoistTask[]> | undefined>(undefined);
export const TodoContextProvider = (props: PropsWithChildren<{ v: TodoistTask[] }>) => {
    const [tasks, setTasks] = useState(props.v);
    useEffect(() => {
        cachedApi.getTasks().then(i => i && setTasks(i))
    }, []);
    return <TodoContext.Provider value={[tasks, setTasks]}>{props.children}</TodoContext.Provider>
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

    return cachedApi.updateTask(p);
}

export const createTask = (p: Partial<TodoistTask> & Pick<TodoistTask, 'project_id'>, val: OfState<TodoistTask[]>) => {
    console.log("Sending", p)
    const [items, setItems] = val;
    return cachedApi.createTask(p).then(i => {
        setItems([...items, i]);
        return i;
    });
}

type TodoistUpdate = Partial<Omit<TodoistTask, 'is_completed'>>
export type TodoistUpdateArg = TodoistUpdate & Pick<TodoistTask, "id">;

export function delay<T extends (...args: any) => any>(fn: T, ms: number) {
    let timer = 0
    return function (...args: Parameters<T>) {
        clearTimeout(timer)
        //@ts-ignore
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

    function resetChanges<T>(args: T) {
        setPendingChanges({
            changes: [],
            order: {}
        })
        return args;
    }

    const find = (id: string) => {
        const todo = items.find(i => i.id === id);
        if (!todo) {
            throw new Error("AAA");
        }
        return todo;
    }


    const update = then(updateTask, (i: TodoistTask) => resetChanges(i));
    const delayedUpdate = (task: TodoistUpdateArg) => () => {
        delay(update, 1000)({ ...task, id: task.id }, val)
    };

    return {
        todos: items,
        update: delayedUpdate,
        get: (id: string) => {
            const todo = find(id);
            return {
                todo: todo,
                children: items.filter(i => i.parent_id === todo.id),
                update: (p: TodoistUpdate) => updateTask({
                    ...p,
                    id: todo.id
                }, val),
                move: (t: TodoistMoveArgs) => {
                    setNewItems(t);
                    cachedApi.moveTask(t);
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
                },
                complete: () => {
                    if (todo.is_completed) {
                        cachedApi.uncomplete(todo.id);
                    } else {
                        cachedApi.complete(todo.id);
                    }
                    setNewItems({
                        id: todo.id,
                        is_completed: !todo.is_completed
                    })
                }
            }
        },
        create: (p: Partial<TodoistTask> & Pick<TodoistTask, 'project_id'>) => createTask(p, val)
    }
}

