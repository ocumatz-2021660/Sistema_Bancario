import { create } from 'zustand';

//store para saber si el menú está abierto
export const useSidebarStore = create((set) => ({
    isOpen: false,
    toggle: () => set((state) => ({ isOpen: !state.isOpen })),
    close: () => set({ isOpen: false }),
}));