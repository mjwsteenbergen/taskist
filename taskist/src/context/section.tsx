import React, { useContext } from "react";
import { PropsWithChildren, useState, useEffect } from "react";
import { TodoistProject, cachedApi, TodoistSection } from "../fetch";
import { OfState } from "./task";

export const SectionContext = React.createContext<OfState<TodoistSection[]> | undefined>(undefined);

export const SectionContextProvider = (props: PropsWithChildren<{ v: TodoistSection[] }>) => {
    const [state, setState] = useState(props.v);
    useEffect(() => {
        cachedApi.getSections().then(i => setState(i));
    }, []);
    return <SectionContext.Provider value={[state, setState]}>{props.children}</SectionContext.Provider>
}

export const useSectionContext = () => {
    const val = useContext(SectionContext);
    if (!val) {
        throw new Error("AAA");
    }

    const [sections, setSections] = val;

    return {
        sectionsOfProject: (id: string | TodoistProject) => sections.filter(i => i.project_id === ((typeof id === 'object') ? id.parent_id : id)),
        createSection: async (partial_section: Parameters<typeof cachedApi.createSection>[0]) => {
            const section = await cachedApi.createSection(partial_section);
            setSections([...sections, section]);
            return section;
        },
        sections
    }
}
