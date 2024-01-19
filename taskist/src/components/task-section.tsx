import { PropsWithChildren } from 'react';
import { MoveOptions, Todo } from './todo';
import { TodoistTask } from '../todoist/types';

export const Header = ({
  children,
  classname,
}: PropsWithChildren<{ classname?: string }>) => {
  return <h2 className={'lg:text-6xl mb-6 ' + classname}>{children}</h2>;
};

export const TaskSection = ({
  name,
  tasks,
  big,
  showWaitingFor,
  moveDown,
  moveUp
}: {
  name?: string;
  big?: boolean;
  tasks: TodoistTask[];
  showWaitingFor?: boolean,
  moveDown?: MoveOptions,
  moveUp?: MoveOptions,
}) => {
  if (tasks.length == 0) {
    return null;
  }

  return (
    <section>
      {name && <Header>{name}</Header>}
      {tasks.map((task) => {
        return (
          <Todo
            task={task}
            big={big}
            key={task.id}
            showWaitingFor={showWaitingFor}
            moveDown={moveDown}
            moveUp={moveUp}
          />
        );
      })}
    </section>
  );
};
