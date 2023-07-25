import React, {
  PropsWithChildren,
  useState,
  useEffect,
  useContext,
} from 'react';
import { TodoistTask, cachedApi, onlyCachedApi } from '../fetch';

export type OfState<T> = [T, (item: T) => void];
export const TodoContext = React.createContext<
  OfState<TodoistTask[]> | undefined
>(undefined);
export const TodoContextProvider = (props: PropsWithChildren<{}>) => {
  const [tasks, setTasks] = useState(onlyCachedApi.getTasks() ?? []);
  useEffect(() => {
    cachedApi.getTasks().then((i) => i && setTasks(i));
  }, []);
  return (
    <TodoContext.Provider value={[tasks, setTasks]}>
      {props.children}
    </TodoContext.Provider>
  );
};

export const useTodoContext = () => {
  const val = useContext(TodoContext);
  if (!val) {
    throw new Error('TodoContext not defined');
  }
  return val;
};
