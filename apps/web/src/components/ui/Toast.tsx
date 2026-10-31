import { Toaster as SonnerToaster, toast as sonnerToast } from 'sonner';

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-center"
      toastOptions={{
        classNames: {
          toast:
            'group font-sans text-sm rounded-md px-4 py-3 shadow-float flex items-center gap-3 bg-board-900 text-white border-0',
          description: 'text-white/80',
          actionButton: 'bg-pencil-500 text-board-900 text-xs font-medium px-3 py-1 rounded',
          cancelButton: 'bg-board-700 text-white text-xs px-3 py-1 rounded',
          error: 'bg-redpen-600 text-white',
          success: 'bg-leaf-600 text-white',
          warning: 'bg-pencil-700 text-white',
          info: 'bg-board-900 text-white',
        },
      }}
      aria-live="polite"
    />
  );
}

export const toast = {
  success: (message: string, options?: Parameters<typeof sonnerToast.success>[1]) =>
    sonnerToast.success(message, options),
  error: (message: string, options?: Parameters<typeof sonnerToast.error>[1]) =>
    sonnerToast.error(message, options),
  warning: (message: string, options?: Parameters<typeof sonnerToast.warning>[1]) =>
    sonnerToast.warning(message, options),
  info: (message: string, options?: Parameters<typeof sonnerToast.info>[1]) =>
    sonnerToast.info(message, options),
  message: (message: string, options?: Parameters<typeof sonnerToast>[1]) =>
    sonnerToast(message, options),
};
