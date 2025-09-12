/**
 * Telar eCommerce API Type Definitions
 * Version: 1.0.0
 *
 * Shared TypeScript definitions for frontend and backend applications.
 * Import these types to ensure type safety across your application.
 *
 * Usage:
 * import { User, Product, ApiResponse } from './types/api-types';
 */

// =============================================================================
// GLOBAL TYPES
// =============================================================================

export interface ApiResponse<T = any> {
  status: true;
  data: T;
  message?: string;
}

export interface ApiError {
  status: false;
  message: string;
  code?: string;
  errors?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNext: boolean; // True if there are more pages
  hasPrevious: boolean; // True if there are previous pages
  next?: string; // URL for next page (for infinite scroll)
  previous?: string; // URL for previous page
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationInfo;
}

// =============================================================================
// JWT AUTHENTICATION TYPES
// =============================================================================

export interface JwtPayload {
  userId: number;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

export interface AuthenticatedRequest {
  user: User;
  token: string;
}

// =============================================================================
// ENUMS
// =============================================================================

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

export enum PaymentMethodType {
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  PAYPAL = 'PAYPAL',
  STRIPE = 'STRIPE'
}

export enum AddressType {
  SHIPPING = 'SHIPPING',
  BILLING = 'BILLING'
}

// =============================================================================
// USER MANAGEMENT
// =============================================================================

export interface User {
  id: number;
  email: string;
  fullName: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile extends User {
  orderCount: number;
  totalSpent: number;
  lastLoginAt: string | null;
}

export interface RegisterRequest {
  email: string;
  fullName?: string;
  password: string;
  confirmPassword: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  expiresIn: number;
  refreshToken: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// =============================================================================
// CATEGORY MANAGEMENT
// =============================================================================

export interface Category {
  id: number;
  name: string;
  description: string | null;
  slug: string;
  isActive: boolean;
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryRequest {
  name: string;
  description?: string;
  slug?: string;
  isActive?: boolean;
}

export interface CategoryWithProducts extends Category {
  products: ProductSummary[];
}

// =============================================================================
// PRODUCT MANAGEMENT
// =============================================================================

export interface ProductCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  sku: string;
  stock: number;
  isActive: boolean;
  images: string[];
  categoryId: number;
  category: ProductCategory;
  createdAt: string;
  updatedAt: string;
}

export interface ProductSummary {
  id: number;
  name: string;
  price: number;
  sku: string;
  stock: number;
  images: string[];
  category: ProductCategory;
}

export interface ProductDetail extends Product {
  relatedProducts: ProductSummary[];
  averageRating: number;
  reviewCount: number;
}

export interface ProductRequest {
  name: string;
  description?: string;
  price: number;
  sku: string;
  stock?: number;
  categoryId: number;
  images?: string[];
  isActive?: boolean;
}

export interface ProductFilters {
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  search?: string;
  sortBy?: 'name' | 'price' | 'createdAt' | 'stock';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// =============================================================================
// CART MANAGEMENT
// =============================================================================

export interface CartItem {
  id: number;
  productId: number;
  product: ProductSummary;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Cart {
  id: string;
  userId?: number;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  itemCount: number;
  updatedAt: string;
}

export interface AddToCartRequest {
  productId: number;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

// =============================================================================
// ADDRESS MANAGEMENT
// =============================================================================

export interface Address {
  id: number;
  userId: number;
  type: AddressType;
  firstName: string;
  lastName: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phoneNumber?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AddressRequest {
  type: AddressType;
  firstName: string;
  lastName: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phoneNumber?: string;
  isDefault?: boolean;
}

// =============================================================================
// PAYMENT MANAGEMENT
// =============================================================================

export interface PaymentMethod {
  id: string;
  type: PaymentMethodType;
  provider: string;
  last4?: string;
  expiryMonth?: number;
  expiryYear?: number;
  cardBrand?: string;
  isDefault: boolean;
}

export interface Payment {
  id: string;
  orderId: number;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  transactionId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentMethodRequest {
  type: PaymentMethodType;
  token: string;
  isDefault?: boolean;
}

export interface PaymentIntent {
  clientSecret: string;
  amount: number;
  currency: string;
}

// =============================================================================
// ORDER MANAGEMENT
// =============================================================================

export interface OrderItem {
  id: number;
  productId: number;
  product: ProductSummary;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: number;
  orderNo: string;
  userId: number;
  status: OrderStatus;
  total: number;
  items: OrderItem[];
  shippingAddress: Address;
  billingAddress: Address;
  paymentMethod: PaymentMethod;
  createdAt: string;
  updatedAt: string;
}

export interface OrderSummary {
  id: number;
  orderNo: string;
  status: OrderStatus;
  total: number;
  itemCount: number;
  createdAt: string;
}

export interface CheckoutRequest {
  items: {
    productId: number;
    quantity: number;
  }[];
  shippingAddress: AddressRequest;
  billingAddress?: AddressRequest;
  paymentMethod: PaymentMethodRequest;
}

// =============================================================================
// SEARCH & FILTERING
// =============================================================================

export interface SearchFilters {
  categories?: number[];
  priceRange?: {
    min: number;
    max: number;
  };
  inStock?: boolean;
  rating?: number;
}

export interface SearchSort {
  field: 'relevance' | 'price' | 'rating' | 'newest';
  order: 'asc' | 'desc';
}

export interface SearchRequest {
  query: string;
  filters?: SearchFilters;
  sort?: SearchSort;
  pagination?: {
    page: number;
    limit: number;
  };
}

export interface SearchResponse {
  query: string;
  results: ProductSummary[];
  pagination: PaginationInfo;
  filters: {
    categories: { id: number; name: string; count: number }[];
    priceRange: { min: number; max: number };
    avgRating: number;
  };
  suggestions?: string[];
}

// =============================================================================
// ADMIN DASHBOARD
// =============================================================================

export interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  recentOrders: OrderSummary[];
  topProducts: ProductSummary[];
  salesChart: {
    period: string;
    revenue: number;
    orders: number;
  }[];
}

// =============================================================================
// HEALTH & MONITORING
// =============================================================================

export interface HealthStatus {
  status: 'ok' | 'error';
  timestamp: string;
  version: string;
  database: {
    status: 'connected' | 'disconnected';
    responseTime?: number;
  };
  redis?: {
    status: 'connected' | 'disconnected';
    responseTime?: number;
  };
  services: {
    payments: 'up' | 'down';
    email: 'up' | 'down';
    storage: 'up' | 'down';
  };
}

// =============================================================================
// ERROR HANDLING
// =============================================================================

export enum ErrorCodes {
  // Authentication
  INVALID_CREDENTIALS = 'AUTH_001',
  TOKEN_EXPIRED = 'AUTH_002',
  UNAUTHORIZED = 'AUTH_003',
  FORBIDDEN = 'AUTH_004',

  // Validation
  VALIDATION_ERROR = 'VAL_001',
  REQUIRED_FIELD = 'VAL_002',
  INVALID_FORMAT = 'VAL_003',

  // Business Logic
  PRODUCT_OUT_OF_STOCK = 'BIZ_001',
  INSUFFICIENT_FUNDS = 'BIZ_002',
  ORDER_CANNOT_CANCEL = 'BIZ_003',

  // System
  INTERNAL_ERROR = 'SYS_001',
  SERVICE_UNAVAILABLE = 'SYS_002',
  RATE_LIMIT_EXCEEDED = 'SYS_003'
}

export interface RateLimit {
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
}

// =============================================================================
// API RESPONSE TYPES
// =============================================================================

export type UserResponse = ApiResponse<{ user: User }>;
export type UsersResponse = ApiResponse<PaginatedResponse<User>>;
export type CategoriesResponse = ApiResponse<{ categories: Category[] }>;
export type ProductsResponse = ApiResponse<PaginatedResponse<ProductSummary>>;
export type ProductResponse = ApiResponse<{ product: Product }>;
export type CartResponse = ApiResponse<{ cart: Cart }>;
export type OrdersResponse = ApiResponse<PaginatedResponse<OrderSummary>>;
export type OrderResponse = ApiResponse<{ order: Order }>;
export type AddressesResponse = ApiResponse<{ addresses: Address[] }>;
export type PaymentMethodsResponse = ApiResponse<{ paymentMethods: PaymentMethod[] }>;
export type DashboardResponse = ApiResponse<DashboardStats>;
export type HealthResponse = ApiResponse<HealthStatus>;

// =============================================================================
// UTILITY TYPES
// =============================================================================

export type CreateRequest<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateRequest<T> = Partial<CreateRequest<T>>;
export type EntityId = number | string;

// HTTP Method types for API calls
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// Generic API call configuration
export interface ApiCallConfig {
  method: HttpMethod;
  url: string;
  data?: any;
  params?: Record<string, any>;
  headers?: Record<string, string>;
}
