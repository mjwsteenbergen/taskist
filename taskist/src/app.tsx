import { useRef, useState } from "react";
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
import { useCreateTodoMutation } from "./hooks/todoistHooks";
import {
  InProgressSection,
  ReadyToPickupSection,
  OverdueSection,
  TodaySection,
  WaitingForSection,
} from "./components/sections";

export const App = () => {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <>
      <div className="flex flex-col min-h-screen justify-items-center items-center justify-center ml-5 py-8">
        <div className="grid max-w-[-webkit-fill-available] overflow-hidden grow content-around">
          <InProgressSection />
          <TodaySection />
          <OverdueSection />
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
        <WaitingForSection />
        <ReadyToPickupSection />
      </div>
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
