
export type ProductCategory = 'Pizzas' | 'Sides' | 'Drinks' | 'Desserts';

export interface ExtraItem {
  name: string;
  price: number;
}

export interface Product {
  id: string; 
  name: string;
  description: string;
  price: number; // Base price of the product
  imageUrl: string;
  category: ProductCategory;
  dataAiHint: string;
}

export type ProductSeedData = Omit<Product, 'id'>;


export interface CartItem extends Product {
  quantity: number;
  selectedExtras?: ExtraItem[]; // Extras selected for this specific cart item
  // The 'price' property from Product remains the base price.
  // Total price for this cart item instance = (base_price + sum of extras_prices) * quantity
  // We add a uniqueId to distinguish between same products with different extras
  cartItemId: string; 
}

export interface SimplifiedCartItem {
  id: string; // Product ID
  quantity: number;
  selectedExtras?: ExtraItem[];
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

export type OrderStatus = 'Pending' | 'Processing' | 'Out for Delivery' | 'Delivered' | 'Cancelled' | 'PaymentFailed';

export const translateOrderStatus = (status: OrderStatus): string => {
  switch (status) {
    case 'Pending': return 'Pendiente';
    case 'Processing': return 'Procesando';
    case 'Out for Delivery': return 'En Reparto';
    case 'Delivered': return 'Entregado';
    case 'Cancelled': return 'Cancelado';
    case 'PaymentFailed': return 'Pago Fallido';
    default: return status;
  }
};

// Items in an order will reflect the state they were in when added to cart, including extras
export interface OrderItem extends Omit<Product, 'id'> { // Product details at the time of order
  productId: string; // Original product ID
  quantity: number;
  selectedExtras?: ExtraItem[];
  // Price here should be the unit price *including extras* at the time of purchase
  // We'll calculate this when creating the order item for Stripe and Firestore
  unitPriceWithExtras: number; 
}


export interface Order {
  id?: string; 
  userId: string;
  items: OrderItem[]; // Use OrderItem here
  totalAmount: number; // This is the final total amount paid
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
