import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Chip
} from '@mui/material';
import { RestaurantMenu, AccessTime, AttachMoney } from '@mui/icons-material';

interface MealItem {
  name: string;
  items: string[];
}

interface DailyMenuProps {
  day: string;
  meals: {
    breakfast: MealItem;
    lunch: MealItem;
    evening: MealItem;
    dinner: MealItem;
  };
}

const MEAL_TIMINGS = {
  breakfast: "7:30 AM - 9:30 AM",
  lunch: "12:30 PM - 2:30 PM",
  evening: "4:30 PM - 5:30 PM",
  dinner: "7:30 PM - 9:30 PM"
};

const DailyMenuView: React.FC<DailyMenuProps> = ({ day, meals }) => {
  return (
    <Card elevation={3} sx={{ mb: 2 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" component="h2">
            {day}'s Menu
          </Typography>
          <Chip
            icon={<AttachMoney />}
            label="₹100 per day"
            color="primary"
            variant="outlined"
          />
        </Box>
        
        <Divider sx={{ mb: 2 }} />

        {Object.entries(meals).map(([mealType, meal]) => (
          <Box key={mealType} mb={3}>
            <Box display="flex" alignItems="center" mb={1}>
              <RestaurantMenu sx={{ mr: 1 }} color="primary" />
              <Typography variant="h6" component="h3" sx={{ textTransform: 'capitalize' }}>
                {mealType}
              </Typography>
              <Box display="flex" alignItems="center" ml={2}>
                <AccessTime sx={{ fontSize: '0.9rem', mr: 0.5 }} color="action" />
                <Typography variant="body2" color="text.secondary">
                  {MEAL_TIMINGS[mealType as keyof typeof MEAL_TIMINGS]}
                </Typography>
              </Box>
            </Box>

            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableBody>
                  {meal.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell component="th" scope="row">
                        {item}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        ))}
      </CardContent>
    </Card>
  );
};

export default DailyMenuView; 