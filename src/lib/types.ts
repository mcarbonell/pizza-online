
export type ProductCategory = 'Pizzas' | 'Sides' | 'Drinks' | 'Desserts';

export type AllergenCode =
  | 'gluten'
  | 'crustaceos'
  | 'huevos'
  | 'pescado'
  | 'cacahuetes'
  | 'soja'
  | 'lacteos'
  | 'frutos_sec_cascara'
  | 'apio'
  | 'mostaza'
  | 'sesamo'
  | 'sulfitos'
  | 'altramuces'
  | 'moluscos';

export interface AllergenDisplayInfo {
  code: AllergenCode;
  name: string;
  iconName: string; // Placeholder for icon representation (e.g., 'wheat-icon', 'fish-icon')
  description: string; // Optional: Full description of the allergen
}

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
  allergens?: AllergenCode[];
}

export type ProductSeedData = Omit<Product, 'id'>;


export interface CartItem extends Product {
  quantity: number;
  selectedExtras?: ExtraItem[]; 
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

export interface OrderItem extends Omit<Product, 'id'> { 
  productId: string; 
  quantity: number;
  selectedExtras?: ExtraItem[];
  unitPriceWithExtras: number; 
  // allergens are part of the base product details
}


export interface Order {
  id?: string; 
  userId: string;
  items: OrderItem[]; 
  totalAmount: number; 
  shippingAddress: ShippingAddressDetails; 
  paymentDetails: PaymentDetails; 
  createdAt: any; 
  updatedAt?: any; 
  status: OrderStatus; 
  deliveryLocation?: {
    latitude: number;
    longitude: number;
    timestamp: any; 
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
