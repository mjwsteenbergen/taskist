import { useRef, useState } from "react";
import { useTodoPageSections } from "./hooks/useTodoPageSections";
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
import { useTodoistApiContext } from "./context/TodoistApiContext";

export const App = () => {
  const ref = useRef<HTMLDivElement>(null);
  const {
    inProgress,
    ready,
    waiting_for,
    overdue,
    next_up,
    moveToReadyToPickUp,
    moveToInProgress,
    backToDefaultSection,
    addWaitingFor,
    removeWaitingFor,
    complete,
  } = useTodoPageSections();

  return (
    <>
      <div className="flex flex-col min-h-screen justify-items-center items-center justify-center ml-5 py-8">
        <div className="grid max-w-[-webkit-fill-available] overflow-hidden grow content-around">
          <TaskSection
            big
            tasks={inProgress()}
            onWaitingFor={addWaitingFor}
            onMoveDown={moveToReadyToPickUp}
            onComplete={complete}
          />
          <TaskSection
            name="Ready to pickup"
            tasks={ready()}
            onWaitingFor={addWaitingFor}
            onMoveDown={backToDefaultSection}
            onMoveUp={moveToInProgress}
            onComplete={complete}
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
          tasks={waiting_for()}
          onWaitingFor={removeWaitingFor}
          onComplete={complete}
        />
        <div className="grid content-center max-w-max grow">
          <TaskSection
            name="Overdue"
            tasks={overdue()}
            onMoveUp={moveToReadyToPickUp}
            onComplete={complete}
          />
          <TaskSection
            name="Next up"
            tasks={next_up()}
            onMoveUp={moveToReadyToPickUp}
            onComplete={complete}
          />
        </div>
      </div>
      {/* )} */}
    </>
  );
};

export const AddTodo = () => {
  const [text, setText] = useState("");
  const { api } = useTodoistApiContext();
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
          api.createTask({
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
