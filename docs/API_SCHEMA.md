# 📋 Telar eCommerce API Schema Documentation

**Version:** 1.1.0  
**Last Updated:** December 2024

This document defines the complete data schema and API contracts for the Telar eCommerce platform.

---

## 🔧 Global Response Format

All API responses follow a consistent structure:

### Success Response

```typescript
interface ApiResponse<T> {
  status: true;
  data: T;
  message?: string;
}
```

### Error Response

```typescript
interface ApiError {
  status: false;
  message: string;
  code?: string;
  errors?: ValidationError[];
}

interface ValidationError {
  field: string;
  message: string;
}
```

### Pagination

```typescript
interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNext: boolean; // True if there are more pages
  hasPrevious: boolean; // True if there are previous pages
  next?: string; // URL for next page (for infinite scroll)
  previous?: string; // URL for previous page
}
```

### JWT Authentication

```typescript
interface JwtPayload {
  userId: number;
  email: string;
  role: 'USER' | 'ADMIN';
  iat: number;
  exp: number;
}

// Authentication Headers
interface AuthHeaders {
  Authorization: `Bearer ${string}`;
  'Content-Type': 'application/json';
  'X-API-Version': '1.0';
}

interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationInfo;
}
```

---

## 👤 User Management

### User Entity

```typescript
interface User {
  id: number;
  email: string;
  fullName: string | null;
  role: 'USER' | 'ADMIN';
  isActive: boolean;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  // Relations (optional, included when explicitly requested)
  orders?: Order[];
  carts?: Cart[];
}

interface UserProfile extends User {
  orderCount: number;
  totalSpent: number;
  lastLoginAt: string | null;
}
```

### Authentication DTOs

```typescript
// Register Request
interface RegisterRequest {
  email: string;
  fullName?: string;
  password: string;
  confirmPassword: string;
}

// Login Request
interface LoginRequest {
  email: string;
  password: string;
}

// Auth Response
interface AuthResponse {
  user: User;
  token: string;
  expiresIn: number; // seconds
  refreshToken: string;
}

// Token Refresh
interface RefreshTokenRequest {
  refreshToken: string;
}
```

### User API Endpoints

```http
POST   /auth/register          # Register new user
POST   /auth/login             # User login
POST   /auth/refresh           # Refresh access token
POST   /auth/logout            # User logout
GET    /auth/me                # Get current user profile
PUT    /auth/profile           # Update user profile
POST   /auth/forgot-password   # Request password reset
POST   /auth/reset-password    # Reset password with token
```

---

## 🏷️ Category Management

### Category Entity

```typescript
interface Category {
  id: number;
  name: string;
  description: string | null;
  slug: string;
  isActive: boolean;
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

interface CategoryWithProducts extends Category {
  products: ProductSummary[];
}
```

### Category DTOs

```typescript
// Create/Update Category
interface CategoryRequest {
  name: string;
  description?: string;
  slug?: string; // Auto-generated if not provided
  isActive?: boolean;
}

// Category List Response
interface CategoriesResponse {
  categories: Category[];
}
```

### Category API Endpoints

```http
GET    /categories             # List all active categories
GET    /categories/:id         # Get category by ID
POST   /categories             # Create category (Admin)
PUT    /categories/:id         # Update category (Admin)
DELETE /categories/:id         # Delete category (Admin)
GET    /categories/:id/products # Get products by category
```

---

## 🛍️ Product Management

### Product Entity

```typescript
interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  sku: string;
  stock: number;
  isActive: boolean;
  images: string[]; // Array of image URLs
  categoryId: number;
  category: {
    id: number;
    name: string;
    slug: string;
  };
  createdAt: string;
  updatedAt: string;
  // Relations (optional, included when explicitly requested)
  orderItems?: OrderItem[];
  cartItems?: CartItem[];
}

interface ProductSummary {
  id: number;
  name: string;
  price: number;
  sku: string;
  stock: number;
  images: string[];
  category: {
    id: number;
    name: string;
    slug: string;
  };
}

interface ProductDetail extends Product {
  relatedProducts: ProductSummary[];
  averageRating: number;
  reviewCount: number;
}
```

### Product DTOs

```typescript
// Create/Update Product
interface ProductRequest {
  name: string;
  description?: string;
  price: number;
  sku: string;
  stock?: number;
  categoryId: number;
  images?: string[];
  isActive?: boolean;
}

// Product List Response
interface ProductsResponse {
  products: ProductSummary[];
  pagination: PaginationInfo;
}

// Product Search/Filter
interface ProductFilters {
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
```

### Product API Endpoints

```http
GET    /products               # List products with filters
GET    /products/:id           # Get product details
POST   /products               # Create product (Admin)
PUT    /products/:id           # Update product (Admin)
DELETE /products/:id           # Delete product (Admin)
GET    /products/search        # Search products
GET    /products/featured      # Get featured products
POST   /products/:id/images    # Upload product images (Admin)
```

---

## 🛒 Cart & Checkout

### Cart Entity

```typescript
interface CartItem {
  id: number;
  cartId: string;
  productId: number;
  product: ProductSummary;
  quantity: number;
  unitPrice: number;
}

interface Cart {
  id: string; // CUID identifier
  userId?: number; // Null for guest carts
  sessionId?: string; // For guest carts
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  createdAt: string;
  updatedAt: string;
}
```

### Cart DTOs

```typescript
// Add to Cart
interface AddToCartRequest {
  productId: number;
  quantity: number;
}

// Update Cart Item
interface UpdateCartItemRequest {
  quantity: number;
}

// Cart Response
interface CartResponse {
  cart: Cart;
}

// Create Cart (for guest users)
interface CreateCartRequest {
  sessionId?: string;
}

// Merge Guest Cart with User Cart
interface MergeCartRequest {
  guestCartId: string;
  userId: number;
}
```

### Cart API Endpoints

```http
GET    /cart                   # Get current cart
POST   /cart                   # Create new cart (for guest users)
POST   /cart/items             # Add item to cart
PUT    /cart/items/:id         # Update cart item quantity
DELETE /cart/items/:id         # Remove item from cart
DELETE /cart                   # Clear cart
POST   /cart/merge             # Merge guest cart with user cart
GET    /cart/:id               # Get cart by ID (for guest carts)
```

---

## 📦 Order Management

### Order Entity

```typescript
interface Order {
  id: number;
  orderNo: string;
  userId: number;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  total: number;
  transactionId: string | null; // Payment transaction ID
  paymentTimestamp: string | null; // When payment was completed
  notes: string | null; // Order notes/comments
  items: OrderItem[];
  shippingAddress: Address;
  billingAddress: Address;
  paymentMethod: PaymentMethod;
  createdAt: string;
  updatedAt: string;
}

interface OrderItem {
  id: number;
  productId: number;
  product: ProductSummary;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface OrderSummary {
  id: number;
  orderNo: string;
  status: Order['status'];
  total: number;
  itemCount: number;
  createdAt: string;
}
```

### Order DTOs

```typescript
// Create Order (Checkout)
interface CheckoutRequest {
  items: {
    productId: number;
    quantity: number;
  }[];
  shippingAddress: AddressRequest;
  billingAddress?: AddressRequest; // Optional, defaults to shipping
  paymentMethod: PaymentMethodRequest;
}

// Order Response
interface OrderResponse {
  order: Order;
}

// Order List Response
interface OrdersResponse {
  orders: OrderSummary[];
  pagination: PaginationInfo;
}

// Update Order Status (Admin)
interface UpdateOrderStatusRequest {
  status: Order['status'];
  notes?: string;
  transactionId?: string;
  paymentTimestamp?: string;
}

// Confirm Order by Order Number
interface ConfirmOrderRequest {
  transactionId: string;
  paymentTimestamp?: string;
  notes?: string;
}
```

### Order API Endpoints

```http
GET    /orders                 # List user orders
GET    /orders/:id             # Get order details
POST   /orders                 # Create order (checkout)
PUT    /orders/:id/status      # Update order status (Admin)
POST   /orders/:id/cancel      # Cancel order
POST   /orders/confirm/:orderNo # Confirm order by order number
GET    /admin/orders           # List all orders (Admin)
GET    /admin/orders/:id       # Get order details (Admin)
```

---

## 📍 Address Management

### Address Entity

```typescript
interface Address {
  id: number;
  userId: number;
  type: 'SHIPPING' | 'BILLING';
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
```

### Address DTOs

```typescript
interface AddressRequest {
  type: 'SHIPPING' | 'BILLING';
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
```

### Address API Endpoints

```http
GET    /addresses              # List user addresses
GET    /addresses/:id          # Get address by ID
POST   /addresses              # Create address
PUT    /addresses/:id          # Update address
DELETE /addresses/:id          # Delete address
PUT    /addresses/:id/default  # Set as default address
```

---

## 💳 Payment Management

### Payment Entity

```typescript
interface PaymentMethod {
  id: string;
  type: 'CREDIT_CARD' | 'DEBIT_CARD' | 'PAYPAL' | 'STRIPE';
  provider: string;
  last4?: string;
  expiryMonth?: number;
  expiryYear?: number;
  cardBrand?: string;
  isDefault: boolean;
}

interface Payment {
  id: string;
  orderId: number;
  amount: number;
  currency: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  paymentMethod: PaymentMethod;
  transactionId: string;
  createdAt: string;
  updatedAt: string;
}
```

### Payment DTOs

```typescript
interface PaymentMethodRequest {
  type: PaymentMethod['type'];
  token: string; // Payment provider token
  isDefault?: boolean;
}

interface PaymentIntent {
  clientSecret: string;
  amount: number;
  currency: string;
}
```

### Payment API Endpoints

```http
GET    /payment-methods        # List user payment methods
POST   /payment-methods        # Add payment method
DELETE /payment-methods/:id    # Remove payment method
POST   /payments/intent        # Create payment intent
POST   /payments/confirm       # Confirm payment
GET    /payments/:id           # Get payment details
```

---

## 📊 Admin Dashboard

### Dashboard Statistics

```typescript
interface DashboardStats {
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
```

### Admin API Endpoints

```http
GET    /admin/dashboard        # Dashboard statistics
GET    /admin/users            # List all users
GET    /admin/users/:id        # Get user details
PUT    /admin/users/:id/status # Update user status
GET    /admin/analytics        # Detailed analytics
GET    /admin/reports          # Generate reports
```

---

## 🔍 Search & Filters

### Search DTOs

```typescript
interface SearchRequest {
  query: string;
  filters?: {
    categories?: number[];
    priceRange?: {
      min: number;
      max: number;
    };
    inStock?: boolean;
    rating?: number;
  };
  sort?: {
    field: 'relevance' | 'price' | 'rating' | 'newest';
    order: 'asc' | 'desc';
  };
  pagination?: {
    page: number;
    limit: number;
  };
}

interface SearchResponse {
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
```

---

## 📱 Health & Monitoring

### Health Check

```typescript
interface HealthStatus {
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
```

### Monitoring API Endpoints

```http
GET    /health                 # Application health check
GET    /health/detailed        # Detailed health status
GET    /metrics                # Application metrics
```

---

## 🚨 Error Codes

### Standard Error Codes

```typescript
enum ErrorCodes {
  // Authentication
  INVALID_CREDENTIALS = 'AUTH_001',
  TOKEN_EXPIRED = 'AUTH_002',
  UNAUTHORIZED = 'AUTH_003',

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
```

---

## 🔐 Security & Headers

### Required Headers

```http
Content-Type: application/json
Authorization: Bearer <token>
X-API-Version: 1.0
X-Request-ID: <unique-request-id>
```

### Rate Limiting

```typescript
interface RateLimit {
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp
  retryAfter?: number; // Seconds
}
```

---

## 📝 Change Log

### Version 1.1.0 - December 2024

- **Enhanced Order Management**: Added `transactionId`, `paymentTimestamp`, and `notes` fields to Order entity
- **Cart System**: Complete cart management with guest cart support
- **New Entities**: Added Cart and CartItem models with full CRUD operations
- **Enhanced Relations**: Updated User and Product models with cart relations
- **New DTOs**: Added CreateCartRequest, MergeCartRequest, UpdateOrderStatusRequest, ConfirmOrderRequest
- **Extended API Endpoints**: Added cart creation, order confirmation, and enhanced order management endpoints

### Version 1.0.0 - July 29, 2025

- Initial API schema documentation
- Complete CRUD operations for all entities
- Authentication and authorization flows
- Payment integration structure
- Admin dashboard specifications
