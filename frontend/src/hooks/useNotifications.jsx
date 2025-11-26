import { useEffect } from 'react';
import { useSocket } from '../contexts/SocketContext';
import toast from 'react-hot-toast';
import { Package, Truck, CheckCircle, XCircle, Bell, DollarSign } from 'lucide-react';

const useNotifications = () => {
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!socket || !isConnected) return;

    // Order status updates
    socket.on('order:statusUpdated', (data) => {
      const statusMessages = {
        pending: { message: 'Order placed successfully', icon: Package, style: 'bg-blue-500' },
        confirmed: { message: 'Order confirmed by restaurant', icon: CheckCircle, style: 'bg-green-500' },
        preparing: { message: 'Your order is being prepared', icon: Package, style: 'bg-orange-500' },
        ready: { message: 'Your order is ready for pickup', icon: Package, style: 'bg-purple-500' },
        assigned: { message: 'Delivery partner assigned', icon: Truck, style: 'bg-blue-500' },
        picked: { message: 'Order picked up by delivery partner', icon: Truck, style: 'bg-indigo-500' },
        en_route: { message: 'Your order is on the way!', icon: Truck, style: 'bg-blue-600' },
        delivered: { message: 'Order delivered successfully!', icon: CheckCircle, style: 'bg-green-600' },
        cancelled: { message: 'Order has been cancelled', icon: XCircle, style: 'bg-red-500' },
        rejected: { message: 'Order was rejected', icon: XCircle, style: 'bg-red-600' }
      };

      const statusInfo = statusMessages[data.status] || {
        message: `Order status: ${data.status}`,
        icon: Bell,
        style: 'bg-gray-500'
      };

      const Icon = statusInfo.icon;

      toast.custom((t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
        >
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className={`flex-shrink-0 w-10 h-10 rounded-full ${statusInfo.style} flex items-center justify-center`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Order #{data.orderNumber}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {statusInfo.message}
                </p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-gray-200">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-red-600 hover:text-red-500 focus:outline-none"
            >
              Close
            </button>
          </div>
        </div>
      ), {
        duration: 5000,
        position: 'top-right'
      });
    });

    // New order notification (for vendors)
    socket.on('order:new', (data) => {
      toast.custom((t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
        >
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  New Order Received!
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Order #{data.orderNumber} - ₹{data.total?.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-gray-200">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-red-600 hover:text-red-500"
            >
              Close
            </button>
          </div>
        </div>
      ), {
        duration: 8000,
        position: 'top-right'
      });

      // Play notification sound (optional)
      try {
        const audio = new Audio('/notification.mp3');
        audio.volume = 0.5;
        audio.play().catch(() => {}); // Ignore errors if sound file doesn't exist
      } catch (error) {
        // Silently fail if audio not available
      }
    });

    // Driver assigned notification
    socket.on('driver:assigned', (data) => {
      toast.custom((t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
        >
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                <Truck className="w-5 h-5 text-white" />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Delivery Partner Assigned
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {data.driver?.name} will deliver your order
                </p>
                {data.driver?.phone && (
                  <p className="mt-1 text-xs text-gray-400">
                    Contact: {data.driver.phone}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="flex border-l border-gray-200">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-red-600 hover:text-red-500"
            >
              Close
            </button>
          </div>
        </div>
      ), {
        duration: 6000,
        position: 'top-right'
      });
    });

    // Payment completed notification
    socket.on('payment:completed', (data) => {
      toast.custom((t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
        >
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Payment Successful
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  ₹{data.amount?.toFixed(2)} paid for order #{data.orderNumber}
                </p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-gray-200">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-red-600 hover:text-red-500"
            >
              Close
            </button>
          </div>
        </div>
      ), {
        duration: 5000,
        position: 'top-right'
      });
    });

    // Order assigned to driver (driver-specific)
    socket.on('order:assigned', (data) => {
      toast.custom((t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
        >
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  New Delivery Assigned
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Order #{data.orderNumber} from {data.restaurantId?.name || 'Restaurant'}
                </p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-gray-200">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-red-600 hover:text-red-500"
            >
              Close
            </button>
          </div>
        </div>
      ), {
        duration: 8000,
        position: 'top-right'
      });
    });

    // Cleanup event listeners
    return () => {
      socket.off('order:statusUpdated');
      socket.off('order:new');
      socket.off('driver:assigned');
      socket.off('payment:completed');
      socket.off('order:assigned');
    };
  }, [socket, isConnected]);
};

export default useNotifications;
