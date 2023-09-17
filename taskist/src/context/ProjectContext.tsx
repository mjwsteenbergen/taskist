import React, {
  PropsWithChildren,
  useState,
  useEffect,
  useContext,
} from 'react';
import { TodoistProject } from '../fetch';
import { useTodoistApiContext } from './TodoistApiContext';

export type OfState<T> = [T, (item: T) => void];
export const ProjectContext = React.createContext<
  OfState<TodoistProject[]> | undefined
>(undefined);
export const ProjectContextProvider = (props: PropsWithChildren<{}>) => {
  const { api, onlyCachedApi} = useTodoistApiContext();
  const [projects, setProjects] = useState(onlyCachedApi.getProjects() ?? []);
  useEffect(() => {
    api.getProjects().then((i) => i && setProjects(i));
  }, []);
  return (
    <ProjectContext.Provider value={[projects, setProjects]}>
      {props.children}
    </ProjectContext.Provider>
  );
};

export const useProjectContext = () => {
  const val = useContext(ProjectContext);
  if (!val) {
    throw new Error('ProjectContext not defined');
  }
  return val;
};
