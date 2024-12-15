// frontend/src/Layout.jsx
import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import { useUser } from './contexts/userProvider';
import { useNavigate } from 'react-router-dom';
import { Notifications } from '@mui/icons-material';
import { IconButton, Badge } from '@mui/material';
import NotificationPopover from './components/NotificationPopover';
import { useQuery } from '@tanstack/react-query';
import { useHttp } from './hooks/http-hook';

const Layout = () => {
  const [greeting, setGreeting] = useState(null);
  const { user } = useUser();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const { sendRequest } = useHttp();

  const { data: notificationsData = { results: [] } } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await sendRequest({
        url: '/api/notifications/',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access')}`
        }
      });
      return response;
    }
  });

  const notifications = notificationsData.results || [];
  const unreadCount = notifications.filter(n => !n.is_read).length;

  useEffect(() => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) {
      setGreeting("Good Morning");
    } else if (currentHour < 18) {
      setGreeting("Good Afternoon");
    } else {
      setGreeting("Good Evening");
    }
  }, []);

  const handleNotificationClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setAnchorEl(null);
  };

  return (
    <main className="flex flex-col desktop:flex-row min-h-screen">
      <div className='w-full desktop:hidden p-2 flex items-center desktop:justify-center phone:justify-between phone:p-5'>
        <img src="/logo.png" className='desktop:w-36 phone:w-10 flex' onClick={() => navigate('/dashboard')}/>
        <div className='flex items-center justify-center bg-secondary rounded-lg text-lg p-2'>
          {user.role !== 'ADMIN' ? (
            <IconButton onClick={handleNotificationClick}>
            <Badge badgeContent={unreadCount} color="error">
              <Notifications sx={{ fontSize: '2rem', color: 'grey' }}/>
            </Badge>
          </IconButton>
          ): null}
        </div>
      </div>
      <Sidebar />
      <div className="flex flex-col flex-1 p-5 gap-10">
        <div className="desktop:flex phone:hidden items-center justify-between gap-5">
          <div className="flex-1">
            <h1 className="desktop:text-lg font-bold desktop:text-left">{greeting}, {user?.username || 'User'}.</h1>
            <p className="text-sm desktop:text-left">We hope you have an amazing day!</p>
          </div>
          <div className="flex flex-col items-end phone:items-center desktop:items-end justify-between">
            {user.role !== 'ADMIN' ? (
              <IconButton onClick={handleNotificationClick}>
              <Badge badgeContent={unreadCount} color="error">
                <Notifications sx={{ fontSize: '2rem', color: 'grey' }}/>
              </Badge>
            </IconButton>
            ): null}
          </div>
        </div>
        <Outlet />
      </div>
      <NotificationPopover anchorEl={anchorEl} onClose={handleNotificationClose} />
    </main>
  );
};

export default Layout;