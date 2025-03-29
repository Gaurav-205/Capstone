import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Rating,
  Box,
  Chip,
  CardActionArea
} from '@mui/material';
import {
  AccessTime as AccessTimeIcon,
  LocationOn as LocationIcon,
  Restaurant as RestaurantIcon
} from '@mui/icons-material';
import { Mess } from '../../types/mess';

interface MessCardProps {
  mess: Mess;
  onClick: () => void;
}

const MessCard: React.FC<MessCardProps> = ({ mess, onClick }) => {
  const getLunchHours = () => {
    if (!mess.operatingHours.lunch) return 'Not available';
    return `${mess.operatingHours.lunch.open} - ${mess.operatingHours.lunch.close}`;
  };

  const getDinnerHours = () => {
    if (!mess.operatingHours.dinner) return 'Not available';
    return `${mess.operatingHours.dinner.open} - ${mess.operatingHours.dinner.close}`;
  };

  const getSubscriptionInfo = () => {
    const plans = mess.subscriptionPlans.map(plan => 
      `${plan.mealType}: ₹${plan.pricePerMeal}`
    ).join(' | ');
    return plans || 'No subscription plans available';
  };

  return (
    <Card>
      <CardActionArea onClick={onClick}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {mess.name}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <LocationIcon sx={{ mr: 1, fontSize: 'small' }} />
            <Typography variant="body2" color="text.secondary">
              {mess.location}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <AccessTimeIcon sx={{ mr: 1, fontSize: 'small' }} />
            <Typography variant="body2" color="text.secondary">
              Lunch: {getLunchHours()}
              <br />
              Dinner: {getDinnerHours()}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <RestaurantIcon sx={{ mr: 1, fontSize: 'small' }} />
            <Typography variant="body2" color="text.secondary">
              {getSubscriptionInfo()}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Rating value={mess.averageRating} readOnly size="small" />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                ({mess.ratings.length})
              </Typography>
            </Box>
            <Chip
              size="small"
              label={mess.isOpen ? 'Open' : 'Closed'}
              color={mess.isOpen ? 'success' : 'error'}
            />
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default MessCard; 