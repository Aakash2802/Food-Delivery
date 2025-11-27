import toast from 'react-hot-toast';
import { CheckCircle, XCircle, AlertTriangle, Info, Zap } from 'lucide-react';

// Custom toast configurations with icons and animations
const toastConfig = {
  success: {
    icon: '✅',
    iconTheme: {
      primary: '#10b981',
      secondary: '#fff',
    },
    style: {
      background: '#10b981',
      color: '#fff',
      fontWeight: '500',
      borderRadius: '12px',
      padding: '16px 20px',
      boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.3)',
    },
    duration: 3000,
  },
  error: {
    icon: '❌',
    iconTheme: {
      primary: '#ef4444',
      secondary: '#fff',
    },
    style: {
      background: '#ef4444',
      color: '#fff',
      fontWeight: '500',
      borderRadius: '12px',
      padding: '16px 20px',
      boxShadow: '0 10px 25px -5px rgba(239, 68, 68, 0.3)',
    },
    duration: 4000,
  },
  loading: {
    icon: '⏳',
    style: {
      background: '#3b82f6',
      color: '#fff',
      fontWeight: '500',
      borderRadius: '12px',
      padding: '16px 20px',
      boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.3)',
    },
  },
  warning: {
    icon: '⚠️',
    style: {
      background: '#f59e0b',
      color: '#fff',
      fontWeight: '500',
      borderRadius: '12px',
      padding: '16px 20px',
      boxShadow: '0 10px 25px -5px rgba(245, 158, 11, 0.3)',
    },
    duration: 3500,
  },
  info: {
    icon: 'ℹ️',
    style: {
      background: '#6366f1',
      color: '#fff',
      fontWeight: '500',
      borderRadius: '12px',
      padding: '16px 20px',
      boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.3)',
    },
    duration: 3000,
  },
};

// Enhanced toast functions
export const showToast = {
  success: (message, options = {}) => {
    return toast.success(message, {
      ...toastConfig.success,
      ...options,
    });
  },

  error: (message, options = {}) => {
    return toast.error(message, {
      ...toastConfig.error,
      ...options,
    });
  },

  loading: (message, options = {}) => {
    return toast.loading(message, {
      ...toastConfig.loading,
      ...options,
    });
  },

  warning: (message, options = {}) => {
    return toast(message, {
      ...toastConfig.warning,
      ...options,
    });
  },

  info: (message, options = {}) => {
    return toast(message, {
      ...toastConfig.info,
      ...options,
    });
  },

  // Promise-based toast for async operations
  promise: (promise, messages) => {
    return toast.promise(
      promise,
      {
        loading: messages.loading || 'Loading...',
        success: messages.success || 'Success!',
        error: messages.error || 'Error occurred',
      },
      {
        success: toastConfig.success,
        error: toastConfig.error,
        loading: toastConfig.loading,
      }
    );
  },

  // Custom toast with action button
  withAction: (message, action, options = {}) => {
    return toast.success(
      (t) => (
        <div className="flex items-center justify-between gap-4">
          <span>{message}</span>
          <button
            onClick={() => {
              action();
              toast.dismiss(t.id);
            }}
            className="bg-white text-green-600 px-3 py-1 rounded-lg text-sm font-semibold hover:bg-green-50 transition-colors"
          >
            Undo
          </button>
        </div>
      ),
      {
        ...toastConfig.success,
        duration: 5000,
        ...options,
      }
    );
  },

  // Order notification with custom styling
  orderUpdate: (status, orderNumber) => {
    const statusConfig = {
      confirmed: { icon: '✅', message: 'Order Confirmed!', color: '#10b981' },
      preparing: { icon: '👨‍🍳', message: 'Preparing your order...', color: '#3b82f6' },
      ready: { icon: '🎉', message: 'Order Ready!', color: '#8b5cf6' },
      picked_up: { icon: '🛵', message: 'Out for delivery!', color: '#f59e0b' },
      delivered: { icon: '🎊', message: 'Delivered!', color: '#10b981' },
    };

    const config = statusConfig[status] || statusConfig.confirmed;

    return toast.success(
      (t) => (
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">{config.icon}</span>
            <span className="font-bold">{config.message}</span>
          </div>
          <span className="text-sm opacity-90">Order #{orderNumber}</span>
        </div>
      ),
      {
        style: {
          background: config.color,
          color: '#fff',
          fontWeight: '500',
          borderRadius: '12px',
          padding: '16px 20px',
          minWidth: '300px',
          boxShadow: `0 10px 25px -5px ${config.color}40`,
        },
        duration: 4000,
      }
    );
  },

  // Loyalty points notification
  loyaltyPoints: (points, message) => {
    return toast.success(
      (t) => (
        <div className="flex items-center gap-3">
          <div className="bg-yellow-400 text-yellow-900 p-2 rounded-full">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold">+{points} Points Earned!</p>
            <p className="text-sm opacity-90">{message}</p>
          </div>
        </div>
      ),
      {
        style: {
          background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
          color: '#fff',
          fontWeight: '500',
          borderRadius: '12px',
          padding: '16px 20px',
          minWidth: '320px',
          boxShadow: '0 10px 25px -5px rgba(251, 191, 36, 0.4)',
        },
        duration: 4000,
      }
    );
  },
};

export default showToast;
