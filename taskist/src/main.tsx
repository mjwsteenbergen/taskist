import React from "react";
import ReactDOM from "react-dom/client";
import "./assets/index.css";
import { App } from "./app";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { persistQueryClient } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { TodoistApiContextProvider } from "./context/TodoistApiContext";

const queryClient = new QueryClient();

const localStoragePersister = createSyncStoragePersister({ storage: window.localStorage })

persistQueryClient({
    queryClient,
    persister: localStoragePersister,
  })

ReactDOM.createRoot(document.getElementsByTagName("body")[0]).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <TodoistApiContextProvider>
                <App />
            </TodoistApiContextProvider>
        </QueryClientProvider>
    </React.StrictMode>
);
