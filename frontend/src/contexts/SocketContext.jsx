import { createContext, useContext, useEffect, useState } from 'react';
import useAuthStore from '../store/useAuthStore';
import socketService from '../services/socket';

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

// Shares the single socketService connection with components, and (re)connects
// whenever a logged-in user is present - including after a page reload
export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user, token } = useAuthStore();

  useEffect(() => {
    if (!user || !token) {
      socketService.disconnect();
      setSocket(null);
      setIsConnected(false);
      return;
    }

    const activeSocket = socketService.connect(token);
    setSocket(activeSocket);
    setIsConnected(activeSocket.connected);

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    activeSocket.on('connect', handleConnect);
    activeSocket.on('disconnect', handleDisconnect);
    activeSocket.on('connect_error', handleDisconnect);

    return () => {
      activeSocket.off('connect', handleConnect);
      activeSocket.off('disconnect', handleDisconnect);
      activeSocket.off('connect_error', handleDisconnect);
    };
  }, [user, token]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;
