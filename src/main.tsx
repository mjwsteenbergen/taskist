import React from 'react'
import ReactDOM from 'react-dom/client'
import "./assets/index.css";
import { RootProjects } from './task';
import { ProjectContextProvider, TodoContextProvider } from './updates';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <div className={'flex h-screen items-stretch justify-center'}>
      <TodoContextProvider v={[]}>
        <ProjectContextProvider v={[]}>
          <RootProjects/>
        </ProjectContextProvider>
      </TodoContextProvider>
    </div>
  </React.StrictMode>,
)
