import React from 'react';
import ReactDOM from 'react-dom/client';
import './assets/index.css';
import { App } from './app';
import { TodoContextProvider } from './context/TodoContext';
import { SectionContextProvider } from './context/SectionContext';
import { ProjectContextProvider } from './context/ProjectContext';

ReactDOM.createRoot(document.getElementsByTagName('body')[0]).render(
  <React.StrictMode>
    <TodoContextProvider>
      <SectionContextProvider>
        <ProjectContextProvider>
          <App />
        </ProjectContextProvider>
      </SectionContextProvider>
    </TodoContextProvider>
  </React.StrictMode>
);
