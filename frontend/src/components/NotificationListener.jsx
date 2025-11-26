import { useEffect } from 'react';
import useNotifications from '../hooks/useNotifications.jsx';

// This component doesn't render anything, it just listens for notifications
const NotificationListener = () => {
  useNotifications();
  return null;
};

export default NotificationListener;
