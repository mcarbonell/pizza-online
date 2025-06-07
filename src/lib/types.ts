
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

export interface ShippingAddressDetails {
  name: string; 
  email: string; 
  address: string;
  city: string;
  postalCode: string;
  phone?: string;
}

// Simulated payment details for storage (non-sensitive parts)
export interface SimulatedPaymentMethod {
  last4Digits: string;
  expiryDate: string; // MM/YY
  // cardBrand?: string; // Optional: could add logic to determine brand
}

// Full payment details for form submission (still simulated)
export interface PaymentDetails {
  cardNumber: string; 
  expiryDate: string; 
  cvv: string;
}

export interface User {
  uid: string;        
  email: string | null; 
  displayName?: string | null; 
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName?: string | null;
  defaultShippingAddress?: ShippingAddressDetails | null; 
  defaultPaymentMethod?: SimulatedPaymentMethod | null; // Added
  createdAt: any; 
  updatedAt: any; 
}

export interface Order {
  id?: string; 
  userId: string;
  items: CartItem[];
  totalAmount: number;
  shippingAddress: ShippingAddressDetails; 
  paymentDetails: PaymentDetails; 
  createdAt: any; 
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
}
