import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Box, Chip, Rating, Tabs, Tab } from '@mui/material';
import { isMessOpen, getCurrentMeal, getNextMeal } from '../utils/timeUtils';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';

interface MessCardProps {
  name: string;
  location: string;
  rating: number;
  subscriptionPlans: {
    lunch?: number;
    dinner?: number;
  };
}

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

const MessCard: React.FC<MessCardProps> = ({ name, location, rating, subscriptionPlans }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMeal, setCurrentMeal] = useState<string | null>(null);
  const [nextMealInfo, setNextMealInfo] = useState<{ meal: string; timeUntil: string } | null>(null);
  const [selectedDay, setSelectedDay] = useState(0); // 0 = Monday

  useEffect(() => {
    const updateStatus = () => {
      setIsOpen(isMessOpen());
      setCurrentMeal(getCurrentMeal());
      setNextMealInfo(getNextMeal());
    };

    updateStatus();
    const interval = setInterval(updateStatus, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const handleDayChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedDay(newValue);
  };

  return (
    <Card sx={{ 
      width: '100%', 
      mb: 2,
      boxShadow: 2,
      '&:hover': {
        boxShadow: 4,
        transform: 'scale(1.01)',
        transition: 'all 0.2s ease-in-out'
      }
    }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="h6" component="div">
            {name}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
              ₹100 per day
            </Typography>
            <Chip 
              label={isOpen ? 'Open' : 'Closed'} 
              color={isOpen ? 'success' : 'error'}
              size="small"
            />
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Rating value={rating} precision={0.1} readOnly size="small" />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
            ({rating})
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {location}
        </Typography>

        <Tabs 
          value={selectedDay} 
          onChange={handleDayChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ 
            mb: 2,
            minHeight: 'auto',
            '& .MuiTab-root': {
              minHeight: 'auto',
              py: 1
            }
          }}
        >
          {DAYS.map((day, index) => (
            <Tab 
              key={day} 
              label={day} 
              value={index}
              sx={{ 
                fontSize: '0.75rem',
                minWidth: 'auto',
                px: 1.5
              }}
            />
          ))}
        </Tabs>

        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Operating Hours
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Lunch
              </Typography>
              <Typography variant="body2">
                12:00 PM - 2:30 PM
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Dinner
              </Typography>
              <Typography variant="body2">
                7:00 PM - 9:30 PM
              </Typography>
            </Box>
          </Box>
        </Box>

        {!isOpen && nextMealInfo && (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
            <AccessTimeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              Opens for {nextMealInfo.meal} in {nextMealInfo.timeUntil}
            </Typography>
          </Box>
        )}

        {isOpen && currentMeal && (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
            <AccessTimeIcon fontSize="small" sx={{ mr: 1, color: 'success.main' }} />
            <Typography variant="body2" color="success.main">
              Currently serving {currentMeal}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default MessCard; 