import { KeyboardEventHandler, useState } from "react";
import { TodoistProject, TodoistTask } from "./fetch";
import { Task } from "./task";
import { useProjectContext, useTodoContext } from "./updates";


type ProjectProps = {
    proj: string
}
export const Project = ({ proj: proj_id }: ProjectProps) => {
    const { get, projects } = useProjectContext(useState<Partial<TodoistProject>>({}));
    const { todos, create:createTask } = useTodoContext(useState<Partial<TodoistTask>>({}));

    const { project, children: subProjects, create, update } = get(proj_id);

    let projHtml = <></>
    if (subProjects.length > 0) {
        projHtml = <ul>{subProjects.sort((a, b) => a.order - b.order).map(i => <Project key={i.id} proj={i.id} />)}</ul>
    }

    const tasks = todos.filter(i => i.parent_id === null && i.project_id === proj_id)
    let taskHtml = <></>
    if (tasks.length > 0) {
        taskHtml = <ul>{tasks.sort((a, b) => a.order - b.order).map(i => <Task key={i.id} task={i.id} />)}</ul>
    }

    const kd: KeyboardEventHandler<HTMLDivElement> = (event) => {
        if (event.shiftKey) {
            switch (event.key) {
                case "Enter":
                    createTask({
                        order: 1,
                        content: "new task",
                        parent_id: null,
                        project_id: proj_id
                    });
                    break;
            }
        }
        if (event.altKey) {
            switch (event.key) {
                case "ArrowRight":
                    console.log(project);
                    const similar = projects.filter(i => i.parent_id === project.parent_id);
                    console.log(similar);
                    const myIndex = similar.findIndex(i => i.id === project.id);
                    console.log(myIndex);
                    if (myIndex > 0) {
                        update({
                            parent_id: similar[myIndex - 1].id,
                        });
                    }

                    break;
                case "ArrowLeft":
                    const parent = projects.find(i => i.id === project.parent_id)
                    update({
                        parent_id: parent?.parent_id ?? null,
                    })
                    event.stopPropagation();
                    event.preventDefault();
                    event.stopPropagation();
                case 'ArrowUp':
                    update({
                        order: project.order - 1
                    });
                    event.stopPropagation();
                    event.preventDefault();
                    event.stopPropagation();
                    break;
                case 'ArrowDown':
                    update({
                        order: project.order + 1
                    });
                    event.stopPropagation();
                    event.preventDefault();
                    event.stopPropagation();
                    break;
            }
        }
        if (event.ctrlKey) {
            console.log(event.key);
            switch (event.key) {
                case "Enter":
                    create({
                        name: "new project",
                        parent_id: project.parent_id,
                    }).then(i => {
                        (document.querySelector(`li[id='${i.id}'] input[type='text']`) as HTMLInputElement)?.select();
                    });
                    break;

            }
        }
    }

    return <li className={'list-none mt-2'} id={project.id}>
        <div className="pl-4 pt-2 pb-2 text-3xl flex items-center  focus-within:bg-gray-50 dark:focus-within:bg-gray-400 rounded-md" onKeyDown={kd} >
            <input type='text' defaultValue={project.name} className={'font-bold text-3xl bg-transparent focus:bg-transparent focus-visible:border-none focus-visible:outline-none'} />
        </div>
        {projHtml}
        {taskHtml}
    </li>
}