import { useMemo } from "react"
import { TodoistTask, TodoistSection, TodoistProject } from "../todoist/types";
import { WAITING_FOR, READY_TO_PICKUP, IN_PROGRESS, useTodoistTasks, useTodoistSections, useTodoistProjects, useAddWaitingForMutation, useRemovingWaitingForMutation, useMoveTask, optimisticallyUpdateTask, BASE_TASK } from "./todoistHooks";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTodoistApiContext } from "../context/TodoistApiContext";

const notWaitingFor = (i: TodoistTask) => !i.labels.includes(WAITING_FOR);
const sectionHasName = (name: string, sections: TodoistSection[]) => sections.filter((i) => i.name === name);
const tasksInSection = (tasks: TodoistTask[], sections: TodoistSection[]) => {
  const sectionIds = sections.map(i => i.id);
  return tasks.filter(i => sectionIds.includes(i.section_id ?? ""));
}

export const useOverdueTasks = () => {
  const { data: tasks } = useTodoistTasks();
  if (tasks === undefined) {
    return [];
  }
  return tasks.filter(
    (i) => Date.parse(i.due?.date ?? Date.now().toString()) < Date.now()
  )
}

export const useNextUpTasks = () => {
  const { data: tasks } = useTodoistTasks();
  const { data: sections } = useTodoistSections();

  if (tasks === undefined || sections === undefined) {
    return [];
  }

  return [...new Set(tasksInSection(tasks, sectionHasName("Next Up", sections)))]
}

export const useInProgressTasks = () => {
  const { data: tasks } = useTodoistTasks();
  const { data: sections } = useTodoistSections();

  return useMemo(() => {
    return (tasks ?? [])
      .filter((i) =>
        sectionHasName(IN_PROGRESS, sections ?? [])
          .map((i) => i.id)
          .includes(i.section_id ?? '')
      )
      .filter(notWaitingFor)
  }, [tasks, sections])
}

export const useWaitingForTasks = () => {
  const { data: tasks } = useTodoistTasks();
  if (tasks === undefined) {
    return [];
  }
  return tasks.filter(i => i.labels.includes(WAITING_FOR))
}



export const useReadyToPickupTasks = () => {
  const { data: tasks } = useTodoistTasks();
  const { data: sections } = useTodoistSections();

  if (tasks === undefined || sections === undefined) {
    return [];
  }
  const readySections = sections.filter((i) => i.name === READY_TO_PICKUP).map((i) => i.id);

  return tasks
    .filter((i) => readySections.includes(i.section_id ?? ''))
    .filter(notWaitingFor)
}


export const useProjectFromTask = (task: TodoistTask) => {
  const { data: projects } = useTodoistProjects();
  return (projects ?? []).find(i => i.id === task.project_id)
}

export const useSectionFromTask = (task: TodoistTask) => {
  const { data: sections } = useTodoistSections();
  return (sections ?? []).find(i => i.id === task.section_id)
}

export const useSectionFromProject = (project?: TodoistProject) => {
  const { data: sections } = useTodoistSections();
  if (project === undefined) {
    return [];
  }
  return (sections ?? []).filter(i => i.project_id === project.id)
}

export const useMoveToInProgress = (task: TodoistTask) => {
  const queryClient = useQueryClient();
  const project = useProjectFromTask(task);
  const sections = useSectionFromProject(project);
  const api = useTodoistApiContext();

  let inProgressSection = sections.find(
    (i) => i.name === IN_PROGRESS
  );

  return useMutation({
    mutationFn: async () => {
      
      if (!inProgressSection) {
        inProgressSection = await api.createSection({
          name: IN_PROGRESS,
          project_id: task.project_id,
        });
      }
      return await api.moveTask({
        id: task.id,
        section_id: inProgressSection.id,
      });
    },
    onSettled: () => queryClient.invalidateQueries({
      queryKey: ["tasks"]
    }),
    onMutate: async () => {
      await optimisticallyUpdateTask(queryClient, {
          id: task.id,
          section_id: inProgressSection?.id,
      })
  },
  })
}

export const useMoveReadyToPickUp = (task: TodoistTask) => {
  const queryClient = useQueryClient();
  const project = useProjectFromTask(task);
  const sections = useSectionFromProject(project);
  const api = useTodoistApiContext();
  let readyToPickUpSection = sections.find(
    (i) => i.name === READY_TO_PICKUP
  );

  return useMutation({
    mutationFn: async () => {
      
      if (!readyToPickUpSection) {
        readyToPickUpSection = await api.createSection({
          name: READY_TO_PICKUP,
          project_id: task.project_id,
        });
      }
      return await api.moveTask({
        id: task.id,
        section_id: readyToPickUpSection.id,
      });
    },
    onMutate: async () => {
      await optimisticallyUpdateTask(queryClient, {
          id: task.id,
          section_id: readyToPickUpSection?.id,
      })
  },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["tasks"]
      })
      queryClient.invalidateQueries({
        queryKey: ["sections"]
      })
    }
  })
}

export const useMoveToDefaultSection = (task: TodoistTask) => {
  return useMoveTask({
    id: task.id,
    project_id: task.project_id,
  });
}

export const useToggleWaitingForMutation = (task: TodoistTask) => {
  const remove = useRemovingWaitingForMutation(task);
  const add = useAddWaitingForMutation(task);

  if (task.labels.includes(WAITING_FOR)) {
    return remove;
  }
  return add;
}