import React from 'react'
import ReactDOM from 'react-dom/client'
import "./assets/index.css";
import { ProjectContextProvider } from './context/project';
import { SectionContextProvider } from './context/section';
import { TodoContextProvider } from './context/task';
import { Tasks } from './items';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <div className={'flex h-screen items-center justify-around flex-col'}>
      <TodoContextProvider v={[]}>
        <ProjectContextProvider v={[]}>
          <SectionContextProvider v={[]}>
            <Tasks />
          </SectionContextProvider>
        </ProjectContextProvider>
      </TodoContextProvider>
    </div>
  </React.StrictMode>,
)
