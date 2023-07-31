import React, {
  PropsWithChildren,
  useState,
  useEffect,
  useContext,
} from 'react';
import { TodoistSection, usedApi, onlyCachedApi } from '../fetch';

export type OfState<T> = [T, (item: T) => void];
export const SectionContext = React.createContext<
  OfState<TodoistSection[]> | undefined
>(undefined);
export const SectionContextProvider = (props: PropsWithChildren<{}>) => {
  const [sections, setSections] = useState(onlyCachedApi.getSections() ?? []);
  useEffect(() => {
    usedApi.getSections().then((i) => i && setSections(i));
  }, []);
  return (
    <SectionContext.Provider value={[sections, setSections]}>
      {props.children}
    </SectionContext.Provider>
  );
};

export const useSectionContext = () => {
  const val = useContext(SectionContext);
  if (!val) {
    throw new Error('SectionContext not defined');
  }
  return val;
};
