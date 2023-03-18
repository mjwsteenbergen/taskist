import { KeyboardEvent, useState } from "react"
import { TodoistTask } from "./fetch"
import { Project } from "./project"
import { useProjectContext, useTodoContext } from "./updates"




type TaskProps = {
    task: string
}
export const Task = (props: TaskProps) => {
    const { get, todos, create } = useTodoContext(useState<Partial<TodoistTask>>({}));
    const { todo: task, update, children, moveDown, moveUp } = get(props.task);


    const kd = (e: KeyboardEvent) => {
        if (e.shiftKey) {
            switch (e.key) {
                case 'Enter':
                    create({
                        order: task.order + 1,
                        content: "new task",
                        parent_id: task.parent_id,
                        project_id: task.project_id
                    }).then(i => {
                        setTimeout(() => {
                            (document.querySelector(`li[id='${i.id}'] input[type='text']`) as HTMLInputElement)?.select();
                        }, 100)
                    });
                    break;
            }
        }
        if (e.altKey) {
            console.log(e.key);
            switch (e.key) {
                case 'ArrowUp':
                    moveUp();
                    e.stopPropagation();
                    e.preventDefault();
                    e.stopPropagation();
                    break;
                case 'ArrowDown':
                    moveDown();
                    e.stopPropagation();
                    e.preventDefault();
                    e.stopPropagation();
                    break;
                case "ArrowLeft":
                    const parent = todos.find(i => i.id === task.parent_id)
                    update({
                        parent_id: parent?.parent_id ?? null,
                        order: parent?.order ?? task.order
                    })
                    e.stopPropagation();
                    e.preventDefault();
                    e.stopPropagation();
            }
        }
        if (e.ctrlKey) {
            console.log(e.key);
            switch (e.key) {
                case 'Enter':
                    update({
                        is_completed: !task.is_completed
                    });
                    e.preventDefault();
                    e.stopPropagation();
                    break;
                case 'e':
                case 'E':
                    e.preventDefault();
                    e.stopPropagation();
                    break;
                case 'n':
                    console.log("a")
                    e.bubbles = false;
                    e.defaultPrevented = true;
                    e.stopPropagation();
                    e.preventDefault();
                    e.stopPropagation();
                    break;

            }
        }
    }

    const titleClasses = 'ml-4 w-[80ch] max-w-screen-md text-3xl bg-transparent focus-visible:border-none focus-visible:outline-none ' + (task.is_completed ? "line-through" : "")

    let text = <input type='text' defaultValue={task.content} className={"bg-transparent " + titleClasses} onChange={(e) => update({
        content: e.currentTarget.value
    })} />;

    const mdLink = new RegExp(/\[(.+)\]\((.+)\)/g).exec(task.content);
    const tdLink = new RegExp(/(https?:\/\/[^ ]+) \((.+)\)/g).exec(task.content);
    if (mdLink ?? tdLink) {
        const { link, linktext } = mdLink ? {
            link: mdLink[2],
            linktext: mdLink[1]
        } : {
            link: tdLink?.[1],
            linktext: tdLink?.[2]
        }

        text = <a target='_blank' className={titleClasses + " whitespace-nowrap overflow-hidden text-gray-300 dark:text-gray-500"} href={link}>{linktext}</a>
    }

    let subTaskHtml = <></>;
    if (children.length > 0) {
        subTaskHtml = <ul>
            {children.sort((a, b) => a.order - b.order).map(i => <Task key={i.id} task={i.id} />)}
        </ul>
    }

    let date = <></>;
    if (task.due) {
        date = <input type="date" className="ml-4 text-sm text-gray-300" defaultValue={task.due.date} onChange={(e) => {
            update({
                due: {
                    ...task.due!,
                    date: e.target.value
                }
            })
        }} />
    }

    const borderBase = "border-l-4 rounded-l-none"

    const prios = {
        1: "",
        2: "border-l-blue-400 " + borderBase,
        3: "border-l-green-400 " + borderBase,
        4: "border-l-red-200 " + borderBase,
    }

    const border = prios[task.priority];


    return <li onKeyDown={kd} className={"list-none "} id={task.id}>
        <div className={"pl-4 pt-2 pb-2 text-3xl flex items-center focus-within:bg-gray-50 dark:focus-within:bg-gray-400 rounded-md " + border}>
            <input type='checkbox' className={"scale-150"} checked={task.is_completed} tabIndex={-1} onChange={() => { update({ is_completed: !task.is_completed }) }} />
            {text}
            {/* <span>{date}</span> */}
        </div>
        {subTaskHtml}
    </li>
}

export type OfState<T> = [T, (item: T) => void];


export const RootProjects = () => {
    const { projects } = useProjectContext(useState({}));
    const projs = projects.find(i => i.name === "Projects");
    return <>
        <ul>{projects.filter(i => i.parent_id === projs?.id).sort((a, b) => a.order - b.order).map(i => <Project key={i.id} proj={i.id} />)}</ul>
    </>
}