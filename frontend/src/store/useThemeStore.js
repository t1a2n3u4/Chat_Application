import { createWithEqualityFn } from "zustand/traditional";

export const useThemeStore = createWithEqualityFn((set) => ({
  theme: localStorage.getItem("streamify-theme") || "coffee",
  setTheme: (theme) => {
    localStorage.setItem("streamify-theme", theme);
    set({ theme });
  },
}));
