export interface MenuItem {
  name: string;
  isMainCourse?: boolean;
}

export interface MenuSection {
  mealType: 'Breakfast' | 'Lunch' | 'Evening Tea' | 'Dinner';
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  items: MenuItem[];
}

export interface OperatingHours {
  breakfast?: {
    open: string;
    close: string;
  };
  lunch?: {
    open: string;
    close: string;
    price?: number;
  };
  eveningTea?: {
    open: string;
    close: string;
  };
  dinner?: {
    open: string;
    close: string;
    price?: number;
  };
}

export interface SubscriptionPlan {
  mealType: 'Lunch' | 'Dinner';
  pricePerMeal: number;
}

export interface MessRating {
  userId: string;
  rating: number;
  review?: string;
  photos?: string[];
  tags?: string[];
  createdAt: string;
}

export interface Subscription {
  userId: string;
  mealType: 'Lunch' | 'Dinner';
  isActive: boolean;
  mealCount: number;
}

export interface Mess {
  _id: string;
  name: string;
  type: 'mess' | 'canteen';
  location: string;
  operatingHours: OperatingHours;
  isOpen: boolean;
  menu: MenuSection[];
  subscriptionPlans: SubscriptionPlan[];
  ratings: MessRating[];
  averageRating: number;
  subscriptions: Subscription[];
} 