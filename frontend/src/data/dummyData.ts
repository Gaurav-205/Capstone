export const dummyHostels = [
  {
    _id: '1',
    name: 'Boys Hostel A',
    type: 'Boys',
    totalRooms: 100,
    occupiedRooms: 85,
    location: {
      building: 'Block A',
      floor: 'Ground to 3rd Floor',
      coordinates: {
        lat: 20.5937,
        lng: 78.9629
      }
    },
    contactInfo: {
      warden: {
        name: 'Dr. Rajesh Kumar',
        phone: '+91-9876543210',
        email: 'warden.hostelA@university.edu'
      },
      admin: {
        name: 'Mr. Amit Sharma',
        phone: '+91-9876543211',
        email: 'admin.hostelA@university.edu'
      }
    },
    facilities: [
      {
        name: 'Common Room',
        description: 'Spacious common room with TV and indoor games',
        isAvailable: true
      },
      {
        name: 'Laundry Room',
        description: 'Washing machines and dryers available',
        isAvailable: true
      },
      {
        name: 'Study Room',
        description: '24/7 study room with individual cubicles',
        isAvailable: true
      }
    ],
    rules: [
      'No visitors after 10 PM',
      'Maintain silence during study hours (10 PM - 6 AM)',
      'Keep rooms and common areas clean',
      'Report any maintenance issues to the admin'
    ],
    images: [
      'https://images.unsplash.com/photo-1555852105-64f35b45c695?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      'https://images.unsplash.com/photo-1555852105-64f35b45c695?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
    ]
  },
  {
    _id: '2',
    name: 'Girls Hostel B',
    type: 'Girls',
    totalRooms: 80,
    occupiedRooms: 75,
    location: {
      building: 'Block B',
      floor: 'Ground to 3rd Floor',
      coordinates: {
        lat: 20.5938,
        lng: 78.9630
      }
    },
    contactInfo: {
      warden: {
        name: 'Dr. Priya Sharma',
        phone: '+91-9876543212',
        email: 'warden.hostelB@university.edu'
      },
      admin: {
        name: 'Ms. Neha Gupta',
        phone: '+91-9876543213',
        email: 'admin.hostelB@university.edu'
      }
    },
    facilities: [
      {
        name: 'Common Room',
        description: 'Common room with TV and recreational facilities',
        isAvailable: true
      },
      {
        name: 'Laundry Room',
        description: 'Washing machines and dryers available',
        isAvailable: true
      },
      {
        name: 'Study Room',
        description: 'Study room with individual cubicles',
        isAvailable: true
      }
    ],
    rules: [
      'No visitors after 9 PM',
      'Maintain silence during study hours (10 PM - 6 AM)',
      'Keep rooms and common areas clean',
      'Report any maintenance issues to the admin'
    ],
    images: [
      'https://images.unsplash.com/photo-1555852105-64f35b45c695?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      'https://images.unsplash.com/photo-1555852105-64f35b45c695?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
    ]
  }
];

export const dummyFacilities = [
  {
    _id: '1',
    name: 'Central Library',
    type: 'Library',
    description: 'Main university library with extensive collection of books and digital resources',
    location: {
      building: 'Library Block',
      floor: 'Ground to 4th Floor',
      coordinates: {
        lat: 20.5939,
        lng: 78.9631
      }
    },
    operatingHours: {
      monday: { open: '8:00 AM', close: '10:00 PM' },
      tuesday: { open: '8:00 AM', close: '10:00 PM' },
      wednesday: { open: '8:00 AM', close: '10:00 PM' },
      thursday: { open: '8:00 AM', close: '10:00 PM' },
      friday: { open: '8:00 AM', close: '10:00 PM' },
      saturday: { open: '9:00 AM', close: '6:00 PM' },
      sunday: { open: '9:00 AM', close: '6:00 PM' }
    },
    isOpen: true,
    specialAccess: {
      required: false,
      description: 'Open to all students with valid ID cards'
    },
    contactInfo: {
      inCharge: {
        name: 'Dr. Suresh Verma',
        phone: '+91-9876543214',
        email: 'library@university.edu'
      }
    },
    images: [
      'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
    ],
    rules: [
      'Maintain silence',
      'No food or drinks allowed',
      'Show ID card at entrance',
      'Follow library guidelines'
    ]
  },
  {
    _id: '2',
    name: 'Computer Lab',
    type: 'Lab',
    description: 'State-of-the-art computer laboratory with latest software and hardware',
    location: {
      building: 'Computer Science Block',
      floor: '2nd Floor',
      coordinates: {
        lat: 20.5940,
        lng: 78.9632
      }
    },
    operatingHours: {
      monday: { open: '9:00 AM', close: '8:00 PM' },
      tuesday: { open: '9:00 AM', close: '8:00 PM' },
      wednesday: { open: '9:00 AM', close: '8:00 PM' },
      thursday: { open: '9:00 AM', close: '8:00 PM' },
      friday: { open: '9:00 AM', close: '8:00 PM' },
      saturday: { open: '10:00 AM', close: '5:00 PM' },
      sunday: { open: 'Closed', close: 'Closed' }
    },
    isOpen: true,
    specialAccess: {
      required: true,
      description: 'Access requires department approval and lab card'
    },
    contactInfo: {
      inCharge: {
        name: 'Dr. Amit Patel',
        phone: '+91-9876543215',
        email: 'lab.cs@university.edu'
      }
    },
    images: [
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
    ],
    rules: [
      'No food or drinks allowed',
      'Show lab card at entrance',
      'Follow lab guidelines',
      'Report any technical issues'
    ]
  },
  {
    _id: '3',
    name: 'University Gym',
    type: 'Gym',
    description: 'Modern gymnasium with cardio and strength training equipment',
    location: {
      building: 'Sports Complex',
      floor: 'Ground Floor',
      coordinates: {
        lat: 20.5941,
        lng: 78.9633
      }
    },
    operatingHours: {
      monday: { open: '6:00 AM', close: '10:00 PM' },
      tuesday: { open: '6:00 AM', close: '10:00 PM' },
      wednesday: { open: '6:00 AM', close: '10:00 PM' },
      thursday: { open: '6:00 AM', close: '10:00 PM' },
      friday: { open: '6:00 AM', close: '10:00 PM' },
      saturday: { open: '7:00 AM', close: '9:00 PM' },
      sunday: { open: '7:00 AM', close: '9:00 PM' }
    },
    isOpen: true,
    specialAccess: {
      required: true,
      description: 'Requires gym membership and medical certificate'
    },
    contactInfo: {
      inCharge: {
        name: 'Mr. Rahul Singh',
        phone: '+91-9876543216',
        email: 'gym@university.edu'
      }
    },
    images: [
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
    ],
    rules: [
      'Wear appropriate gym attire',
      'Follow trainer instructions',
      'Clean equipment after use',
      'Show membership card at entrance'
    ]
  }
]; 