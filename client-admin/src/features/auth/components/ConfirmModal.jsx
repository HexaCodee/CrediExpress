import React from 'react';
import { useUIStore } from '../store/uiStore';

export const UiConfirmHost = () => {
  const confirm = useUIStore((s) => s.confirm);
  const closeConfirm = useUIStore((s) => s.closeConfirm);

  if (!confirm) return null;

  const handleCancel = () => {
    confirm.onCancel?.();
    closeConfirm();
  };

  const handleConfirm = async () => {
    try {
      await Promise.resolve(confirm.onConfirm?.());
    } finally {
      closeConfirm();
    }
  };

  return (
    <div className='fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4'>
      <div
        className='bg-white p-6 rounded-xl w-full max-w-md text-center shadow-lg border border-gray-200'
        role='dialog'
        aria-modal='true'
        aria-labelledby='ui-confirm-title'
      >
        <h2 id='ui-confirm-title' className='text-xl font-bold mb-2'>
          {confirm.title}
        </h2>
        <p className='mb-4 text-gray-600'>{confirm.message}</p>
        <div className='flex justify-center gap-4 mt-4'>
          <button
            type='button'
            onClick={handleCancel}
            className='px-5 py-2 rounded-lg bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition'
          >
            Cancelar
          </button>
          <button
            type='button'
            onClick={() => void handleConfirm()}
            className='px-5 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition'
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};
