import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useThemeStore = create(
  persist(
    (set) => ({
      isDarkMode: false,
      toggleDarkMode: () => set((state) => {
        const newMode = !state.isDarkMode;
        // Apply dark class to document
        if (newMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        return { isDarkMode: newMode };
      }),
      initTheme: () => set((state) => {
        // Initialize theme on app load
        if (state.isDarkMode) {
          document.documentElement.classList.add('dark');
        }
        return state;
      })
    }),
    {
      name: 'theme-storage',
    }
  )
);

export default useThemeStore;
