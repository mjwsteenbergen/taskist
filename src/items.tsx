import { ComponentProps, FC, PropsWithChildren, useState } from "react";
import { useProjectContext } from "./context/project";
import { useSectionContext } from "./context/section";
import { useTodoContext } from "./context/task";
import { cachedApi, TodoistProject, TodoistTask } from "./fetch";
import { NavDown } from "./icons/navdown";
import { NavUp } from "./icons/up";

const IN_PROGRESS = "In Progress";
const READY_TO_PICKUP = "Ready To Pickup";
const WAITING_FOR = "waiting-for";


export const Tasks = () => {
    const { todos } = useTodoContext(useState<Partial<TodoistTask>>({}));
    const { projects } = useProjectContext(useState<Partial<TodoistProject>>({}));
    const { sections } = useSectionContext();
    const methods_for = getMethods();

    const inProgress = sections.filter(i => i.name === "In Progress").map(i => i.id);
    const ready_sections = sections.filter(i => i.name === READY_TO_PICKUP).map(i => i.id);
    const projects_project = projects.find(i => i.name === "Projects");
    const projects_projects = projects.filter(i => i.parent_id === projects_project?.id);

    const working_on = todos.filter(i => inProgress.includes(i.section_id) && !i.labels.includes(WAITING_FOR));
    const ready = todos.filter(i => ready_sections.includes(i.section_id));
    const overdue = todos.filter(i => Date.parse(i.due?.date ?? Date.now().toString()) < Date.now())
    const waiting_for = todos.filter(i => i.labels.includes(WAITING_FOR));
    const next_up = todos.filter(i => i.section_id === null && projects_projects.some(j => j.id === i.project_id));


    return <div className="flex flex-col justify-center content-around">
        {working_on.length> 0  ? <>
            {/* <h2 className="text-5xl">Working on right now</h2> */}
            <ul className="mb-10">
                {working_on.map(i => {
                    const { moveToReadyToPickUp, addWaitingFor, complete } = methods_for(i);
                    return <Task key={i.id} task={i} variant={"big"} onDown={moveToReadyToPickUp} onWaiting={addWaitingFor} onComplete={complete} />
                })}
            </ul>
        </> : ""}
        

        {ready.length > 0 ? <>
            <h2 className="text-5xl">Ready to Pickup</h2>
            <ul>
                {ready.map(i => {
                    const { moveToInProgress, addWaitingFor, complete } = methods_for(i);
                    return <Task key={i.id} task={i} onUp={moveToInProgress} onWaiting={addWaitingFor} onComplete={complete} />
                })}
            </ul>
        </> : ""}

        {waiting_for.length > 0 ? <>
            <h2 className="text-5xl">Waiting for</h2>
            <ul>
                {waiting_for.map(i => {
                    const { removeWaitingFor, complete } = methods_for(i);
                    return <Task key={i.id} task={i} onWaiting={removeWaitingFor} onComplete={complete} />
                })}
            </ul>
        </> : ""}
        

        {ready.length === 0 && working_on.length === 0 && overdue.length > 0 ? <>
            <h2 className="text-5xl">Overdue</h2>
            <ul>
                {overdue.map(i => {
                    const { moveToReadyToPickUp, complete } = methods_for(i);
                    return <Task key={i.id} task={i} onUp={moveToReadyToPickUp} onComplete={complete} />
                })}
            </ul>
        </> : ""}

        {ready.length === 0 && working_on.length === 0 && next_up.length > 0 ? <>
            <h2 className="text-5xl">Next up</h2>
            <ul>
                {next_up.map(i => {
                    const { moveToReadyToPickUp, complete } = methods_for(i);
                    return <Task key={i.id} task={i} onUp={moveToReadyToPickUp} onComplete={complete} />
                })}
            </ul>
        </> : ""}
    </div>
}

const getMethods = () => {
    const { get } = useTodoContext(useState<Partial<TodoistTask>>({}));
    const { sectionsOfProject, createSection } = useSectionContext();

    return (t: TodoistTask) => {
        const { update, move, complete } = get(t.id);
    
        return {
            moveToReadyToPickUp: async () => {
                const sections = sectionsOfProject(t.project_id);
                let readyToPickUpSection = sections.find(i => i.name === READY_TO_PICKUP)
                if (!readyToPickUpSection) {
                    readyToPickUpSection = await createSection({
                        name: READY_TO_PICKUP,
                        project_id: t.project_id
                    });
                }
                move({
                    id: t.id,
                    section_id: readyToPickUpSection.id
                })
            },
            moveToInProgress: async () => {
                const sections = sectionsOfProject(t.project_id);
                let readyToPickUpSection = sections.find(i => i.name === IN_PROGRESS)
                if (!readyToPickUpSection) {
                    readyToPickUpSection = await createSection({
                        name: IN_PROGRESS,
                        project_id: t.project_id
                    });
                }
                move({
                    id: t.id,
                    section_id: readyToPickUpSection.id
                })
            },
            complete,
            addWaitingFor: () => {
                update({
                    labels: [...t.labels, WAITING_FOR]
                })
            },
            removeWaitingFor: () => {
                update({
                    labels: t.labels.filter(i => i !== WAITING_FOR)
                })
            }
        }
    }
}

type Props = {
    task: TodoistTask;
    onUp?: () => void;
    onDown?: () => void;
    onWaiting?: () => void;
    onComplete: () => void;
    variant?: "big";
}

const Task = ({ task, variant, onUp, onDown, onWaiting, onComplete }: Props) => {
    const { projects } = useProjectContext(useState<Partial<TodoistProject>>({}));

    const project = projects.find(j => j.id === task.project_id);


    const textSize = variant === 'big' ? "text-8xl h-32" : "text-6xl h-24 ";

    const prios = {
        1: "",
        2: "group-hover:text-blue-400 ",
        3: "group-hover:text-purple-200 ",
        4: "group-hover:text-red-200 ",
    }

    const boxColor = prios[task.priority];

    const mdLink = new RegExp(/\[(.+)\]\((.+)\)/g).exec(task.content);
    const tdLink = new RegExp(/(https?:\/\/[^ ]+) \((.+)\)/g).exec(task.content);
    let textClasses = "leading-tight mb-0 truncate max-w-[1500px]";
    let text = <p className={textClasses}>{task.content}</p>
    if (mdLink ?? tdLink) {
        const { link, linktext } = mdLink ? {
            link: mdLink[2],
            linktext: mdLink[1]
        } : {
            link: tdLink?.[1],
            linktext: tdLink?.[2]
        }

        text = <a target='_blank' className={textClasses + " reset text-gray-300 dark:text-gray-500"} href={link}>{linktext}</a>
    }

    return <li className={"flex gap-3 items-center overflow-hidden hover:overflow-visible relative group " + textSize}>
        <span onClick={onComplete} className={"cursor-pointer  " + boxColor}>{task.is_completed ? "☑" : "☐"}</span>
        <div className="flex flex-col justify-center content-center">
            {text}
            <div className="extra-bar transition-all duration-200 h-auto flex gap-2">
                <Badge name={"#" + project?.name ?? ""} color={project?.color} link={"https://todoist.com/app/project/" + project?.id} />
                {task.labels.map(i => <Badge name={"@" + i} color={"blue"} />)}
            </div>
        </div>
        {onDown && <button onClick={onDown} className="p-2 invisible group-hover:visible"><NavDown /></button>}
        {onUp && <button onClick={onUp} className="p-2 invisible group-hover:visible"><NavUp /></button>}
        {onWaiting && <button onClick={onWaiting} className="p-2 invisible group-hover:visible text-xl">🕐</button>}

        </li>
}

type PProps = {
    name: string;
    color?: string;
    link?: string;
}

const map = {
    "berry_red": "bg-red-200",
    // "light_blue": "#96c3eb",
    "red": "bg-red-200",
    "blue": "bg-blue-400",
    // "orange": "#ff9933",
    // "grape": "#884dff",
    // "yellow": "#fad000",
    // "violet": "#af38eb",
    // "olive_green": "#afb83b",
    // "lavender": "#eb96eb",
    // "lime_green": "#7ecc49",
    // "magenta": "#e05194",
    // "green": "#299438",
    // "salmon": "#ff8d85",
    // "mint_green": "#6accbc",
    // "charcoal": "#808080",
    // "teal": "#158fad",
    // "grey": "#b8b8b8",
    // "sky_blue": "#14aaf5",
    // "taupe": "#ccac93",
}

const mapToColor = (color: (keyof typeof map) | string): string => {
    return (map as any)[color] ?? "bg-red-400";
}

const Badge = ({ name, color, link }: PProps) => {
    const className = "text-xs p-1 pl-2 pr-2 rounded-md text-white " + mapToColor(color ?? "");
    if (link) {
        return <a href={link} target="_blank" className={className + " reset"}>{name}</a>
    } else 
    return <span className={className}>
        {name}
    </span>
}