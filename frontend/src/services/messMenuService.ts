import { API_URL } from '../config';

export interface MenuItem {
  name: string;
  items: string[];
}

export interface DayMenu {
  breakfast: MenuItem;
  lunch: MenuItem;
  evening: { name: 'EVE. TEA', items: string[] };
  dinner: MenuItem;
}

export interface WeeklyMenu {
  [key: string]: DayMenu;
}

// This is the static menu data from the image
export const MENU_DATA: WeeklyMenu = {
  Monday: {
    breakfast: {
      name: 'Breakfast',
      items: ['Meduwada, Sambar', 'Mix Sprouts', 'Milk, Tea, Kellogs', 'Fruits']
    },
    lunch: {
      name: 'Lunch',
      items: [
        'Chhote Punjabi',
        'Veg Manchurian',
        'Jeera Rice',
        'Dal Fry',
        'Chapati',
        'Sweet Lassi / Curd',
        'Salad, Pickle'
      ]
    },
    evening: {
      name: 'EVE. TEA',
      items: ['TEA, COFFEE, MILK']
    },
    dinner: {
      name: 'Dinner',
      items: [
        'Baigan Bharta',
        'Dal Bati',
        'Plain Rice',
        'Dal Fry',
        'Chapati',
        'Papad, Onion, Lemon',
        'Moong Dal Halwa'
      ]
    }
  },
  Tuesday: {
    breakfast: {
      name: 'Breakfast',
      items: ['Misal Pav', 'Upma', 'Tea, Milk, Horlics', 'Fruits']
    },
    lunch: {
      name: 'Lunch',
      items: [
        'Kala Chana (Gravy)',
        'Veg Biryani',
        'Chapati',
        'Pickle, Onion, Lemon',
        'Fryms',
        'Dahi Wada',
        'Red Chutney'
      ]
    },
    evening: {
      name: 'EVE. TEA',
      items: ['TEA, COFFEE, MILK']
    },
    dinner: {
      name: 'Dinner',
      items: [
        'Bhindi masala Dry',
        'Kaju Mutter',
        'Jeera Rice',
        'Dal Triveni',
        'Chapati',
        'THECHA, Salad, Pickle',
        'Sooji Halwa (Pineapple)'
      ]
    }
  },
  Wednesday: {
    breakfast: {
      name: 'Breakfast',
      items: ['Bread-Butter-Jam', 'Omelette-Poha', 'Tea, Milk, Bournvita', 'Fruits']
    },
    lunch: {
      name: 'Lunch',
      items: [
        'Paneer Mutter',
        'Moong Ussal',
        'Jeera Rice',
        'Dal Plain',
        'Chapati',
        'Onion Lemon Pickle',
        'Egg Curry'
      ]
    },
    evening: {
      name: 'EVE. TEA',
      items: ['TEA, COFFEE, MILK']
    },
    dinner: {
      name: 'Dinner',
      items: [
        'Papdi Chat',
        'Soya 65',
        'Pulao',
        'Mutter Tomato Rasa',
        'Chapati',
        'Papad, Onion, Lemon',
        'Balushahi'
      ]
    }
  },
  Thursday: {
    breakfast: {
      name: 'Breakfast',
      items: ['Idli, Sambar, Chutney', 'Vermicelli Upma', 'Milk, Tea, Kellogs', 'Fruits']
    },
    lunch: {
      name: 'Lunch',
      items: [
        'Veg Pahadi',
        'Soya wadi',
        'Birista Pulao',
        'Dahi Kadi (Plain)',
        'Chapati',
        'Senga Chutney, Pickle',
        'Onion Lemon, Salad'
      ]
    },
    evening: {
      name: 'EVE. TEA',
      items: ['TEA, COFFEE, MILK']
    },
    dinner: {
      name: 'Dinner',
      items: [
        'Chole Pindi',
        'Masala Bhat',
        'Poori',
        'Disco Papad',
        'Onion, Lemon',
        'Mint Chutney, Pickle',
        'Shrikhand'
      ]
    }
  },
  Friday: {
    breakfast: {
      name: 'Breakfast',
      items: ['Bread-Butter-Jam', 'Omelette-Poha', 'Tea, Milk, Bournvita', 'Fruits']
    },
    lunch: {
      name: 'Lunch',
      items: [
        'Malai Kofta',
        'Aloo Shimla',
        'Coriander Rice',
        'Dal Methi',
        'Chapati',
        'Juliane Salad',
        'Onion Lemon Pickle'
      ]
    },
    evening: {
      name: 'EVE. TEA',
      items: ['TEA, COFFEE, MILK']
    },
    dinner: {
      name: 'Dinner',
      items: [
        'Paneer Tikka Masala',
        'Egg Curry',
        'Tawa Pulao',
        'Chapati',
        'Onion, Lemon, Pickle',
        'Red, Chutney/Papad',
        'Gajar Halwa'
      ]
    }
  },
  Saturday: {
    breakfast: {
      name: 'Breakfast',
      items: ['Aloo Paratha+Methi', 'Curd, Pickle, Dhosa', 'Tea, Milk, Choose', 'Fruits']
    },
    lunch: {
      name: 'Lunch',
      items: [
        'Kala Masoor (Dry)',
        'Sev Bhaji',
        'Jeera Rice',
        'Dal Makhani',
        'Chapati',
        'Jaledi, Corn Chat',
        'Papad Lemon Pickle'
      ]
    },
    evening: {
      name: 'EVE. TEA',
      items: ['TEA, COFFEE, MILK']
    },
    dinner: {
      name: 'Dinner',
      items: [
        'Pav Bhaji',
        'Masala Rice',
        'Gawar Subha (Masala)',
        'Chapati',
        'Salad',
        'Onion, Lemon, Pickle',
        'Fruit Custard'
      ]
    }
  },
  Sunday: {
    breakfast: {
      name: 'Breakfast',
      items: ['Uttapam+Sambar', 'Sago', 'Milk, Tea, Kellogs']
    },
    lunch: {
      name: 'Lunch',
      items: [
        'Paneer Angara',
        'Tomato Chutney',
        'Plain Rice',
        'Dal Makhani',
        'Chapati',
        'Traffic Jamun, Papad',
        'Ring Onion'
      ]
    },
    evening: {
      name: 'EVE. TEA',
      items: ['TEA, COFFEE, MILK']
    },
    dinner: {
      name: 'Dinner',
      items: [
        'Hakka Noodles',
        'Fried Rice',
        'Cabbage Salad',
        'Chapati, Papad',
        'Gobi Mutter Rasa',
        'Schezwan Sauce',
        'Rasgulle'
      ]
    }
  }
};

export const getMenuForDay = (day: string): DayMenu => {
  return MENU_DATA[day] || null;
};

export const getAllDays = (): string[] => {
  return Object.keys(MENU_DATA);
}; 