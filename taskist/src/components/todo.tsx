import Checkbox from "design-system-components/src/checkbox";
import { ArrowTr } from "iconoir-react";
import { Badge } from "./badge";
import { TodoText } from "./todo-text";
import { cva } from "class-variance-authority";
import {
  useCompleteTaskMutation,
  useUnCompleteTaskMutation,
} from "../hooks/todoistHooks";
import { TodoistTask } from "../todoist/types";
import { useProjectFromTask } from "../hooks/aggregateTodoistHooks";
import { PropsWithChildren } from "react";

const checkboxVariant = cva("", {
  variants: {
    big: {
      true: "w-10 h-10 lg:w-20 lg:h-20 border-4",
      false: "w-5 h-5 lg:w-10 lg:h-10",
    },
  },
  defaultVariants: {
    big: false,
  },
});

const componentWrapperVariant = cva("group flex items-center h-20", {
  variants: {
    big: {
      true: "h-20 lg:h-40 gap-x-14",
      false: "h-14 lg:h-20 gap-x-4",
    },
  },
  defaultVariants: {
    big: false,
  },
});

export const Todo = ({
  task,
  big,
  children,
}: PropsWithChildren<{
  task: TodoistTask;
  big?: boolean;
}>) => {
  const project = useProjectFromTask(task);

  const complete = useCompleteTaskMutation(task);
  const uncomplete = useUnCompleteTaskMutation(task);
  const { mutate: toggleChecked } = task.is_completed ? uncomplete : complete;

  return (
    <div className={componentWrapperVariant({ big })}>
      <Checkbox
        checked={task.is_completed}
        classname={checkboxVariant({ big })}
        onCheckedChange={() => toggleChecked()}
      />
      <div>
        <TodoText
          isCompleted={task.is_completed}
          big={big}
          text={task.content}
        />
        <div className="gap-x-2 overflow-hidden flex max-h-0 group-hover:max-h-12 transition-all duration-150">
          {project && (
            <Badge
              name={project.name}
              color={(project.color ?? "red") as any}
              link={"https://todoist.com/app/project/" + project.id}
            />
          )}
          {task.labels.map((i) => (
            <Badge name={i} color="grey" />
          ))}
          {children}
          {task.url && <Badge name={<ArrowTr height={15} />} link={task.url} />}
        </div>
      </div>
    </div>
  );
};
