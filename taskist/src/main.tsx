import React from 'react'
import ReactDOM from 'react-dom/client'
import "./assets/index.css";
import { ProjectContextProvider } from './context/project';
import { SectionContextProvider } from './context/section';
import { TodoContextProvider } from './context/task';
import { Tasks } from './items';
import { Main } from './srcv2/main';

ReactDOM.createRoot(document.getElementsByTagName('body')[0]).render(
  <React.StrictMode>
        <Main/>
  </React.StrictMode>,
)

  // < div className = 'grid min-h-screen content-center justify-center py-8' >

  // < TodoContextProvider v = { []} >
  //   <ProjectContextProvider v={[]}>
  //     <SectionContextProvider v={[]}>
  //       <Tasks />
  //     </SectionContextProvider>
  //   </ProjectContextProvider>
  //       </TodoContextProvider >
    // </div >
