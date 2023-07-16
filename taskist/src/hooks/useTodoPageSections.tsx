import {
  TodoistProject,
  TodoistSection,
  TodoistTask,
  api,
  cachedApi,
} from '../fetch';
import { useProjectContext } from '../context/ProjectContext';
import { useSectionContext } from '../context/SectionContext';
import { useTodoContext } from '../context/TodoContext';

const IN_PROGRESS = 'In Progress';
const READY_TO_PICKUP = 'Ready To Pickup';
const WAITING_FOR = 'waiting-for';

export function then<Y, Z, P extends any[]>(
  first: (...args: P) => Promise<Y>,
  then: (arg: Y) => Z
) {
  return function (...args: P) {
    console.log('thenargs', args);
    return first(...args).then((i) => then(i));
  };
}

const notWaitingFor = (i: TodoistTask) => !i.labels.includes(WAITING_FOR);
const ready_sections = (sections: TodoistSection[]) =>
  sections.filter((i) => i.name === READY_TO_PICKUP).map((i) => i.id);
const inProgress_sections = (sections: TodoistSection[]) =>
  sections.filter((i) => i.name === IN_PROGRESS);

const projects_project = (projects: TodoistProject[]) =>
  projects.find((i) => i.name === 'Projects');
const projects_projects = (projects: TodoistProject[]) =>
  projects.filter((i) => i.parent_id === projects_project(projects)?.id);

const sectionsOfProject = (
  sections: TodoistSection[],
  project: TodoistProject
) => sections.filter((i) => i.project_id == project.id);
const projectOfTask = (task: TodoistTask, projects: TodoistProject[]) => {
  const project = projects.find((i) => i.id == task.project_id);
  if (!project) throw new Error('project does not xist');
  return project;
};

const backToDefaultSection = (task: TodoistTask) => {
  task.section_id = undefined;
  return cachedApi.moveTask({
    id: task.id,
    project_id: task.project_id,
  });
};
const moveToReadyToPickUp = async (
  task: TodoistTask,
  sections: TodoistSection[],
  projects: TodoistProject[]
) => {
  const project = projectOfTask(task, projects);
  const projectSections = sectionsOfProject(sections, project);
  let readyToPickUpSection = projectSections.find(
    (i) => i.name === READY_TO_PICKUP
  );
  if (!readyToPickUpSection) {
    readyToPickUpSection = await cachedApi.createSection({
      name: READY_TO_PICKUP,
      project_id: task.project_id,
    });
  }
  return cachedApi.moveTask({
    id: task.id,
    section_id: readyToPickUpSection.id,
  });
};
const moveToInProgress = async (
  task: TodoistTask,
  sections: TodoistSection[],
  projects: TodoistProject[]
) => {
  const project = projectOfTask(task, projects);
  const projectSections = sectionsOfProject(sections, project);
  let readyToPickUpSection = projectSections.find(
    (i) => i.name === IN_PROGRESS
  );
  if (!readyToPickUpSection) {
    readyToPickUpSection = await cachedApi.createSection({
      name: IN_PROGRESS,
      project_id: task.project_id,
    });
  }
  return cachedApi.moveTask({
    id: task.id,
    section_id: readyToPickUpSection.id,
  });
};

const toggleComplete = (todo: TodoistTask) => {
  if (todo.is_completed) {
    return cachedApi.uncomplete(todo.id);
  } else {
    return cachedApi.complete(todo.id);
  }
};

const addWaitingFor = (task: TodoistTask) => {
  return cachedApi.updateTask({
    id: task.id,
    labels: [...task.labels, WAITING_FOR],
  });
};

const removeWaitingFor = (task: TodoistTask) => {
  return cachedApi.updateTask({
    id: task.id,
    labels: task.labels.filter((i) => i !== WAITING_FOR),
  });
};

export const useTodoPageSections = () => {
  const [todos, setTodos] = useTodoContext();
  const [sections, setSections] = useSectionContext();
  const [projects, setProjects] = useProjectContext();

  const refreshTodos = () => {
    api.getTasks().then((i) => setTodos(i));
  };

  return {
    todos,
    ready: () =>
      todos
        .filter((i) => ready_sections(sections).includes(i.section_id ?? ''))
        .filter(notWaitingFor),
    overdue: () =>
      todos.filter(
        (i) => Date.parse(i.due?.date ?? Date.now().toString()) < Date.now()
      ),
    waiting_for: () => todos.filter((i) => i.labels.includes(WAITING_FOR)),
    next_up: () =>
      todos.filter(
        (i) =>
          i.section_id === null &&
          projects_projects(projects).some((j) => j.id === i.project_id)
      ),
    inProgress: () =>
      todos
        .filter((i) =>
          inProgress_sections(sections)
            .map((i) => i.id)
            .includes(i.section_id ?? '')
        )
        .filter(notWaitingFor),
    complete: then(toggleComplete, refreshTodos),
    addWaitingFor: then(addWaitingFor, refreshTodos),
    removeWaitingFor: then(removeWaitingFor, refreshTodos),
    backToDefaultSection: then(backToDefaultSection, refreshTodos),
    moveToInProgress: then(
      (task: TodoistTask) => moveToInProgress(task, sections, projects),
      refreshTodos
    ),
    moveToReadyToPickUp: then(
      (task: TodoistTask) => moveToReadyToPickUp(task, sections, projects),
      refreshTodos
    ),
  };
};
