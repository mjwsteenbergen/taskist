import React from "react";
import ReactDOM from "react-dom/client";
import "./assets/index.css";
import { App } from "./app";
import { TodoContextProvider } from "./context/TodoContext";
import { SectionContextProvider } from "./context/SectionContext";
import { ProjectContextProvider } from "./context/ProjectContext";
import { TodoistApiContextProvider } from "./context/TodoistApiContext";

ReactDOM.createRoot(document.getElementsByTagName("body")[0]).render(
  <React.StrictMode>
    <TodoistApiContextProvider>
      <TodoContextProvider>
        <SectionContextProvider>
          <ProjectContextProvider>
            <App />
          </ProjectContextProvider>
        </SectionContextProvider>
      </TodoContextProvider>
    </TodoistApiContextProvider>
  </React.StrictMode>
);
