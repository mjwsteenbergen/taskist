import React, { PropsWithChildren, useState, useEffect, useContext } from "react";
import { TodoistProject, cachedApi, TodoistTask } from "../fetch";
import { delay, OfState, then } from "./task";

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