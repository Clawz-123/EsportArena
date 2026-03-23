import {defineConfig} from "vite";

// defineConfig for vitest configuration
export default defineConfig({
  test: {
    environment: "jsdom",
  }
}); 
