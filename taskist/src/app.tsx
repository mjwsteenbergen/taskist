import { useRef, useState } from "react";
import { TaskSection } from "./components/task-section";
import { Button } from "design-system-components/src/button/Button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTrigger,
  TextInput,
} from "design-system-components/src";
import { Plus } from "iconoir-react";
import { useInProgressTasks, useNextUpTasks, useOverdueTasks, useReadyToPickupTasks, useWaitingForTasks } from "./hooks/aggregateTodoistHooks";
import { useCreateTodoMutation } from "./hooks/todoistHooks";

export const App = () => {
  const ref = useRef<HTMLDivElement>(null);

  const inProgressTasks = useInProgressTasks();
  const nextUpTasks = useNextUpTasks();
  const overdueTasks = useOverdueTasks();
  const waitingForTasks = useWaitingForTasks();
  const readyToPickupTasks = useReadyToPickupTasks();

  return (
    <>
      <div className="flex flex-col min-h-screen justify-items-center items-center justify-center ml-5 py-8">
        <div className="grid max-w-[-webkit-fill-available] overflow-hidden grow content-around">
          <TaskSection
            big
            tasks={inProgressTasks}
            moveDown="ready-to-pickup"
          />
          <TaskSection
            name="Ready to pickup"
            tasks={readyToPickupTasks}
            moveDown="back-to-default"
            moveUp="move-to-in-progress"
          />
          <TaskSection
            name="Overdue"
            tasks={overdueTasks}
            moveUp="ready-to-pickup"
          />
          
        </div>
        <Dialog>
          <DialogTrigger>
            <Button rounded className="absolute right-7 bottom-7">
              <Plus />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <AddTodo />
          </DialogContent>
        </Dialog>
      </div>
      <div
        className="bg-gray-50 dark:bg-gray-700 min-h-screen grid justify-center content-center py-8"
        ref={ref}
      >
        
        <TaskSection
          name="Waiting For"
          tasks={waitingForTasks}
          showWaitingFor
        />
          <TaskSection
            name="Overdue"
            tasks={overdueTasks}
            moveUp="ready-to-pickup"
          />
          <TaskSection
            name="Next up"
            tasks={nextUpTasks}
            moveUp="ready-to-pickup"
          />
      </div>
      {/* )} */}
    </>
  );
};

export const AddTodo = () => {
  const [text, setText] = useState("");
  
  const { mutate: createTask } = useCreateTodoMutation();
  return (
    <>
      <DialogHeader>
        <h3>Add a new todo item</h3>
      </DialogHeader>

      <TextInput
        id="text"
        label="Todo Description"
        onChange={(e) => {
          setText(e.currentTarget.value);
        }}
      ></TextInput>
      <DialogClose
        className="reset justify-self-end"
        onClick={() => {
          createTask({
            content: text,
          });
        }}
      >
        <Button>Create</Button>
      </DialogClose>
    </>
  );
};

//
