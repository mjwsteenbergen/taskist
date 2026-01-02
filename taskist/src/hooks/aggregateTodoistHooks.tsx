import { TodoistTask, TodoistSection, TodoistProject } from "../todoist/types";
import {
  WAITING_FOR,
  READY_TO_PICKUP,
  IN_PROGRESS,
  useTodoistSections,
  useTodoistProjects,
  useMoveTask,
  optimisticallyUpdateTask,
} from "./todoistHooks";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTodoistApiContext } from "../context/TodoistApiContext";

export const notWaitingFor = (i: TodoistTask) =>
  !i.labels.includes(WAITING_FOR);
export const sectionHasName = (name: string, sections: TodoistSection[]) =>
  sections.filter((i) => i.name === name);

export const useProjectFromTask = (task: TodoistTask) => {
  const { data: projects } = useTodoistProjects();
  return (projects ?? []).find((i) => i.id === task.project_id);
};

export const useSectionFromProject = (project?: TodoistProject) => {
  const { data: sections } = useTodoistSections();
  if (project === undefined) {
    return [];
  }
  return (sections ?? []).filter((i) => i.project_id === project.id);
};

export const useMoveToInProgress = (task: TodoistTask) => {
  const queryClient = useQueryClient();
  const project = useProjectFromTask(task);
  const sections = useSectionFromProject(project);
  const api = useTodoistApiContext();

  let inProgressSection = sections.find((i) => i.name === IN_PROGRESS);

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
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: ["tasks"],
      }),
    onMutate: async () => {
      await optimisticallyUpdateTask(queryClient, {
        id: task.id,
        section_id: inProgressSection?.id,
      });
    },
  });
};

export const useToMoveReadyToPickUp = (task: TodoistTask) => {
  const queryClient = useQueryClient();
  const project = useProjectFromTask(task);
  const sections = useSectionFromProject(project);
  const api = useTodoistApiContext();
  let readyToPickupSection = sections.find((i) => i.name === READY_TO_PICKUP);

  return useMutation({
    mutationFn: async () => {
      if (!readyToPickupSection) {
        readyToPickupSection = await api.createSection({
          name: READY_TO_PICKUP,
          project_id: task.project_id,
        });
      }
      return await api.moveTask({
        id: task.id,
        section_id: readyToPickupSection.id,
      });
    },
    onMutate: async () => {
      await optimisticallyUpdateTask(queryClient, {
        id: task.id,
        section_id: readyToPickupSection?.id,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["tasks"],
      });
      queryClient.invalidateQueries({
        queryKey: ["sections"],
      });
    },
  });
};

export const useMoveToDefaultSection = (task: TodoistTask) => {
  return useMoveTask({
    id: task.id,
    project_id: task.project_id,
  });
};
