/**
 * Простая альтернатива toast без зависимостей
 */

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastOptions {
  description?: string;
}

class ToastManager {
  private static toasts: Array<{
    id: string;
    type: ToastType;
    message: string;
    description?: string;
  }> = [];
  
  private static listeners: Array<() => void> = [];

  static subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  static notify() {
    this.listeners.forEach(listener => listener());
  }

  static getToasts() {
    return this.toasts;
  }

  static show(type: ToastType, message: string, options?: ToastOptions) {
    const id = Date.now().toString();
    this.toasts.push({ id, type, message, description: options?.description });
    this.notify();

    // Auto dismiss after 3 seconds
    setTimeout(() => {
      this.dismiss(id);
    }, 3000);
  }

  static dismiss(id: string) {
    this.toasts = this.toasts.filter(t => t.id !== id);
    this.notify();
  }

  static success(message: string, options?: ToastOptions) {
    this.show('success', message, options);
  }

  static error(message: string, options?: ToastOptions) {
    this.show('error', message, options);
  }

  static warning(message: string, options?: ToastOptions) {
    this.show('warning', message, options);
  }

  static info(message: string, options?: ToastOptions) {
    this.show('info', message, options);
  }
}

export const toast = {
  success: (message: string, options?: ToastOptions) => ToastManager.success(message, options),
  error: (message: string, options?: ToastOptions) => ToastManager.error(message, options),
  warning: (message: string, options?: ToastOptions) => ToastManager.warning(message, options),
  info: (message: string, options?: ToastOptions) => ToastManager.info(message, options),
};

export { ToastManager };
