import { defineConfig, searchForWorkspaceRoot } from 'vite'
import { join } from "path";
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/taskist",
  server: {
    fs: {
      allow: [
        // search up for workspace root
        searchForWorkspaceRoot(process.cwd()),
        // your custom rules
        join(searchForWorkspaceRoot(process.cwd()), ".."),
      ],
    },
  },
})
