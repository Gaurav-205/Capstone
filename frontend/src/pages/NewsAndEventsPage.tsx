import React from 'react';
import NewsEventsLayout from '../layouts/NewsEventsLayout';
import NewsAndEvents from '../components/NewsAndEvents';
import { useAuth } from '../contexts/AuthContext';
import { User } from '../types/user';

const NewsAndEventsPage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = (user as User)?.role === 'admin';

  return (
    <NewsEventsLayout>
      <NewsAndEvents isAdmin={isAdmin} />
    </NewsEventsLayout>
  );
};

export default NewsAndEventsPage; 