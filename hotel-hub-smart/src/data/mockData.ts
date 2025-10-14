export type RoomStatus = "available" | "occupied" | "cleaning" | "maintenance";
export type RoomType = "single" | "double" | "suite" | "deluxe";
export type RoomCategory = "economy" | "standard" | "premium" | "luxury";
export type PaymentMethod = "cash" | "mpesa" | "card" | "bank_transfer";

export interface Room {
  id: string;
  number: string;
  type: RoomType;
  category: RoomCategory;
  status: RoomStatus;
  price: number;
  floor: number;
  capacity: number;
  amenities: string[];
  description?: string;
  images?: string[];
  lastCleaned?: string;
  maintenanceNotes?: string;
}

export interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone: string;
  idNumber: string;
  nationality: string;
  address?: string;
  checkIn: string;
  checkOut: string;
  roomId?: string;
  specialRequests?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  method: PaymentMethod;
  transactionId?: string;
  status: "pending" | "completed" | "failed" | "refunded";
  timestamp: string;
}

export interface Booking {
  id: string;
  guestId: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  adults: number;
  children: number;
  status: "confirmed" | "checked-in" | "checked-out" | "cancelled";
  totalAmount: number;
  paidAmount: number;
  paymentMethod?: PaymentMethod;
  specialRequests?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HousekeepingTask {
  id: string;
  roomId: string;
  assignedTo: string;
  assignedBy: string;
  taskType: "cleaning" | "maintenance" | "inspection" | "deep_clean";
  status: "pending" | "in-progress" | "completed" | "cancelled";
  priority: "low" | "medium" | "high";
  description?: string;
  notes?: string;
  estimatedDuration: number; // in minutes
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

export const mockRooms: Room[] = [
  { 
    id: "1", 
    number: "101", 
    type: "single", 
    category: "economy",
    status: "available", 
    price: 5000, 
    floor: 1, 
    capacity: 1,
    amenities: ["WiFi", "TV", "AC", "Private Bathroom"],
    description: "Cozy single room perfect for solo travelers",
    lastCleaned: "2024-01-17T10:00:00Z"
  },
  { 
    id: "2", 
    number: "102", 
    type: "double", 
    category: "standard",
    status: "occupied", 
    price: 8000, 
    floor: 1, 
    capacity: 2,
    amenities: ["WiFi", "TV", "AC", "Private Bathroom", "Desk", "Mini Fridge"],
    description: "Comfortable double room with modern amenities",
    lastCleaned: "2024-01-16T14:00:00Z"
  },
  { 
    id: "3", 
    number: "103", 
    type: "suite", 
    category: "premium",
    status: "available", 
    price: 15000, 
    floor: 1, 
    capacity: 4,
    amenities: ["WiFi", "Smart TV", "AC", "Private Bathroom", "Living Area", "Kitchenette", "Balcony"],
    description: "Spacious suite with separate living area and kitchenette",
    lastCleaned: "2024-01-17T11:00:00Z"
  },
  { 
    id: "4", 
    number: "201", 
    type: "single", 
    category: "standard",
    status: "cleaning", 
    price: 5000, 
    floor: 2, 
    capacity: 1,
    amenities: ["WiFi", "TV", "AC", "Private Bathroom", "Work Desk"],
    description: "Modern single room with work space"
  },
  { 
    id: "5", 
    number: "202", 
    type: "double", 
    category: "standard",
    status: "available", 
    price: 8000, 
    floor: 2, 
    capacity: 2,
    amenities: ["WiFi", "TV", "AC", "Private Bathroom", "Mini Fridge", "Coffee Maker"],
    description: "Comfortable double room with coffee facilities",
    lastCleaned: "2024-01-17T09:00:00Z"
  },
  { 
    id: "6", 
    number: "203", 
    type: "deluxe", 
    category: "luxury",
    status: "occupied", 
    price: 20000, 
    floor: 2, 
    capacity: 3,
    amenities: ["WiFi", "Smart TV", "AC", "Luxury Bathroom", "King Bed", "Sofa", "Mini Bar", "Room Service"],
    description: "Luxury deluxe room with premium amenities",
    lastCleaned: "2024-01-16T16:00:00Z"
  },
  { 
    id: "7", 
    number: "301", 
    type: "suite", 
    category: "luxury",
    status: "maintenance", 
    price: 15000, 
    floor: 3, 
    capacity: 4,
    amenities: ["WiFi", "Smart TV", "AC", "Luxury Bathroom", "Living Area", "Kitchenette", "Balcony", "Jacuzzi"],
    description: "Presidential suite with jacuzzi and panoramic view",
    maintenanceNotes: "AC unit needs repair - scheduled for tomorrow"
  },
  { 
    id: "8", 
    number: "302", 
    type: "double", 
    category: "premium",
    status: "available", 
    price: 8000, 
    floor: 3, 
    capacity: 2,
    amenities: ["WiFi", "Smart TV", "AC", "Private Bathroom", "Mini Fridge", "Coffee Maker", "City View"],
    description: "Premium double room with stunning city view",
    lastCleaned: "2024-01-17T08:00:00Z"
  },
];

export const mockGuests: Guest[] = [
  {
    id: "1",
    firstName: "John",
    lastName: "Doe",
    name: "John Doe",
    email: "john@example.com",
    phone: "+254712345678",
    idNumber: "12345678",
    nationality: "Kenyan",
    address: "123 Nairobi Street, Nairobi",
    checkIn: "2024-01-15",
    checkOut: "2024-01-18",
    roomId: "2",
    specialRequests: "Late checkout requested",
    emergencyContact: {
      name: "Mary Doe",
      phone: "+254712345679",
      relationship: "Wife"
    }
  },
  {
    id: "2",
    firstName: "Jane",
    lastName: "Smith",
    name: "Jane Smith",
    email: "jane@example.com",
    phone: "+254723456789",
    idNumber: "87654321",
    nationality: "British",
    address: "456 London Road, UK",
    checkIn: "2024-01-16",
    checkOut: "2024-01-20",
    roomId: "6",
    specialRequests: "Extra towels and room service",
    emergencyContact: {
      name: "Robert Smith",
      phone: "+447123456789",
      relationship: "Brother"
    }
  },
];

export const mockBookings: Booking[] = [
  {
    id: "1",
    guestId: "1",
    roomId: "2",
    checkIn: "2024-01-15",
    checkOut: "2024-01-18",
    nights: 3,
    adults: 2,
    children: 0,
    status: "checked-in",
    totalAmount: 24000,
    paidAmount: 24000,
    paymentMethod: "mpesa",
    specialRequests: "Late checkout requested",
    createdAt: "2024-01-14T10:00:00Z",
    updatedAt: "2024-01-15T14:00:00Z"
  },
  {
    id: "2",
    guestId: "2",
    roomId: "6",
    checkIn: "2024-01-16",
    checkOut: "2024-01-20",
    nights: 4,
    adults: 1,
    children: 1,
    status: "checked-in",
    totalAmount: 80000,
    paidAmount: 40000,
    paymentMethod: "card",
    specialRequests: "Extra towels and room service",
    createdAt: "2024-01-15T11:00:00Z",
    updatedAt: "2024-01-16T15:00:00Z"
  },
  {
    id: "3",
    guestId: "3",
    roomId: "3",
    checkIn: "2024-01-20",
    checkOut: "2024-01-23",
    nights: 3,
    adults: 2,
    children: 2,
    status: "confirmed",
    totalAmount: 45000,
    paidAmount: 15000,
    paymentMethod: "cash",
    specialRequests: "Ground floor room preferred",
    createdAt: "2024-01-17T09:00:00Z",
    updatedAt: "2024-01-17T09:00:00Z"
  },
];

export const mockPayments: Payment[] = [
  {
    id: "1",
    bookingId: "1",
    amount: 24000,
    method: "mpesa",
    transactionId: "MPE123456789",
    status: "completed",
    timestamp: "2024-01-15T14:00:00Z"
  },
  {
    id: "2",
    bookingId: "2",
    amount: 40000,
    method: "card",
    transactionId: "CARD987654321",
    status: "completed",
    timestamp: "2024-01-16T15:00:00Z"
  },
  {
    id: "3",
    bookingId: "3",
    amount: 15000,
    method: "cash",
    status: "completed",
    timestamp: "2024-01-17T09:30:00Z"
  },
];

export const mockHousekeepingTasks: HousekeepingTask[] = [
  {
    id: "1",
    roomId: "4",
    assignedTo: "Mary Johnson",
    assignedBy: "Reception",
    taskType: "cleaning",
    status: "in-progress",
    priority: "high",
    description: "Post-checkout deep cleaning",
    estimatedDuration: 60,
    createdAt: "2024-01-17T08:00:00Z",
    startedAt: "2024-01-17T08:30:00Z",
  },
  {
    id: "2",
    roomId: "7",
    assignedTo: "Peter Kamau",
    assignedBy: "Admin",
    taskType: "maintenance",
    status: "pending",
    priority: "medium",
    description: "AC unit repair and testing",
    notes: "Contact maintenance team for specialized tools",
    estimatedDuration: 120,
    createdAt: "2024-01-17T09:00:00Z",
  },
  {
    id: "3",
    roomId: "1",
    assignedTo: "Sarah Mwangi",
    assignedBy: "Reception",
    taskType: "cleaning",
    status: "completed",
    priority: "low",
    description: "Regular room cleaning",
    estimatedDuration: 45,
    createdAt: "2024-01-17T10:00:00Z",
    startedAt: "2024-01-17T10:00:00Z",
    completedAt: "2024-01-17T10:45:00Z",
  },
  {
    id: "4",
    roomId: "8",
    assignedTo: "Mary Johnson",
    assignedBy: "Reception",
    taskType: "inspection",
    status: "pending",
    priority: "low",
    description: "Quality check and inventory count",
    estimatedDuration: 30,
    createdAt: "2024-01-17T11:00:00Z",
  },
];

export const mockRevenueData = [
  { month: "Jan", revenue: 450000 },
  { month: "Feb", revenue: 520000 },
  { month: "Mar", revenue: 480000 },
  { month: "Apr", revenue: 600000 },
  { month: "May", revenue: 550000 },
  { month: "Jun", revenue: 680000 },
];

export const mockOccupancyData = [
  { month: "Jan", occupancy: 65 },
  { month: "Feb", occupancy: 72 },
  { month: "Mar", occupancy: 68 },
  { month: "Apr", occupancy: 80 },
  { month: "May", occupancy: 75 },
  { month: "Jun", occupancy: 85 },
];

// Food Ordering System Types and Data
export type MenuCategory = "appetizers" | "mains" | "desserts" | "beverages" | "breakfast" | "lunch" | "dinner" | "room_service";
export type OrderStatus = "pending" | "confirmed" | "preparing" | "ready" | "delivered" | "cancelled";
export type DietaryRestriction = "vegetarian" | "vegan" | "gluten-free" | "dairy-free" | "nut-free" | "halal" | "kosher";

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: MenuCategory;
  image?: string;
  isAvailable: boolean;
  preparationTime: number; // in minutes
  ingredients: string[];
  dietaryRestrictions: DietaryRestriction[];
  nutritionInfo?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  allergens?: string[];
  spicyLevel?: 1 | 2 | 3; // 1=mild, 2=medium, 3=hot
}

export interface FoodOrder {
  id: string;
  guestId: string;
  roomId?: string; // for room service
  deliveryLocation: HotelLocation; // where to deliver/pickup
  items: {
    menuItemId: string;
    quantity: number;
    specialInstructions?: string;
    price: number;
  }[];
  totalAmount: number;
  orderType: "dine-in" | "room-service" | "takeaway" | "poolside" | "spa";
  status: OrderStatus;
  orderTime: string;
  requestedDeliveryTime?: string;
  actualDeliveryTime?: string;
  specialRequests?: string;
  paymentStatus: "pending" | "paid" | "refunded";
  paymentMethod?: PaymentMethod;
  assignedKitchenStaff?: string;
  assignedDeliveryStaff?: string;
  estimatedReadyTime?: string;
  deliveryInstructions?: string;
  createdAt: string;
  updatedAt: string;
}

// Hotel Location System
export type LocationType = "room" | "restaurant" | "pool" | "spa" | "lobby" | "conference" | "garden" | "rooftop";
export type DeliveryZone = "building-a" | "building-b" | "pool-area" | "spa-area" | "conference-center" | "outdoor-areas";

export interface HotelLocation {
  id: string;
  name: string;
  type: LocationType;
  zone: DeliveryZone;
  floor?: number;
  building?: string;
  description: string;
  deliveryTime: number; // estimated delivery time in minutes
  deliveryFee: number; // additional fee for this location
  isActive: boolean;
  operatingHours?: {
    open: string;
    close: string;
  };
  specialInstructions?: string;
}

export interface DeliveryStaff {
  id: string;
  name: string;
  phone: string;
  assignedZones: DeliveryZone[];
  currentLocation?: string;
  isAvailable: boolean;
  activeOrders: string[]; // order IDs
  maxCapacity: number; // max orders at once
}

// Swimming Pool & Activities System Types and Data
export type ActivityType = "swimming" | "water-aerobics" | "pool-party" | "swimming-lesson" | "aqua-therapy" | "pool-games";
export type PoolStatus = "open" | "closed" | "maintenance" | "private-event";
export type EquipmentType = "floaties" | "goggles" | "kickboard" | "pool-noodles" | "diving-gear" | "underwater-camera";
export type ReservationStatus = "confirmed" | "checked-in" | "completed" | "cancelled" | "no-show";

export interface PoolFacility {
  id: string;
  name: string;
  type: "main-pool" | "kids-pool" | "hot-tub" | "spa-pool";
  capacity: number;
  currentOccupancy: number;
  status: PoolStatus;
  depth: {
    min: number;
    max: number;
  };
  temperature: number; // in Celsius
  amenities: string[];
  operatingHours: {
    open: string;
    close: string;
  };
  maintenanceSchedule?: {
    nextMaintenance: string;
    maintenanceType: "cleaning" | "chemical-treatment" | "equipment-check" | "deep-clean";
  };
}

export interface SwimmingActivity {
  id: string;
  name: string;
  type: ActivityType;
  description: string;
  poolId: string;
  instructor?: string;
  capacity: number;
  currentParticipants: number;
  ageRequirement?: {
    min: number;
    max?: number;
  };
  skillLevel: "beginner" | "intermediate" | "advanced" | "all-levels";
  duration: number; // in minutes
  price: number;
  equipment: string[];
  isRecurring: boolean;
  schedule: {
    dayOfWeek: string[];
    startTime: string;
    endTime: string;
  }[];
  nextSession: string;
  isActive: boolean;
}

export interface PoolReservation {
  id: string;
  guestId: string;
  poolId: string;
  activityId?: string; // if booking for a specific activity
  reservationType: "pool-access" | "activity" | "private-event" | "lane-swimming";
  date: string;
  timeSlot: {
    start: string;
    end: string;
  };
  participants: number;
  status: ReservationStatus;
  specialRequests?: string;
  equipmentRequests?: {
    equipmentType: EquipmentType;
    quantity: number;
  }[];
  totalAmount: number;
  paymentStatus: "pending" | "paid" | "refunded";
  paymentMethod?: PaymentMethod;
  checkInTime?: string;
  checkOutTime?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PoolEquipment {
  id: string;
  name: string;
  type: EquipmentType;
  totalQuantity: number;
  availableQuantity: number;
  dailyRate: number;
  condition: "excellent" | "good" | "fair" | "needs-replacement";
  lastMaintenance: string;
  nextMaintenance: string;
  isAvailable: boolean;
}

// Mock Data for Food Ordering
export const mockMenuItems: MenuItem[] = [
  {
    id: "1",
    name: "Caesar Salad",
    description: "Fresh romaine lettuce with Caesar dressing, parmesan cheese, and croutons",
    price: 1200,
    category: "appetizers",
    isAvailable: true,
    preparationTime: 10,
    ingredients: ["Romaine lettuce", "Parmesan cheese", "Croutons", "Caesar dressing"],
    dietaryRestrictions: ["vegetarian"],
    nutritionInfo: {
      calories: 350,
      protein: 8,
      carbs: 15,
      fat: 28
    },
    allergens: ["eggs", "dairy"]
  },
  {
    id: "2",
    name: "Grilled Tilapia",
    description: "Fresh tilapia grilled to perfection with herbs and lemon",
    price: 2500,
    category: "mains",
    isAvailable: true,
    preparationTime: 25,
    ingredients: ["Tilapia fish", "Herbs", "Lemon", "Olive oil"],
    dietaryRestrictions: ["gluten-free", "dairy-free"],
    nutritionInfo: {
      calories: 280,
      protein: 35,
      carbs: 2,
      fat: 12
    },
    allergens: ["fish"]
  },
  {
    id: "3",
    name: "Chocolate Lava Cake",
    description: "Warm chocolate cake with molten center, served with vanilla ice cream",
    price: 800,
    category: "desserts",
    isAvailable: true,
    preparationTime: 15,
    ingredients: ["Chocolate", "Flour", "Eggs", "Butter", "Vanilla ice cream"],
    dietaryRestrictions: ["vegetarian"],
    nutritionInfo: {
      calories: 450,
      protein: 6,
      carbs: 55,
      fat: 22
    },
    allergens: ["eggs", "dairy", "gluten"]
  },
  {
    id: "4",
    name: "Fresh Orange Juice",
    description: "Freshly squeezed orange juice",
    price: 300,
    category: "beverages",
    isAvailable: true,
    preparationTime: 5,
    ingredients: ["Fresh oranges"],
    dietaryRestrictions: ["vegan", "gluten-free", "dairy-free"],
    nutritionInfo: {
      calories: 110,
      protein: 2,
      carbs: 26,
      fat: 0
    }
  },
  {
    id: "5",
    name: "Ugali with Sukuma Wiki",
    description: "Traditional Kenyan meal with ugali and sukuma wiki",
    price: 600,
    category: "mains",
    isAvailable: true,
    preparationTime: 20,
    ingredients: ["Maize flour", "Kale", "Onions", "Tomatoes", "Oil"],
    dietaryRestrictions: ["vegan", "gluten-free", "dairy-free"],
    nutritionInfo: {
      calories: 320,
      protein: 8,
      carbs: 65,
      fat: 5
    }
  }
];

// Mock Data for Hotel Locations
export const mockHotelLocations: HotelLocation[] = [
  {
    id: "1",
    name: "Guest Rooms (Building A)",
    type: "room",
    zone: "building-a",
    floor: 1,
    building: "Main Building",
    description: "Standard guest rooms in main building",
    deliveryTime: 15,
    deliveryFee: 0,
    isActive: true,
    operatingHours: {
      open: "06:00",
      close: "23:00"
    }
  },
  {
    id: "2",
    name: "Pool Area Restaurant",
    type: "pool",
    zone: "pool-area",
    description: "Poolside dining area with outdoor seating",
    deliveryTime: 10,
    deliveryFee: 100,
    isActive: true,
    operatingHours: {
      open: "07:00",
      close: "22:00"
    },
    specialInstructions: "Use pool entrance, staff will meet at reception desk"
  },
  {
    id: "3",
    name: "Spa Relaxation Area",
    type: "spa",
    zone: "spa-area",
    description: "Quiet dining area within spa facilities",
    deliveryTime: 12,
    deliveryFee: 150,
    isActive: true,
    operatingHours: {
      open: "08:00",
      close: "20:00"
    },
    specialInstructions: "Quiet delivery required, use spa entrance"
  },
  {
    id: "4",
    name: "Main Restaurant",
    type: "restaurant",
    zone: "building-a",
    floor: 1,
    description: "Main hotel restaurant and dining hall",
    deliveryTime: 5,
    deliveryFee: 0,
    isActive: true,
    operatingHours: {
      open: "06:00",
      close: "23:00"
    }
  },
  {
    id: "5",
    name: "Rooftop Lounge",
    type: "rooftop",
    zone: "building-a",
    floor: 5,
    description: "Rooftop terrace with city views",
    deliveryTime: 20,
    deliveryFee: 200,
    isActive: true,
    operatingHours: {
      open: "16:00",
      close: "01:00"
    },
    specialInstructions: "Use elevator to 5th floor, rooftop access"
  },
  {
    id: "6",
    name: "Conference Center",
    type: "conference",
    zone: "conference-center",
    floor: 2,
    description: "Meeting rooms and conference facilities",
    deliveryTime: 15,
    deliveryFee: 100,
    isActive: true,
    operatingHours: {
      open: "07:00",
      close: "22:00"
    },
    specialInstructions: "Contact event coordinator before delivery"
  }
];

export const mockDeliveryStaff: DeliveryStaff[] = [
  {
    id: "1",
    name: "James Mwangi",
    phone: "+254701234567",
    assignedZones: ["building-a", "pool-area"],
    currentLocation: "Kitchen - Building A",
    isAvailable: true,
    activeOrders: [],
    maxCapacity: 4
  },
  {
    id: "2",
    name: "Sarah Kimani",
    phone: "+254701234568",
    assignedZones: ["spa-area", "outdoor-areas"],
    currentLocation: "Spa Reception",
    isAvailable: true,
    activeOrders: ["1"],
    maxCapacity: 3
  },
  {
    id: "3",
    name: "David Ochieng",
    phone: "+254701234569",
    assignedZones: ["building-a", "conference-center"],
    currentLocation: "Building A - Floor 2",
    isAvailable: false,
    activeOrders: ["2", "3"],
    maxCapacity: 5
  }
];

export const mockFoodOrders: FoodOrder[] = [
  {
    id: "1",
    guestId: "1",
    roomId: "2",
    deliveryLocation: {
      id: "1",
      name: "Guest Rooms (Building A)",
      type: "room" as LocationType,
      zone: "building-a" as DeliveryZone,
      floor: 1,
      building: "Main Building",
      description: "Standard guest rooms in main building",
      deliveryTime: 15,
      deliveryFee: 0,
      isActive: true,
      operatingHours: {
        open: "06:00",
        close: "23:00"
      }
    },
    items: [
      {
        menuItemId: "2",
        quantity: 1,
        price: 2500,
        specialInstructions: "Medium well done"
      },
      {
        menuItemId: "4",
        quantity: 2,
        price: 300
      }
    ],
    totalAmount: 3100,
    orderType: "room-service",
    status: "preparing",
    orderTime: "2024-01-17T18:30:00Z",
    requestedDeliveryTime: "2024-01-17T19:00:00Z",
    estimatedReadyTime: "2024-01-17T19:10:00Z",
    paymentStatus: "paid",
    paymentMethod: "card",
    assignedKitchenStaff: "Chef Johnson",
    assignedDeliveryStaff: "James Mwangi",
    deliveryInstructions: "Room 102, knock gently",
    createdAt: "2024-01-17T18:30:00Z",
    updatedAt: "2024-01-17T18:45:00Z"
  },
  {
    id: "2",
    guestId: "2", 
    deliveryLocation: {
      id: "2",
      name: "Pool Area Restaurant",
      type: "pool" as LocationType,
      zone: "pool-area" as DeliveryZone,
      description: "Poolside dining area with outdoor seating",
      deliveryTime: 10,
      deliveryFee: 100,
      isActive: true,
      operatingHours: {
        open: "07:00",
        close: "22:00"
      },
      specialInstructions: "Use pool entrance, staff will meet at reception desk"
    },
    items: [
      {
        menuItemId: "1",
        quantity: 2,
        price: 1200
      },
      {
        menuItemId: "4",
        quantity: 3,
        price: 300
      }
    ],
    totalAmount: 3500, // includes 100 delivery fee
    orderType: "poolside",
    status: "ready",
    orderTime: "2024-01-17T14:20:00Z",
    requestedDeliveryTime: "2024-01-17T15:00:00Z",
    estimatedReadyTime: "2024-01-17T14:45:00Z",
    paymentStatus: "paid",
    paymentMethod: "card",
    assignedKitchenStaff: "Chef Maria",
    assignedDeliveryStaff: "James Mwangi",
    deliveryInstructions: "Pool deck area, near the bar",
    createdAt: "2024-01-17T14:20:00Z",
    updatedAt: "2024-01-17T14:40:00Z"
  }
];

// Mock Data for Swimming Activities
export const mockPoolFacilities: PoolFacility[] = [
  {
    id: "1",
    name: "Main Swimming Pool",
    type: "main-pool",
    capacity: 50,
    currentOccupancy: 12,
    status: "open",
    depth: {
      min: 1.2,
      max: 3.0
    },
    temperature: 28,
    amenities: ["Pool bar", "Loungers", "Umbrellas", "Towel service"],
    operatingHours: {
      open: "06:00",
      close: "22:00"
    }
  },
  {
    id: "2",
    name: "Kids Pool",
    type: "kids-pool",
    capacity: 15,
    currentOccupancy: 5,
    status: "open",
    depth: {
      min: 0.5,
      max: 1.0
    },
    temperature: 30,
    amenities: ["Water slides", "Toys", "Shade area"],
    operatingHours: {
      open: "08:00",
      close: "20:00"
    }
  },
  {
    id: "3",
    name: "Spa Hot Tub",
    type: "hot-tub",
    capacity: 8,
    currentOccupancy: 2,
    status: "open",
    depth: {
      min: 1.0,
      max: 1.0
    },
    temperature: 38,
    amenities: ["Massage jets", "Aromatherapy", "Privacy screens"],
    operatingHours: {
      open: "07:00",
      close: "23:00"
    }
  }
];

export const mockSwimmingActivities: SwimmingActivity[] = [
  {
    id: "1",
    name: "Morning Water Aerobics",
    type: "water-aerobics",
    description: "Low-impact exercise class perfect for all fitness levels",
    poolId: "1",
    instructor: "Sarah Fitness",
    capacity: 20,
    currentParticipants: 8,
    skillLevel: "all-levels",
    duration: 45,
    price: 500,
    equipment: ["Pool noodles", "Water weights"],
    isRecurring: true,
    schedule: [
      {
        dayOfWeek: ["Monday", "Wednesday", "Friday"],
        startTime: "07:00",
        endTime: "07:45"
      }
    ],
    nextSession: "2024-01-19T07:00:00Z",
    isActive: true
  },
  {
    id: "2",
    name: "Kids Swimming Lessons",
    type: "swimming-lesson",
    description: "Fun and safe swimming lessons for children",
    poolId: "2",
    instructor: "Michael Swim Coach",
    capacity: 8,
    currentParticipants: 6,
    ageRequirement: {
      min: 4,
      max: 12
    },
    skillLevel: "beginner",
    duration: 30,
    price: 800,
    equipment: ["Kickboards", "Floaties", "Goggles"],
    isRecurring: true,
    schedule: [
      {
        dayOfWeek: ["Saturday", "Sunday"],
        startTime: "10:00",
        endTime: "10:30"
      }
    ],
    nextSession: "2024-01-20T10:00:00Z",
    isActive: true
  },
  {
    id: "3",
    name: "Evening Pool Party",
    type: "pool-party",
    description: "Fun pool party with music, games, and refreshments",
    poolId: "1",
    capacity: 30,
    currentParticipants: 15,
    skillLevel: "all-levels",
    duration: 120,
    price: 1000,
    equipment: ["Pool games", "Music system", "Lights"],
    isRecurring: false,
    schedule: [
      {
        dayOfWeek: ["Saturday"],
        startTime: "19:00",
        endTime: "21:00"
      }
    ],
    nextSession: "2024-01-20T19:00:00Z",
    isActive: true
  }
];

export const mockPoolReservations: PoolReservation[] = [
  {
    id: "1",
    guestId: "1",
    poolId: "1",
    activityId: "1",
    reservationType: "activity",
    date: "2024-01-19",
    timeSlot: {
      start: "07:00",
      end: "07:45"
    },
    participants: 1,
    status: "confirmed",
    totalAmount: 500,
    paymentStatus: "paid",
    paymentMethod: "card",
    createdAt: "2024-01-17T14:00:00Z",
    updatedAt: "2024-01-17T14:00:00Z"
  },
  {
    id: "2",
    guestId: "2",
    poolId: "2",
    reservationType: "pool-access",
    date: "2024-01-18",
    timeSlot: {
      start: "15:00",
      end: "17:00"
    },
    participants: 2,
    status: "confirmed",
    equipmentRequests: [
      {
        equipmentType: "goggles",
        quantity: 2
      }
    ],
    totalAmount: 0, // Pool access is free for guests
    paymentStatus: "paid",
    createdAt: "2024-01-17T12:00:00Z",
    updatedAt: "2024-01-17T12:00:00Z"
  }
];

export const mockPoolEquipment: PoolEquipment[] = [
  {
    id: "1",
    name: "Swimming Goggles",
    type: "goggles",
    totalQuantity: 20,
    availableQuantity: 18,
    dailyRate: 50,
    condition: "excellent",
    lastMaintenance: "2024-01-15",
    nextMaintenance: "2024-02-15",
    isAvailable: true
  },
  {
    id: "2",
    name: "Pool Floaties",
    type: "floaties",
    totalQuantity: 15,
    availableQuantity: 12,
    dailyRate: 100,
    condition: "good",
    lastMaintenance: "2024-01-10",
    nextMaintenance: "2024-02-10",
    isAvailable: true
  },
  {
    id: "3",
    name: "Kickboards",
    type: "kickboard",
    totalQuantity: 25,
    availableQuantity: 20,
    dailyRate: 30,
    condition: "excellent",
    lastMaintenance: "2024-01-12",
    nextMaintenance: "2024-02-12",
    isAvailable: true
  },
  {
    id: "4",
    name: "Pool Noodles",
    type: "pool-noodles",
    totalQuantity: 30,
    availableQuantity: 25,
    dailyRate: 20,
    condition: "good",
    lastMaintenance: "2024-01-08",
    nextMaintenance: "2024-02-08",
    isAvailable: true
  }
];
