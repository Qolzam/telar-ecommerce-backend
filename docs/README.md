# 📖 API Documentation

This directory contains comprehensive API documentation and type definitions for the Telar eCommerce platform.

## 📁 Documentation Structure

```
docs/
├── API_SCHEMA.md          # Complete API schema documentation
└── README.md              # This file

types/
└── api-types.ts           # TypeScript type definitions
```

## 🚀 Quick Start

### For Frontend Developers

1. **Import Type Definitions**

   ```typescript
   import { Product, User, ApiResponse } from '../types/api-types';

   // Use types for API responses
   const fetchProducts = async (): Promise<ApiResponse<ProductsResponse>> => {
     const response = await fetch('/api/products');
     return response.json();
   };
   ```

2. **API Base URL**

   ```typescript
   const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
   ```

3. **Authentication Headers**
   ```typescript
   const headers = {
     'Content-Type': 'application/json',
     Authorization: `Bearer ${token}`,
     'X-API-Version': '1.0'
   };
   ```

### For Backend Developers

1. **Response Format**

   ```javascript
   // Success response
   res.status(200).json({
     status: true,
     data: { products, pagination }
   });

   // Error response
   res.status(400).json({
     status: false,
     message: 'Validation failed',
     errors: validationErrors
   });
   ```

2. **Using Types in Controllers**

   ```typescript
   import { ProductRequest, ProductResponse } from '../types/api-types';

   const createProduct = async (
     req: Request<{}, ProductResponse, ProductRequest>,
     res: Response
   ) => {
     // Controller logic
   };
   ```

## 📋 API Schema Overview

### Core Entities

- **Users** - Authentication, profiles, roles
- **Categories** - Product categorization
- **Products** - Main catalog items
- **Cart** - Shopping cart management
- **Orders** - Order processing and tracking
- **Addresses** - Shipping and billing addresses
- **Payments** - Payment methods and transactions

### Response Format

All API responses follow a consistent structure:

```typescript
{
  status: boolean;        // true for success, false for error
  data?: any;            // Response data (success only)
  message?: string;      // Success/error message
  errors?: ValidationError[]; // Validation errors (error only)
}
```

### Authentication

- **Bearer Token** authentication
- **Role-based** access control (USER, ADMIN)
- **JWT** tokens with refresh mechanism

### Pagination

```typescript
{
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}
```

## 🔧 Development Guidelines

### API Versioning

- Current version: `v1.0`
- Include `X-API-Version` header in requests
- Maintain backward compatibility

### Error Handling

- Use standard HTTP status codes
- Include error codes for programmatic handling
- Provide clear error messages

### Rate Limiting

- 1000 requests per hour for authenticated users
- 100 requests per hour for unauthenticated users
- Headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`

### Data Validation

- Use the provided TypeScript types
- Validate all input data
- Return descriptive validation errors

## 🛠️ Tools & Integration

### Frontend Integration

```bash
# Install type definitions (if published as package)
npm install @telar/api-types

# Or copy the types file to your project
cp types/api-types.ts src/types/
```

### API Client Example

```typescript
class ApiClient {
  private baseURL = 'http://localhost:8080/api';
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'X-API-Version': '1.0',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options.headers
    };

    const response = await fetch(url, { ...options, headers });
    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(data);
    }

    return data;
  }

  // Product methods
  async getProducts(filters?: ProductFilters): Promise<ProductsResponse> {
    const params = new URLSearchParams(filters as any);
    return this.request(`/products?${params}`);
  }

  async getProduct(id: number): Promise<ProductResponse> {
    return this.request(`/products/${id}`);
  }
}
```

### Backend Validation Example

```javascript
import { body, validationResult } from 'express-validator';

export const validateProduct = [
  body('name').notEmpty().withMessage('Product name is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('categoryId').isInt().withMessage('Category ID must be an integer'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];
```

## 📝 Contributing

When updating the API:

1. **Update Types** - Modify `types/api-types.ts`
2. **Update Documentation** - Update `docs/API_SCHEMA.md`
3. **Version Control** - Follow semantic versioning
4. **Breaking Changes** - Increment major version and provide migration guide

## 🔗 Related Documentation

- [Project Roadmap](../ROADMAP.md)
- [Database Schema](../prisma/schema.prisma)
- [Environment Setup](../README.md)

## 📞 Support

For API questions or issues:

- Create an issue in the repository
- Check existing documentation
- Review the TypeScript types for detailed interface definitions
