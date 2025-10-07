# Library REST API

A simple and robust RESTful API for managing a personal library of books. This project is built with Node.js, Express, and Prisma, featuring secure authentication and a clean, scalable architecture.

## Features

*   **User Authentication:** Secure user registration and login using JSON Web Tokens (JWT).
*   **CRUD Operations for Books:** Authenticated users can create, read, update, and delete their own books.
*   **Data Validation:** Incoming data is validated to ensure integrity.
*   **Scalable Architecture:** The code is organized into services, controllers, and routes for clear separation of concerns.
*   **ORM:** Uses Prisma for type-safe database access and easy migrations.

## Tech Stack

*   **Backend:** Node.js, Express.js
*   **Database:** Prisma ORM (designed for PostgreSQL, but adaptable)
*   **Authentication:** `jsonwebtoken`, `bcryptjs`
*   **Validation:** `joi`
*   **Environment:** `dotenv`

## Getting Started

### Prerequisites

*   Node.js (v14 or later)
*   npm
*   A running PostgreSQL database instance

### 1. Clone the Repository

```bash
git clone https://github.com/arushdesp/library-api.git
cd library-api
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root of the project and add the following variables.

```env
# Example .env file
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
JWT_SECRET="your_super_secret_jwt_key"
PORT=3000
```

### 4. Run Database Migrations

Prisma will use the `schema.prisma` file to create the necessary tables in your database.

```bash
npx prisma migrate dev
```

### 5. Run the Server

```bash
npm start
```

The API will be running at `http://localhost:3000`.

## API Endpoints

All book-related routes require a valid JWT Bearer token in the `Authorization` header.

### Authentication

*   `POST /api/auth/register` - Register a new user.
*   `POST /api/auth/login` - Log in and receive a JWT.

### Books (Protected)

*   `GET /api/books` - Get all books for the authenticated user.
*   `POST /api/books` - Create a new book.
*   `GET /api/books/:id` - Get a single book by its ID.
*   `PUT /api/books/:id` - Update a book.
*   `DELETE /api/books/:id` - Delete a book.

## Running Tests

To run the automated tests, use the following command:

```bash
npm test
