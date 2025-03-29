const mongoose = require('mongoose');
const Mess = require('../models/Mess');

const sampleMesses = [
  {
    name: "Royal Foods",
    type: "mess",
    location: "MIT-ADT University, Rajbaug Campus, Loni Kalbhor Pune 402201",
    operatingHours: {
      breakfast: {
        open: "07:30",
        close: "09:30"
      },
      lunch: {
        open: "12:30",
        close: "14:30",
        price: 120
      },
      eveningTea: {
        open: "16:30",
        close: "17:30"
      },
      dinner: {
        open: "19:30",
        close: "21:30",
        price: 120
      }
    },
    isOpen: true,
    menu: [
      // Monday
      {
        mealType: "Breakfast",
        dayOfWeek: "Monday",
        items: [
          { name: "Meduwada, Sambar" },
          { name: "Mix Sprouts" },
          { name: "Milk, Tea, Kelloggs" },
          { name: "Fruits" }
        ]
      },
      {
        mealType: "Lunch",
        dayOfWeek: "Monday",
        items: [
          { name: "Chole Punjabi", isMainCourse: true },
          { name: "Veg Manchurian", isMainCourse: true },
          { name: "Jeera Rice" },
          { name: "Dal Fry" },
          { name: "Chapati" },
          { name: "Sweet Lassi / Curd" },
          { name: "Salad, Pickle" }
        ]
      },
      {
        mealType: "Evening Tea",
        dayOfWeek: "Monday",
        items: [
          { name: "TEA, COFFEE, MILK" }
        ]
      },
      {
        mealType: "Dinner",
        dayOfWeek: "Monday",
        items: [
          { name: "Baigan Bharta", isMainCourse: true },
          { name: "Dal Bati" },
          { name: "Plain Rice" },
          { name: "Dal Fry" },
          { name: "Chapati" },
          { name: "Papad, Onion, Lemon" },
          { name: "Moong Dal Halwa" }
        ]
      },
      // Tuesday
      {
        mealType: "Breakfast",
        dayOfWeek: "Tuesday",
        items: [
          { name: "Misal Pav" },
          { name: "Upma" },
          { name: "Tea, Milk, Horlics" },
          { name: "Fruits" }
        ]
      },
      {
        mealType: "Lunch",
        dayOfWeek: "Tuesday",
        items: [
          { name: "Kala Chana (Gravy)", isMainCourse: true },
          { name: "Veg Biryani", isMainCourse: true },
          { name: "Chapati" },
          { name: "Pickle, Onion, Lemon" },
          { name: "Fryms" },
          { name: "Dahi Wada" },
          { name: "Red Chutney" }
        ]
      },
      {
        mealType: "Evening Tea",
        dayOfWeek: "Tuesday",
        items: [
          { name: "TEA, COFFEE, MILK" }
        ]
      },
      {
        mealType: "Dinner",
        dayOfWeek: "Tuesday",
        items: [
          { name: "Bhindi masala Dry", isMainCourse: true },
          { name: "Kaju Mutter" },
          { name: "Jeera Rice" },
          { name: "Dal Triveni" },
          { name: "Chapati" },
          { name: "THECHA, Salad, Pickle" },
          { name: "Sooji Halwa (Pineapple)" }
        ]
      },
      // Wednesday
      {
        mealType: "Breakfast",
        dayOfWeek: "Wednesday",
        items: [
          { name: "Bread-Butter-Jam" },
          { name: "Omelette-Poha" },
          { name: "Tea, Milk, Bournvita" },
          { name: "Fruits" }
        ]
      },
      {
        mealType: "Lunch",
        dayOfWeek: "Wednesday",
        items: [
          { name: "Paneer Mutter", isMainCourse: true },
          { name: "Moong Ussal" },
          { name: "Jeera Rice" },
          { name: "Dal Plain" },
          { name: "Chapati" },
          { name: "Onion Lemon Pickle" },
          { name: "Egg Curry" }
        ]
      },
      {
        mealType: "Evening Tea",
        dayOfWeek: "Wednesday",
        items: [
          { name: "TEA, COFFEE, MILK" }
        ]
      },
      {
        mealType: "Dinner",
        dayOfWeek: "Wednesday",
        items: [
          { name: "Papdi Chat" },
          { name: "Soya 65" },
          { name: "Pulao" },
          { name: "Mutter Tomato Rasa" },
          { name: "Chapati" },
          { name: "Papad, Onion, Lemon" },
          { name: "Balushahi" }
        ]
      },
      // Thursday
      {
        mealType: "Breakfast",
        dayOfWeek: "Thursday",
        items: [
          { name: "Idli, Sambar, Chutney" },
          { name: "Vermicelli Upma" },
          { name: "Milk, Tea, Kelloggs" },
          { name: "Fruits" }
        ]
      },
      {
        mealType: "Lunch",
        dayOfWeek: "Thursday",
        items: [
          { name: "Veg Pahadi", isMainCourse: true },
          { name: "Soya wadi" },
          { name: "Birista Pulao" },
          { name: "Dahi Kadi (Plain)" },
          { name: "Chapati" },
          { name: "Senga Chutney, Pickle" },
          { name: "Onion Lemon, Salad" }
        ]
      },
      {
        mealType: "Evening Tea",
        dayOfWeek: "Thursday",
        items: [
          { name: "TEA, COFFEE, MILK" }
        ]
      },
      {
        mealType: "Dinner",
        dayOfWeek: "Thursday",
        items: [
          { name: "Chole Pindi", isMainCourse: true },
          { name: "Masala Bhat" },
          { name: "Poori" },
          { name: "Disco Papad" },
          { name: "Onion, Lemon" },
          { name: "Mint Chutney, Pickle" },
          { name: "Shrikhand" }
        ]
      },
      // Friday
      {
        mealType: "Breakfast",
        dayOfWeek: "Friday",
        items: [
          { name: "Bread-Butter-Jam" },
          { name: "Omelette-Poha" },
          { name: "Tea, Milk, Bournvita" },
          { name: "Fruits" }
        ]
      },
      {
        mealType: "Lunch",
        dayOfWeek: "Friday",
        items: [
          { name: "Malai Kofta", isMainCourse: true },
          { name: "Aloo Shimla" },
          { name: "Coriander Rice" },
          { name: "Dal Methi" },
          { name: "Chapati" },
          { name: "Juliane Salad" },
          { name: "Onion Lemon Pickle" }
        ]
      },
      {
        mealType: "Evening Tea",
        dayOfWeek: "Friday",
        items: [
          { name: "TEA, COFFEE, MILK" }
        ]
      },
      {
        mealType: "Dinner",
        dayOfWeek: "Friday",
        items: [
          { name: "Paneer Tikka Masala", isMainCourse: true },
          { name: "Egg Curry" },
          { name: "Tawa Pulao" },
          { name: "Chapati" },
          { name: "Onion, Lemon, Pickle" },
          { name: "Red, Chutney/Papad" },
          { name: "Gajar Halwa" }
        ]
      },
      // Saturday
      {
        mealType: "Breakfast",
        dayOfWeek: "Saturday",
        items: [
          { name: "Aloo Paratha+Methi" },
          { name: "Curd, Pickle, Dhosa" },
          { name: "Tea, Milk, Choose" }
        ]
      },
      {
        mealType: "Lunch",
        dayOfWeek: "Saturday",
        items: [
          { name: "Kala Masoor (Dry)", isMainCourse: true },
          { name: "Sev Bhaji" },
          { name: "Jeera Rice" },
          { name: "Dal Makhani" },
          { name: "Chapati" },
          { name: "Jaledi, Corn Chat" },
          { name: "Papad Lemon Pickle" }
        ]
      },
      {
        mealType: "Evening Tea",
        dayOfWeek: "Saturday",
        items: [
          { name: "TEA, COFFEE, MILK" }
        ]
      },
      {
        mealType: "Dinner",
        dayOfWeek: "Saturday",
        items: [
          { name: "Pav Bhaji", isMainCourse: true },
          { name: "Masala Rice" },
          { name: "Gawar Subha (Masala)" },
          { name: "Chapati" },
          { name: "Salad" },
          { name: "Onion, Lemon, Pickle" },
          { name: "Fruit Custard" }
        ]
      },
      // Sunday
      {
        mealType: "Breakfast",
        dayOfWeek: "Sunday",
        items: [
          { name: "Uttapam sambar" },
          { name: "Peas" },
          { name: "Milk, Tea, Kelloggs" }
        ]
      },
      {
        mealType: "Lunch",
        dayOfWeek: "Sunday",
        items: [
          { name: "Paneer Angara", isMainCourse: true },
          { name: "Tomato Chutney" },
          { name: "Plain Rice" },
          { name: "Dal Tadka" },
          { name: "Chapati" },
          { name: "Traffic Jamun, Papad" },
          { name: "Ring Onion" }
        ]
      },
      {
        mealType: "Evening Tea",
        dayOfWeek: "Sunday",
        items: [
          { name: "TEA, COFFEE, MILK" }
        ]
      },
      {
        mealType: "Dinner",
        dayOfWeek: "Sunday",
        items: [
          { name: "Hakka Noodles", isMainCourse: true },
          { name: "Fried Rice" },
          { name: "Seasonal Salad" },
          { name: "Chapati, Papad" },
          { name: "Gobi Mutter Rasa" },
          { name: "Schezwan Sauce" },
          { name: "Rasgulle" }
        ]
      }
    ],
    subscriptionPlans: [
      {
        mealType: "Lunch",
        pricePerMeal: 120
      },
      {
        mealType: "Dinner",
        pricePerMeal: 120
      }
    ],
    ratings: [],
    averageRating: 0
  },
  {
    name: "Tech Cafe",
    type: "canteen",
    location: "Engineering Block",
    operatingHours: {
      breakfast: {
        open: "09:00",
        close: "20:00"
      },
      lunch: {
        open: "09:00",
        close: "20:00"
      },
      eveningTea: {
        open: "09:00",
        close: "20:00"
      },
      dinner: {
        open: "09:00",
        close: "20:00"
      }
    },
    isOpen: true,
    menu: [
      {
        mealType: "Lunch",
        dayOfWeek: "Monday",
        items: [
          { name: "Veg Sandwich", isMainCourse: true },
          { name: "Masala Dosa", isMainCourse: true }
        ]
      },
      {
        mealType: "Lunch",
        dayOfWeek: "Tuesday",
        items: [
          { name: "Pizza", isMainCourse: true },
          { name: "Pasta", isMainCourse: true }
        ]
      },
      {
        mealType: "Lunch",
        dayOfWeek: "Wednesday",
        items: [
          { name: "Veg Sandwich", isMainCourse: true },
          { name: "Masala Dosa", isMainCourse: true }
        ]
      },
      {
        mealType: "Lunch",
        dayOfWeek: "Thursday",
        items: [
          { name: "Pizza", isMainCourse: true },
          { name: "Pasta", isMainCourse: true }
        ]
      },
      {
        mealType: "Lunch",
        dayOfWeek: "Friday",
        items: [
          { name: "Veg Sandwich", isMainCourse: true },
          { name: "Masala Dosa", isMainCourse: true }
        ]
      },
      {
        mealType: "Lunch",
        dayOfWeek: "Saturday",
        items: [
          { name: "Pizza", isMainCourse: true },
          { name: "Pasta", isMainCourse: true }
        ]
      },
      {
        mealType: "Lunch",
        dayOfWeek: "Sunday",
        items: [
          { name: "Veg Sandwich", isMainCourse: true },
          { name: "Masala Dosa", isMainCourse: true }
        ]
      }
    ],
    subscriptionPlans: [],
    ratings: [],
    averageRating: 0
  }
];

const seedMesses = async () => {
  try {
    // Clear existing data
    await Mess.deleteMany({});
    
    // Insert sample data
    await Mess.insertMany(sampleMesses);
    
    console.log('Sample mess data seeded successfully');
  } catch (error) {
    console.error('Error seeding mess data:', error);
  }
};

module.exports = seedMesses; 