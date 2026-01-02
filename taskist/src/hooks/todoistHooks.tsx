import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useTodoistApiContext } from "../context/TodoistApiContext";
import { TodoistMoveArgs, TodoistTask } from "../todoist/types";

export const IN_PROGRESS = "In Progress";
export const READY_TO_PICKUP = "Ready To Pickup";
export const WAITING_FOR = "waiting-for";
export const TODAY = "today";
export const TOMORROW = "tomorrow";
export const YESTERDAY = "yesterday";

export const useTodoistTasks = () => {
  const api = useTodoistApiContext();
  return useQuery({
    queryKey: ["tasks"],
    queryFn: api.getTasks,
    staleTime: 5 * 60 * 1000,
  });
};

export const BASE_TASK: TodoistTask = {
  id: "1",
  content: "",
  labels: [],
  order: 1,
  project_id: "inbox",
  due: null,
  is_completed: false,
  priority: 4,
};

export const optimisticallyUpdateTask = async (
  queryClient: QueryClient,
  newTask: Partial<TodoistTask> & Pick<TodoistTask, "id">
) => {
  // Cancel any outgoing refetches
  // (so they don't overwrite our optimistic update)
  await queryClient.cancelQueries({ queryKey: ["tasks"] });

  // Snapshot the previous value
  const previousTodos = queryClient.getQueryData(["tasks"]) as TodoistTask[];

  // Optimistically update to the new value
  queryClient.setQueryData(["tasks"], (old: TodoistTask[]) => {
    const oldTask = old.find((i) => i.id == newTask.id) ?? {};
    const withoutOld = old.filter((i) => i !== oldTask);

    return [
      ...withoutOld,
      {
        ...BASE_TASK,
        ...oldTask,
        ...newTask,
      },
    ];
  });

  // Return a context object with the snapshotted value
  return { previousTodos };
};

export const useCreateTodoMutation = () => {
  const queryClient = useQueryClient();
  const api = useTodoistApiContext();

  return useMutation({
    mutationFn: api.createTask,
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: ["tasks"],
      }),
  });
};

export const useUpdateTask = (
  task: Partial<TodoistTask> & Pick<TodoistTask, "id">
) => {
  const queryClient = useQueryClient();
  const api = useTodoistApiContext();

  return useMutation({
    mutationFn: () => api.updateTask(task),
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: ["tasks"],
      }),
    onMutate: async () => {
      await optimisticallyUpdateTask(queryClient, task);
    },
  });
};

export const useMoveTask = (task: TodoistMoveArgs) => {
  const queryClient = useQueryClient();
  const api = useTodoistApiContext();

  return useMutation({
    mutationFn: () => api.moveTask(task),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["tasks"],
      }),
    onMutate: async () => {
      await optimisticallyUpdateTask(queryClient, {
        id: task.id,
        project_id: task.project_id,
        section_id: task.section_id,
        parent_id: task.parent_id,
      });
    },
  });
};

export const useToggleLabelMutation = (task: TodoistTask, label: string) => {
  const remove = useRemoveLabelMutation(task, label);
  const add = useAddLabelMutation(task, label);
  if (task.labels.includes(label)) {
    return remove;
  } else {
    return add;
  }
};

export const useRemoveLabelMutation = (task: TodoistTask, label: string) => {
  return useUpdateTask({
    id: task.id,
    labels: task.labels.filter((i) => i !== label),
  });
};

export const useAddLabelMutation = (task: TodoistTask, label: string) => {
  return useUpdateTask({
    id: task.id,
    labels: [...task.labels, label],
  });
};

export const useCompleteTaskMutation = (task: TodoistTask) => {
  const queryClient = useQueryClient();
  const api = useTodoistApiContext();

  return useMutation({
    mutationFn: () => api.complete(task.id),
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: ["tasks"],
      }),
    onMutate: async () => {
      await optimisticallyUpdateTask(queryClient, {
        id: task.id,
        is_completed: true,
      });
    },
  });
};

export const useUnCompleteTaskMutation = (task: TodoistTask) => {
  const queryClient = useQueryClient();
  const api = useTodoistApiContext();

  return useMutation({
    mutationFn: () => api.uncomplete(task.id),
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: ["tasks"],
      }),
    onMutate: async () => {
      await optimisticallyUpdateTask(queryClient, {
        id: task.id,
        is_completed: false,
      });
    },
  });
};

export const useTodoistSections = () => {
  const api = useTodoistApiContext();
  return useQuery({
    queryKey: ["sections"],
    queryFn: api.getSections,
    staleTime: 5 * 60 * 1000,
  });
};

export const useTodoistProjects = () => {
  const api = useTodoistApiContext();
  return useQuery({
    queryKey: ["projects"],
    queryFn: api.getProjects,
    staleTime: 5 * 60 * 1000,
  });
};
