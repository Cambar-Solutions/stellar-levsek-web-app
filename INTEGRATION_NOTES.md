# Frontend Integration with Backend API

## Configuration

### 1. Environment Variables

The API base URL is configured in `.env`:

```env
VITE_API_URL=http://localhost:4008
```

For production, update this to your production backend URL.

### 2. API Services

The frontend now uses real API calls instead of localStorage:

- **`src/constants/api.js`** - API endpoints configuration
- **`src/services/api.js`** - Base HTTP client with authentication
- **`src/services/authService.js`** - Authentication API calls
- **`src/services/debtService.js`** - Debt and customer management API calls

### 3. Updated Contexts

- **`AuthContext.jsx`** - Now uses backend `/auth/login` and `/auth/validate` endpoints
- **`DebtContext.jsx`** - Integrated with backend `/debts` and `/customers` endpoints

## Data Mapping

### Frontend ↔ Backend

**Frontend "Debtor" concept** maps to:
- Backend `Customer` + `Debt` entities combined

**Example mapping:**
```javascript
Frontend Debtor:
{
  id: customer.id,
  name: "${customer.name} ${customer.last_name}",
  email: customer.email,
  totalDebt: sum(debt.pending_amount),
  payments: [debt.paid_amount as payment],
  walletAddress: customer.stellar_public_key
}
```

## Key Features

### Authentication
- Login validates against backend `/auth/login`
- Token stored in `localStorage` as `auth_token`
- Automatic session validation on app load
- Auto-redirect to login on 401 responses

### Debt Management
- Create debtor → Creates `Customer` + `Debt` in backend
- Add payment → Calls `/debts/:id/pay`
- Payment automatically registers on Stellar blockchain via backend
- Real-time `stellar_tx_hash` from blockchain transactions

### Blockchain Integration
- All payments automatically registered on Stellar testnet
- Transaction hashes displayed in payment history
- Blockchain verification through backend StellarService

## Running the Application

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

The app will run on `http://localhost:5173` (Vite default)

### 3. Backend Requirements
Make sure the backend is running:
```bash
cd ../service-stellar
npm run start:dev
```

Backend should be running on `http://localhost:4008`

## API Endpoints Used

### Auth
- `POST /auth/login` - User login
- `GET /auth/validate` - Validate session
- `POST /auth/logout` - Logout user

### Customers
- `GET /customers` - List all customers
- `POST /customers` - Create customer
- `PATCH /customers/:id` - Update customer
- `DELETE /customers/:id` - Delete customer

### Debts
- `GET /debts` - List all debts
- `POST /debts` - Create new debt (registers on blockchain)
- `PATCH /debts/:id/pay` - Register payment (blockchain transaction)
- `DELETE /debts/:id` - Delete debt

## Notes

- **Registration**: Currently uses localStorage fallback. Backend doesn't have public register endpoint yet.
- **User Context**: The `user.siteId` is used for filtering data. Make sure user object includes this field.
- **CORS**: Backend already configured with CORS for `localhost:5173`

## Troubleshooting

### CORS Issues
Make sure backend `src/main.ts` includes:
```typescript
app.enableCors({
  origin: ['http://localhost:5173'],
  credentials: true,
})
```

### Authentication Issues
- Clear localStorage: `localStorage.clear()`
- Check if backend is returning proper token format
- Verify token is being sent in Authorization header

### Data Not Loading
- Check browser console for API errors
- Verify backend is running on port 4008
- Check network tab for failed requests
