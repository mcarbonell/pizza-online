
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

export interface OrderDetails {
  name: string;
  email: string;
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

// Updated User type to align better with Firebase User
export interface User {
  uid: string;         // Firebase User ID
  email: string | null; // Firebase User email
  displayName?: string | null; // Firebase User display name
  // You can add other Firebase user properties if needed, e.g., photoURL
}

// New Order interface
export interface Order {
  id?: string; // Firestore document ID, will be auto-generated when creating, populated when fetching
  userId: string;
  items: CartItem[];
  totalAmount: number;
  shippingAddress: OrderDetails;
  paymentDetails: PaymentDetails; // Still simulated
  createdAt: any; // Firestore Timestamp (will be serverTimestamp() when creating, Timestamp when fetching)
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled'; // Example statuses
}
