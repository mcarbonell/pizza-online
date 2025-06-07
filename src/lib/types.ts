
export interface Product {
  id: string; // Firestore document ID
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: 'Pizzas' | 'Sides' | 'Drinks' | 'Desserts' | 'Hamburguesas' | 'Sandwiches' | 'Kebabs' | 'Raciones';
  dataAiHint: string;
}

// Type for the initial product data, an ID is not needed here as Firestore will generate it.
export type ProductSeedData = Omit<Product, 'id'>;


export interface CartItem extends Product {
  quantity: number;
}

// Simplified cart item structure for Stripe metadata
export interface SimplifiedCartItem {
  id: string; // Product ID
  quantity: number;
}

export interface ShippingAddressDetails {
  name: string; 
  email: string; 
  address: string;
  city: string;
  postalCode: string;
  phone?: string;
}

export interface PaymentDetails {
  stripePaymentIntentId: string | null; 
}


export interface User {
  uid: string;        
  email: string | null; 
  displayName?: string | null; 
  providerData?: Array<{ providerId: string }>;
  emailVerified?: boolean;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName?: string | null;
  emailVerified?: boolean;
  role?: 'admin' | 'user'; 
  defaultShippingAddress?: ShippingAddressDetails | null; 
  createdAt: any; 
  updatedAt: any; 
}

export interface Order {
  id?: string; 
  userId: string;
  items: CartItem[]; // Items will be fully detailed Product objects + quantity
  totalAmount: number;
  shippingAddress: ShippingAddressDetails; 
  paymentDetails: PaymentDetails; 
  createdAt: any; 
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | 'PaymentFailed'; 
}

export interface UpdateUserProfileFormValues {
  displayName: string;
  shippingName: string;
  shippingEmail: string;
  shippingAddress: string;
  shippingCity: string;
  shippingPostalCode: string;
  shippingPhone?: string;
}
