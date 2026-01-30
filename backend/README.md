# Expense Tracker Backend

This is the backend API for the Expense Tracker application built with Node.js, Express, and MySQL.

## Database Setup

### Prerequisites

- MySQL Server installed and running
- Node.js installed

### Database Configuration

1. Make sure MySQL is running on your system
2. Update the database credentials in `.env` file if needed:
   ```
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=expense_tracker
   ```

### Initialize Database

Run the database setup script to create the database and tables:

```bash
npm run setup-db
```

This will:
- Create the `expense_tracker` database
- Create the following tables:
  - `users` - User accounts
  - `categories` - Expense/income categories
  - `transactions` - Financial transactions

### Database Schema

#### Users Table
- `id` (INT, Primary Key, Auto Increment)
- `username` (VARCHAR(50), Unique, Not Null)
- `email` (VARCHAR(100), Unique, Not Null)
- `password_hash` (VARCHAR(255), Not Null)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### Categories Table
- `id` (INT, Primary Key, Auto Increment)
- `name` (VARCHAR(100), Not Null)
- `description` (TEXT)
- `user_id` (INT, Foreign Key to users.id)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### Transactions Table
- `id` (INT, Primary Key, Auto Increment)
- `amount` (DECIMAL(10,2), Not Null)
- `description` (VARCHAR(255))
- `date` (DATE, Not Null)
- `type` (ENUM: 'income', 'expense', Not Null)
- `category_id` (INT, Foreign Key to categories.id, Nullable)
- `user_id` (INT, Foreign Key to users.id, Not Null)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

## Running the Server

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

The server will run on `http://localhost:5000` by default.

## API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
  ```json
  {
    "username": "johndoe",
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- `POST /auth/login` - Login user
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```

### Categories (requires authentication)
- `GET /categories` - Get all user categories
- `POST /categories` - Create category
  ```json
  {
    "name": "Food",
    "description": "Food and dining expenses"
  }
  ```
- `PUT /categories/:id` - Update category
- `DELETE /categories/:id` - Delete category

### Transactions (requires authentication)
- `GET /transactions` - Get transactions with optional filters:
  - `?q=search_term` - Search in description/category
  - `?type=income|expense` - Filter by type
  - `?category_id=1` - Filter by category
  - `?start_date=2024-01-01&end_date=2024-12-31` - Date range
  - `?sort_by=date&sort_order=desc` - Sort options
  - `?page=1&limit=50` - Pagination
- `POST /transactions` - Create transaction
  ```json
  {
    "amount": 25.50,
    "description": "Lunch at restaurant",
    "date": "2024-01-15",
    "type": "expense",
    "category_id": 1
  }
  ```
- `PUT /transactions/:id` - Update transaction
- `DELETE /transactions/:id` - Delete transaction

## Testing with Postman

1. **Register a user:**
   - Method: POST
   - URL: `http://localhost:5000/auth/register`
   - Body: JSON with username, email, password

2. **Login to get token:**
   - Method: POST
   - URL: `http://localhost:5000/auth/login`
   - Body: JSON with email, password
   - Copy the token from response

3. **Set Authorization for authenticated requests:**
   - Add header: `Authorization: Bearer YOUR_TOKEN_HERE`

4. **Test other endpoints:**
   - Use the token from step 2 for all authenticated requests
   - Create categories first, then transactions

## API Endpoints

- `GET /` - API status
- `GET /health` - Health check