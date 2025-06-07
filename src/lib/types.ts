
export type ProductCategory = 'Pizzas' | 'Sides' | 'Drinks' | 'Desserts';

export interface Product {
  id: string; 
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: ProductCategory;
  dataAiHint: string;
}

export type ProductSeedData = Omit<Product, 'id'>;


export interface CartItem extends Product {
  quantity: number;
}

export interface SimplifiedCartItem {
  id: string; 
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

export type OrderStatus = 'Pending' | 'Processing' | 'Out for Delivery' | 'Shipped' | 'Delivered' | 'Cancelled' | 'PaymentFailed';

export interface Order {
  id?: string; 
  userId: string;
  items: CartItem[]; 
  totalAmount: number;
  shippingAddress: ShippingAddressDetails; 
  paymentDetails: PaymentDetails; 
  createdAt: any; 
  updatedAt?: any; 
  status: OrderStatus; 
  deliveryLocation?: {
    latitude: number;
    longitude: number;
    timestamp: any; // Firestore serverTimestamp
  } | null;
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

// This type was used for defaultPaymentMethod in UserProfile which is currently not actively used.
// If defaultPaymentMethod is re-introduced, this type can be used.
// export interface SimulatedPaymentMethod {
//   last4Digits: string;
//   expiryDate: string; // e.g., "MM/YY"
// }
