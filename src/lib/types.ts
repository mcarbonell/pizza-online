
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

export interface ShippingAddressDetails {
  name: string; 
  email: string; 
  address: string;
  city: string;
  postalCode: string;
  phone?: string;
}

// This interface is updated to reflect what might be stored after a Stripe payment
// The actual card details are NOT stored by us.
export interface PaymentDetails {
  stripePaymentIntentId: string | null; // Store the Stripe Payment Intent ID
  // last4Digits?: string; // Could be retrieved from Stripe if needed
  // cardBrand?: string; // Could be retrieved from Stripe if needed
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
  // defaultPaymentMethod is removed, Stripe handles saved payment methods.
  createdAt: any; 
  updatedAt: any; 
}

export interface Order {
  id?: string; 
  userId: string;
  items: CartItem[];
  totalAmount: number;
  shippingAddress: ShippingAddressDetails; 
  paymentDetails: PaymentDetails; // Updated to use the new PaymentDetails
  createdAt: any; 
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | 'PaymentFailed'; // Added PaymentFailed
}

// Schema for the edit profile form - payment fields removed
export interface UpdateUserProfileFormValues {
  displayName: string;
  shippingName: string;
  shippingEmail: string;
  shippingAddress: string;
  shippingCity: string;
  shippingPostalCode: string;
  shippingPhone?: string;
  // paymentLast4Digits and paymentExpiryDate are removed
}
