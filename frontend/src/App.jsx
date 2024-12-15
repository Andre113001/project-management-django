import React, { Fragment, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import './App.css';

// Pages
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import Projects from './pages/Projects/Projects';
import Tasks from './pages/Tasks/Tasks';
import Profile from './pages/Profile/Profile';
import MemberManagement from './pages/MemberManagement/MemberManagement';
import GanttChartPage from './pages/Dashboard/GanttChartPage';

import Layout from './Layout';

import { useUser } from './contexts/userProvider';

const App = () => {
  const [userProfile, setUserProfile] = useState(null);
  const queryClient = new QueryClient();
  const { user } = useUser();

  console.log(user);

  const handleUserProfile = (profile) => {
    setUserProfile(profile);
  }
  
  return (
    <QueryClientProvider client={queryClient}>
      <main className="">
        <Router>
          <Routes>
          <Route path='/' element={<Login />}/>
          <Route path='/register' element={<Register />}/>
          <Route 
            path="/dashboard" 
            element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="projects" element={<Projects />} />
              <Route path="tasks" element={<Tasks />} />
              <Route path="profile" element={<Profile />} />
              <Route path="member-management" element={<MemberManagement />} />
              <Route path="gantt" element={<GanttChartPage />} />
          </Route>
        </Routes>
      </Router>
    </main>
    <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

export default App;
