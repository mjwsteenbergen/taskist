import {
  Dialog,
  DialogContent,
  TextInput,
  DialogClose,
} from "design-system-components/src";
import { Button } from "design-system-components/src/button/Button";
import React, { useContext, useState } from "react";
import { PropsWithChildren } from "react";
import { getApi } from "../fetch";

export const TodoistApiContext = React.createContext<
  ReturnType<typeof getApi> | undefined
>(undefined);

export const TodoistApiContextProvider = (props: PropsWithChildren<{}>) => {
  const key = window.localStorage.getItem("todoist_key");

  if (key === undefined || key === null) {
    return <TokenDialog />;
  }

  return (
    <TodoistApiContext.Provider value={getApi(key)}>
      {props.children}
    </TodoistApiContext.Provider>
  );
};

export const useTodoistApiContext = () => {
  const val = useContext(TodoistApiContext);
  if (!val) {
    throw new Error("TodoContext not defined");
  }
  return val;
};

const TokenDialog = () => {
  const [token, setToken] = useState<string | undefined>(undefined);

  return (
    <Dialog defaultOpen={true}>
      <DialogContent>
        <h2>Add your Todoist token</h2>
        <TextInput
          label="key"
          onChange={(e) => {
            window.localStorage.setItem("todoist_key", e.target.value);
            setToken(e.target.value);
          }}
        />
        <DialogClose asChild>
          <Button appearance={"primary"} disabled={token === undefined}>
            Done
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};
