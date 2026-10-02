import { defineConfig } from 'vite';
import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
export default defineConfig({
  base: '/ai-tools-workshop/',
  build: {
    rolldownOptions: {
      input: Object.fromEntries(readdirSync('.').filter(f=>f.endsWith('.html')).map(f=>[f.replace('.html',''),resolve(f)]))
    }
  }
});
