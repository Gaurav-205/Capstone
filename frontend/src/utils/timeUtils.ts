interface MealTiming {
  start: string; // 24-hour format HH:mm
  end: string;   // 24-hour format HH:mm
}

interface MessTimings {
  breakfast?: MealTiming;
  lunch?: MealTiming;
  dinner?: MealTiming;
}

const defaultMessTimings: MessTimings = {
  breakfast: { start: '07:30', end: '09:30' },
  lunch: { start: '12:00', end: '14:30' },
  dinner: { start: '19:00', end: '21:30' }
};

export const getCurrentMeal = (): 'breakfast' | 'lunch' | 'dinner' | null => {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes(); // Convert to minutes since midnight

  const convertTimeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  for (const [meal, timing] of Object.entries(defaultMessTimings)) {
    const startMinutes = convertTimeToMinutes(timing.start);
    const endMinutes = convertTimeToMinutes(timing.end);
    
    if (currentTime >= startMinutes && currentTime <= endMinutes) {
      return meal as 'breakfast' | 'lunch' | 'dinner';
    }
  }

  return null;
};

export const isMessOpen = (messTimings: MessTimings = defaultMessTimings): boolean => {
  const currentMeal = getCurrentMeal();
  return currentMeal !== null;
};

export const getNextMeal = (): { meal: string; timeUntil: string } => {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();

  const convertTimeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  let nextMeal = '';
  let minTimeUntil = Infinity;

  for (const [meal, timing] of Object.entries(defaultMessTimings)) {
    const startMinutes = convertTimeToMinutes(timing.start);
    let timeUntil = startMinutes - currentTime;
    
    if (timeUntil < 0) {
      timeUntil += 24 * 60; // Add 24 hours if time is for next day
    }
    
    if (timeUntil < minTimeUntil) {
      minTimeUntil = timeUntil;
      nextMeal = meal;
    }
  }

  const hours = Math.floor(minTimeUntil / 60);
  const minutes = minTimeUntil % 60;
  const timeString = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

  return { meal: nextMeal, timeUntil: timeString };
}; 