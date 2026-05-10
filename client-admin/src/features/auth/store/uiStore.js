import { create } from 'zustand';

export const useUIStore = create((set) => ({
  model: null,
  confirm: null,

  openModal: (title, message, onClose) =>
    set({
      modal: { title, message, onClose },
    }),

  closeModal: () => set({ modal: null }),

  openConfirm: ({ title, message, onConfirm, onCancel }) =>
    set({
      confirm: { title, message, onConfirm, onCancel },
    }),

  closeConfirm: () => set({ confirm: null }),
}));
