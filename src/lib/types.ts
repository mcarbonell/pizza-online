
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  dataAiHint: string;
}

export interface CartItem extends Product {
  quantity: number;
}

// Renamed from OrderDetails to ShippingAddressDetails for clarity
export interface ShippingAddressDetails {
  name: string; // Name on the shipping address, might be different from account name
  email: string; // Email for shipping confirmation, might be different
  address: string;
  city: string;
  postalCode: string;
  phone?: string;
}

export interface PaymentDetails {
  cardNumber: string; // Keep as string for formatting
  expiryDate: string; // MM/YY
  cvv: string;
}

// User type for Firebase Auth data
export interface User {
  uid: string;         // Firebase User ID
  email: string | null; // Firebase User email
  displayName?: string | null; // Firebase User display name
}

// New UserProfile type for Firestore "users" collection
export interface UserProfile {
  uid: string;
  email: string | null;
  displayName?: string | null;
  defaultShippingAddress?: ShippingAddressDetails | null; 
  createdAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp
}


// Order interface
export interface Order {
  id?: string; // Firestore document ID
  userId: string;
  items: CartItem[];
  totalAmount: number;
  shippingAddress: ShippingAddressDetails; // Uses the renamed type
  paymentDetails: PaymentDetails; // Still simulated
  createdAt: any; // Firestore Timestamp
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
}

