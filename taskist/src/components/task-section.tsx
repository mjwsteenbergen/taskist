import { PropsWithChildren } from 'react';
import { TodoistTask } from '../fetch';
import { Todo } from './todo';

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
  onWaitingFor,
  onMoveUp,
  onMoveDown,
  onComplete,
}: {
  name?: string;
  big?: boolean;
  tasks: TodoistTask[];
  onWaitingFor?: (task: TodoistTask) => void;
  onMoveDown?: (task: TodoistTask) => void;
  onMoveUp?: (task: TodoistTask) => void;
  onComplete: (task: TodoistTask) => void;
}) => {
  if (tasks.length == 0) {
    return null;
  }

  return (
    <section>
      {name && <Header>{name}</Header>}
      {tasks.map((i) => {
        return (
          <Todo
            name={i.content}
            big={big}
            key={i.id}
            onWaitingFor={onWaitingFor && (() => onWaitingFor(i))}
            onMoveDown={onMoveDown && (() => onMoveDown(i))}
            onMoveUp={onMoveUp && (() => onMoveUp(i))}
            onComplete={() => onComplete(i)}
            tags={i.labels.map((i) => ({
              text: i,
            }))}
          />
        );
      })}
    </section>
  );
};
