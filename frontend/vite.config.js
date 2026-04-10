import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const buildCommit = process.env.VITE_APP_BUILD_COMMIT || '';
const buildTimestamp = process.env.VITE_APP_BUILD_TIME || new Date().toISOString();

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    __APP_BUILD_COMMIT__: JSON.stringify(buildCommit),
    __APP_BUILD_TIME__: JSON.stringify(buildTimestamp),
  },
});
