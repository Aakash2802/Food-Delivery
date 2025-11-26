import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
    this.pendingEmits = [];
  }

  connect(token) {
    if (this.socket?.connected) return;

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket.id);

      // Emit pending events
      while (this.pendingEmits.length > 0) {
        const { event, data } = this.pendingEmits.shift();
        this.socket.emit(event, data);
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
    }
  }

  on(event, callback) {
    if (!this.socket) return;

    this.socket.on(event, callback);

    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (!this.socket) return;

    this.socket.off(event, callback);

    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (!this.socket?.connected) {
      // Queue the event to be sent once connected
      this.pendingEmits.push({ event, data });
      return;
    }
    this.socket.emit(event, data);
  }

  // Order tracking
  trackOrder(orderId) {
    this.emit('order:track', orderId);
  }

  untrackOrder(orderId) {
    this.emit('order:untrack', orderId);
  }

  // Restaurant events (vendor)
  joinRestaurant(restaurantId) {
    this.emit('restaurant:join', restaurantId);
  }

  leaveRestaurant(restaurantId) {
    this.emit('restaurant:leave', restaurantId);
  }

  updateRestaurantStatus(restaurantId, isOpen) {
    this.emit('restaurant:status', { restaurantId, isOpen });
  }

  // Driver events
  updateDriverLocation(latitude, longitude, orderId) {
    this.emit('driver:location', { latitude, longitude, orderId });
  }

  updateDriverAvailability(isAvailable) {
    this.emit('driver:availability', isAvailable);
  }

  isConnected() {
    return this.socket?.connected || false;
  }
}

export default new SocketService();
