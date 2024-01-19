import Checkbox from 'design-system-components/src/checkbox';
import { NavArrowDown, NavArrowUp, ArrowTr, Clock } from 'iconoir-react';
import { Badge } from './badge';
import { TodoText } from './todo-text';
import { cva } from 'class-variance-authority';
import { useCompleteTaskMutation, useUnCompleteTaskMutation } from '../hooks/todoistHooks';
import { TodoistTask } from '../todoist/types';
import { useMoveReadyToPickUp, useMoveToDefaultSection, useMoveToInProgress, useProjectFromTask, useToggleWaitingForMutation } from '../hooks/aggregateTodoistHooks';

export type MoveOptions  = "ready-to-pickup" | "move-to-in-progress" | "back-to-default";

type TodoProps = {
  task: TodoistTask
  showWaitingFor?: boolean,
  moveDown?: MoveOptions,
  moveUp?: MoveOptions,
  onMoveUp?: typeof useMoveReadyToPickUp;
  onMoveDown?: typeof useMoveReadyToPickUp;
  big?: boolean;
};

const checkboxVariant = cva('', {
  variants: {
    big: {
      true: 'w-10 h-10 lg:w-20 lg:h-20 border-4',
      false: 'w-5 h-5 lg:w-10 lg:h-10',
    },
  },
  defaultVariants: {
    big: false,
  },
});

const componentWrapperVariant = cva('group flex items-center h-20', {
  variants: {
    big: {
      true: 'h-20 lg:h-40 gap-x-14',
      false: 'h-14 lg:h-20 gap-x-4',
    },
  },
  defaultVariants: {
    big: false,
  },
});

export const Todo = ({
  task,
  big,
  showWaitingFor,
  moveDown,
  moveUp
}: TodoProps) => {
  const project = useProjectFromTask(task);

  const complete = useCompleteTaskMutation(task);
  const uncomplete = useUnCompleteTaskMutation(task);
  const { mutate: toggleWaitingFor } = useToggleWaitingForMutation(task);
  const { mutate: toggleChecked } = task.is_completed ? uncomplete : complete;

  const { mutate: moveToReady } = useMoveReadyToPickUp(task);
  const { mutate: moveToInProgress } = useMoveToInProgress(task);
  const { mutate: moveToDefault } = useMoveToDefaultSection(task);

  const map: Record<MoveOptions, () => void> = {
    "move-to-in-progress": moveToInProgress,
    "ready-to-pickup": moveToReady,
    "back-to-default": moveToDefault
  }


  return (
    <div className={componentWrapperVariant({ big })}>
      <Checkbox
        checked={task.is_completed}
        classname={checkboxVariant({ big })}
        onCheckedChange={() => toggleChecked()}
      />
      <div className="">
        <TodoText big={big} text={task.content} />
        <div className="gap-x-2 overflow-hidden flex max-h-0 group-hover:max-h-12 transition-all duration-150">
          {project && <Badge name={project.name} color={(project.color ?? "red") as any} link={"https://todoist.com/app/project/" + project.id}/>}
          {moveDown && (
            <Badge onClick={map[moveDown]}>
              <NavArrowDown />
            </Badge>
          )}
          {moveUp && (
            <Badge onClick={map[moveUp]}>
              <NavArrowUp />
            </Badge>
          )}
          {showWaitingFor && <Badge onClick={() => toggleWaitingFor()}><Clock height={15}/></Badge>}
          {task.labels.map((i) => (
            <Badge name={i} />
          ))}
          {task.url && <Badge name={<ArrowTr height={15}/>} link={task.url}/>}
        </div>
      </div>
    </div>
  );
};
