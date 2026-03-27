import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ★ GitHubリポジトリ名
const REPO_NAME = '/unofficial_uwoter_no_oheya/'

export default defineConfig({
  plugins: [react()],
  base: REPO_NAME,
})
