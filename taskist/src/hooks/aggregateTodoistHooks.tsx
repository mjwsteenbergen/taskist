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
  return (projects ?? []).find((i) => i.id === task.projectId);
};

export const useSectionFromProject = (project?: TodoistProject) => {
  const { data: sections } = useTodoistSections();
  if (project === undefined) {
    return [];
  }
  return (sections ?? []).filter((i) => i.projectId === project.id);
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
          projectId: task.projectId,
        });
      }
      return await api.moveTask(task.id, {
        sectionId: inProgressSection.id,
      });
    },
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: ["tasks"],
      }),
    onMutate: async () => {
      await optimisticallyUpdateTask(queryClient, {
        id: task.id,
        sectionId: inProgressSection?.id,
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
          projectId: task.projectId,
        });
      }
      return await api.moveTask(task.id, {
        sectionId: readyToPickupSection.id,
      });
    },
    onMutate: async () => {
      await optimisticallyUpdateTask(queryClient, {
        id: task.id,
        sectionId: readyToPickupSection?.id,
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
    project_id: task.projectId,
  });
};
