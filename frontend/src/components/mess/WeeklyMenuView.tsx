import React, { useState, useEffect } from 'react';
import { 
  Container,
  Box,
  Tabs,
  Tab,
  Typography,
  useTheme,
  useMediaQuery,
  Paper,
  Chip
} from '@mui/material';
import DailyMenuView from './DailyMenuView';
import { getMenuForDay, getAllDays, DayMenu } from '../../services/messMenuService';
import { AttachMoney } from '@mui/icons-material';

const WeeklyMenuView: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [dayMenu, setDayMenu] = useState<DayMenu | null>(null);
  const days = getAllDays();

  useEffect(() => {
    setSelectedDay(days[0]);
  }, [days]);

  useEffect(() => {
    if (selectedDay) {
      const menu = getMenuForDay(selectedDay);
      setDayMenu(menu);
    }
  }, [selectedDay]);

  const handleDayChange = (event: React.SyntheticEvent, newValue: string) => {
    setSelectedDay(newValue);
  };

  if (!selectedDay || !dayMenu) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <Typography>Loading menu...</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ width: '100%', mt: 3 }}>
        <Paper elevation={3} sx={{ p: 2, mb: 3, backgroundColor: 'primary.main', color: 'white' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h5">Mess Menu Rates</Typography>
            <Box>
              <Chip 
                icon={<AttachMoney />}
                label="Lunch: ₹100/meal"
                sx={{ 
                  mr: 1,
                  backgroundColor: 'white',
                  '& .MuiChip-icon': { color: 'primary.main' },
                  color: 'primary.main'
                }}
              />
              <Chip 
                icon={<AttachMoney />}
                label="Dinner: ₹100/meal"
                sx={{ 
                  backgroundColor: 'white',
                  '& .MuiChip-icon': { color: 'primary.main' },
                  color: 'primary.main'
                }}
              />
            </Box>
          </Box>
        </Paper>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={selectedDay}
            onChange={handleDayChange}
            variant={isMobile ? "scrollable" : "fullWidth"}
            scrollButtons={isMobile ? "auto" : false}
            allowScrollButtonsMobile
            aria-label="mess menu days"
          >
            {days.map((day) => (
              <Tab 
                key={day}
                label={day}
                value={day}
                sx={{ 
                  fontWeight: selectedDay === day ? 'bold' : 'normal',
                  color: selectedDay === day ? 'primary.main' : 'text.primary'
                }}
              />
            ))}
          </Tabs>
        </Box>

        <DailyMenuView 
          day={selectedDay}
          meals={dayMenu}
        />
      </Box>
    </Container>
  );
};

export default WeeklyMenuView; 