import { PropsWithChildren, useMemo } from "react";
import {
  useTodoistTasks,
  useTodoistSections,
  IN_PROGRESS,
  TODAY,
  useToggleLabelMutation,
  WAITING_FOR,
} from "../hooks/todoistHooks";
import {
  notWaitingFor,
  sectionHasName,
  useToMoveNextUp,
  useMoveToInProgress,
} from "../hooks/aggregateTodoistHooks";
import { TaskSection } from "./task-section";
import { Todo } from "./todo";
import { Badge } from "./badge";
import { Calendar, Clock, NavArrowDown, NavArrowUp } from "iconoir-react";
import { TodoistSection, TodoistTask } from "../todoist/types";

const WaitingForBadge = ({ task }: { task: TodoistTask }) => {
  const { mutate: toggleWaitingFor } = useToggleLabelMutation(
    task,
    WAITING_FOR
  );

  return (
    <Badge onClick={() => toggleWaitingFor()}>
      <Clock height={15} />
    </Badge>
  );
};

const MoveToNextUpBadge = ({
  task,
  children,
}: PropsWithChildren<{ task: TodoistTask }>) => {
  const { mutate: moveToNextUp } = useToMoveNextUp(task);
  return <Badge onClick={() => moveToNextUp()}>{children}</Badge>;
};

const MoveToInProgressBadge = ({ task }: { task: TodoistTask }) => {
  const { mutate: moveToInProgress } = useMoveToInProgress(task);
  return (
    <Badge onClick={() => moveToInProgress()}>
      <NavArrowUp height={15} />
    </Badge>
  );
};

const ToggleTodayBadge = ({ task }: { task: TodoistTask }) => {
  const { mutate: toggleTodayLabel } = useToggleLabelMutation(task, TODAY);

  const text = useMemo(() => {
    if (task.labels.includes(TODAY)) {
      return "Remove from today";
    }
    return "Add to today";
  }, [task.labels]);

  return (
    <Badge onClick={() => toggleTodayLabel()}>
      <Calendar height={15} /> {text}
    </Badge>
  );
};

export const InProgressSection = () => {
  const { data: tasks } = useTodoistTasks();
  const { data: sections } = useTodoistSections();

  const inProgressTasks = useMemo(() => {
    return (tasks ?? [])
      .filter((i) =>
        sectionHasName(IN_PROGRESS, sections ?? [])
          .map((i) => i.id)
          .includes(i.section_id ?? "")
      )
      .filter(notWaitingFor);
  }, [tasks, sections]);

  return (
    inProgressTasks.length > 0 && (
      <TaskSection>
        {inProgressTasks.map((task) => {
          return (
            <Todo big task={task} key={task.id}>
              <WaitingForBadge task={task} />
              <MoveToNextUpBadge task={task}>
                <NavArrowDown />
              </MoveToNextUpBadge>
            </Todo>
          );
        })}
      </TaskSection>
    )
  );
};

export const TodaySection = () => {
  const { data: tasks } = useTodoistTasks();
  const { data: sections } = useTodoistSections();
  if (tasks === undefined) {
    return [];
  }
  const todayTasks = tasks
    .filter((i) => i.labels.includes(TODAY))
    .filter(
      (i) =>
        !sectionHasName(IN_PROGRESS, sections ?? []).some(
          (section) => section.id === i.section_id
        )
    );

  return (
    todayTasks.length > 0 && (
      <TaskSection name="Today">
        {todayTasks.map((task) => {
          return (
            <Todo task={task} key={task.id}>
              <ToggleTodayBadge task={task} />
              <MoveToInProgressBadge task={task} />
            </Todo>
          );
        })}
      </TaskSection>
    )
  );
};

export const OverdueSection = () => {
  const { data: tasks } = useTodoistTasks();
  if (tasks === undefined) {
    return [];
  }

  const overDueTasks = tasks.filter(
    (i) => Date.parse(i.due?.date ?? Date.now().toString()) < Date.now()
  );

  return (
    overDueTasks.length > 0 && (
      <TaskSection name="Overdue">
        {overDueTasks.map((task) => {
          return (
            <Todo task={task} key={task.id}>
              <MoveToInProgressBadge task={task} />
            </Todo>
          );
        })}
      </TaskSection>
    )
  );
};

export const WaitingForSection = () => {
  const { data: tasks } = useTodoistTasks();
  if (tasks === undefined) {
    return [];
  }
  const waitingForTasks = tasks.filter((i) => i.labels.includes(WAITING_FOR));

  return (
    waitingForTasks.length > 0 && (
      <TaskSection name="Waiting for">
        {waitingForTasks.map((task) => {
          return (
            <Todo task={task} key={task.id}>
              <WaitingForBadge task={task} />
            </Todo>
          );
        })}
      </TaskSection>
    )
  );
};

export const NextUpSection = () => {
  const { data: tasks } = useTodoistTasks();
  const { data: sections } = useTodoistSections();
  const tasksInSection = (tasks: TodoistTask[], sections: TodoistSection[]) => {
    const sectionIds = sections.map((i) => i.id);
    return tasks.filter((i) => sectionIds.includes(i.section_id ?? ""));
  };

  if (tasks === undefined || sections === undefined) {
    return [];
  }

  const nextUpTasks = tasksInSection(
    tasks,
    sectionHasName("Next Up", sections)
  ).filter((i) => !i.labels.includes(TODAY));

  return (
    nextUpTasks.length > 0 && (
      <TaskSection name="Next up">
        {nextUpTasks.map((task) => {
          return (
            <Todo task={task} key={task.id}>
              <ToggleTodayBadge task={task} />
            </Todo>
          );
        })}
      </TaskSection>
    )
  );
};
