# Blueprint: Building a Modern Node.js REST API

This document provides a comprehensive, step-by-step blueprint for building a robust, secure, and scalable RESTful API using Node.js, Express, and Prisma. While this specific project is a "Library API," the principles, structure, and workflow are designed to be a generic guide for any data-driven application.

## A. Phase 1 Overview & Core Concepts

This phase focuses on creating a production-quality backend service. We move beyond simple "hello world" examples to build an application with a solid architectural foundation, ready for real-world use.

**Core Concepts Mastered:**

*   **Architectural Pattern:** A clear, scalable structure separating concerns (Routes, Controllers, Services, Validations).
*   **Database Management:** Modeling data, running migrations, and performing queries with the Prisma ORM.
*   **Secure Authentication:** Implementing stateless authentication using JSON Web Tokens (JWT).
*   **Authorization:** Protecting routes and resources to ensure users can only access their own data.
*   **Middleware:** Using Express middleware for reusable logic like authentication and validation.
*   **API Design:** Following RESTful principles for predictable and easy-to-use endpoints.
*   **Environment Management:** Securely handling configuration and secrets.

---

## B. The "Learn by Writing" Blueprint: A Step-by-Step Workflow

This is the repeatable workflow you can use for future projects.

### **Step 1: Project Initialization & Server Setup**

This is the foundation of any Node.js project.

*   **Goal:** Create a basic Express server that can listen for requests.
*   **Tasks:**
    1.  **Initialize npm:** `npm init -y` creates the `package.json` file.
    2.  **Install Core Dependencies:** `npm install express dotenv cors`.
    3.  **Create `index.js`:** This is the entry point of your application.
    4.  **Basic Server:** Write code to create an Express app and make it listen on a port.
*   **Why this order?** We need the `package.json` to manage dependencies, and we need Express to create the server. `dotenv` is installed early to manage environment variables from the start.

*   **Code Example (`index.js` initial setup):**
    ```javascript
    const express = require('express');
    const dotenv = require('dotenv');

        dotenv.config({ path: './config.env' }); // Loads .env file contents into process.env

    const app = express();
    app.use(express.json()); // Middleware to parse JSON bodies

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
    ```

### **Step 2: Database Integration with Prisma**

This step connects your application to a database in a modern, type-safe way.

*   **Goal:** Define your data models and establish a connection to the database.
*   **Tasks:**
    1.  **Install Prisma:** `npm install prisma --save-dev` and `npm install @prisma/client`.
    2.  **Initialize Prisma:** `npx prisma init`. This creates a `prisma` directory and a `schema.prisma` file.
    3.  **Configure `schema.prisma`:** Define your database provider (e.g., PostgreSQL) and connection URL (usually from an environment variable).
    4.  **Model Your Data:** Define models in `schema.prisma`. A model is a blueprint for a table in your database.
    5.  **Run Migration:** `npx prisma migrate dev --name "init"`. Prisma inspects your schema, creates the necessary SQL migration file, and applies it to the database. This creates the actual tables.
*   **Why this order?** We define the *shape* of our data (the schema) first. Then, we use that definition to create the *actual* database structure (the migration).

*   **Code Example (`schema.prisma`):
    ```prisma
    model User {
      id        String   @id @default(cuid())
      email     String   @unique
      password  String
      books     Book[] // A user can have many books
    }

    model Book {
      id          String   @id @default(cuid())
      title       String
      author      String
      isbn        String   @unique
      publishedYear Int?
      owner       User     @relation(fields: [ownerId], references: [id]) // Relation field
      ownerId     String // Foreign key
    }
    ```

### **Step 3: Implementing Authentication**

This is the gateway to your application, allowing users to register and log in securely.

*   **Goal:** Create endpoints for user registration and login, returning a JWT on success.
*   **Libraries:** `bcryptjs` (to hash passwords), `jsonwebtoken` (to create/verify tokens), `joi` (for validation).
*   **Workflow:**
    1.  **Routes (`src/routes/auth.js`):** Define the public-facing paths (`/api/auth/register`, `/api/auth/login`). These point to controller functions.
    2.  **Validation (`src/validations/auth.js`):** Create `Joi` schemas to validate incoming `email` and `password`. **Why?** Never trust user input. Validation prevents malformed data and basic injection attacks *before* your core logic runs.
    3.  **Controller (`src/controllers/authController.js`):** This is the traffic cop. It takes the HTTP request, uses the service to do the heavy lifting, and sends back the HTTP response.
    4.  **Service (`src/services/authService.js`):** This contains the core business logic.
        *   `registerUser`: Hashes the password with `bcryptjs` and creates the user in the database via the Prisma client.
        *   `loginUser`: Finds the user, compares the provided password with the stored hash using `bcrypt.compare`, and if valid, generates a JWT.
*   **Why this structure (Routes -> Controller -> Service)?** This is **Separation of Concerns**.
    *   **Routes:** Only care about the URL and which controller handles it.
    *   **Controllers:** Only care about the HTTP layer (request, response). They don't know *how* a user is created, only that they need to call a service to do it.
    *   **Services:** Only care about the business logic. They don't know about HTTP at all. This makes them highly reusable and easy to test independently.

### **Step 4: Protecting Routes with Middleware**

This step ensures that only authenticated users can access certain parts of your API.

*   **Goal:** Create a reusable piece of code (middleware) that verifies a JWT and attaches the user's data to the request object.
*   **Tasks:**
    1.  **Create `src/middleware/auth.js`:**
    2.  **Implement the `protect` function:**
        *   It checks for the `Authorization` header (e.g., `Bearer <token>`).
        *   It uses `jwt.verify()` to decode and validate the token using your `JWT_SECRET`.
        *   If successful, it fetches the user from the database and attaches it to `req.user`.
        *   If it fails, it sends a `401 Unauthorized` response.
*   **How it's used (`src/routes/book.js`):
    ```javascript
    const { protect } = require('../middleware/auth');
    // All routes defined after this middleware will be protected.
    router.use(protect);
    ```

### **Step 5: Building a Protected CRUD Feature**

Now we apply the established patterns to build the "books" feature.

*   **Goal:** Create endpoints for Creating, Reading, Updating, and Deleting books, ensuring a user can only affect their own books.
*   **Workflow:** This repeats the pattern from Step 3, but now for a protected resource.
    1.  **Routes (`src/routes/book.js`):** Define the paths (`/`, `/:id`) for all CRUD operations. Apply the `protect` middleware.
    2.  **Validation (`src/validations/book.js`):** Create a `Joi` schema for book data.
    3.  **Controller (`src/controllers/bookController.js`):
        *   Each function now has access to `req.user` (thanks to the `protect` middleware).
        *   **Create:** When creating a book, it uses `req.user.id` to set the `ownerId`, and handles `isbn` and `publishedYear`.
        *   **Read/Update/Delete:** The Prisma queries always include a `where` clause to match **both** the book `id` and the `ownerId` from `req.user.id`. This is the core of the authorization logic.

*   **Code Example (Authorization Logic):
    ```javascript
    // In updateBook controller
    const book = await prisma.book.updateMany({
      where: {
        id: req.params.id, // The book the user wants to update
        ownerId: req.user.id // **MUST** belong to the logged-in user
      },
      data: { ... }
    });
    // If book.count is 0, it means no book was found that matched BOTH conditions.
    ```

### **Step 6: Final Assembly in `index.js`**

The final step is to wire up all your routes in the main application file.

*   **Goal:** Tell the main Express app to use your route modules.
*   **Task:**
    ```javascript
    const authRoutes = require('./src/routes/auth');
    const bookRoutes = require('./src/routes/book');

    app.use('/api/auth', authRoutes);
    app.use('/api/books', bookRoutes);
    ```

---

## C. Essential Libraries & Technologies

*   **Node.js:** The JavaScript runtime environment.
*   **Express.js:** A web framework for Node.js that simplifies routing, middleware, and request/response handling.
*   **Prisma:** A next-generation ORM that provides a type-safe database client and simplifies migrations.
*   **PostgreSQL:** A powerful, open-source relational database.
*   **JSON Web Token (JWT):** The standard for creating access tokens for an application.
*   **bcryptjs:** A library for hashing passwords securely.
*   **Joi:** A library for data validation to ensure data integrity and security.
*   **dotenv:** A utility to load environment variables from a `.env` file.
*   **cors:** Express middleware to enable Cross-Origin Resource Sharing.

---

## D. Key Learning Goals & Challenges

*   **Main Takeaway:** You've learned a robust, scalable pattern for API development. The separation of concerns is the most critical concept.
*   **Common Challenge:** Understanding the flow of a request through middleware. **How to Overcome:** Think of it as a chain. `req` and `res` are passed from one function to the next. `next()` passes control to the next link in the chain.
*   **Common Challenge:** Asynchronous code, especially error handling. **How to Overcome:** Wrap `async` controller functions in a higher-order function that catches errors and passes them to Express's error handler, or use `try...catch` blocks consistently.

---

## E. Best Practices & Design Patterns

*   **Separation of Concerns:** Keep your database logic, business logic, and HTTP layer separate.
*   **Stateless Authentication:** Use JWTs. The server doesn't need to store session state, making it highly scalable.
*   **Validate Everything:** Never trust data from the client. Validate all incoming request bodies and parameters.
*   **Use Environment Variables:** Never hard-code secrets like database URLs or JWT secrets.
*   **Consistent Response Format:** Send JSON responses in a predictable format, e.g., `{ "data": [...] }` for success and `{ "error": { "message": "..." } }` for failure.

---

## F. Testing Strategy

*   **Unit Testing (Jest):** Test your services in isolation. For example, you can test the `authService` by providing mock data and asserting that it calls the Prisma client with the correct arguments and returns the expected value. You don't need a real database for this.
*   **Integration Testing (Jest + Supertest):** Test your controllers and routes. `supertest` allows you to make mock HTTP requests to your Express app. You can test the entire flow from request -> middleware -> controller -> response. This usually requires a test database.
*   **Your DevOps Background:** You can automate the setup and teardown of this test database using Docker and shell scripts, integrating it into a CI/CD pipeline.

---

## G. Further Learning & Advanced Topics

*   **Advanced Error Handling:** Create custom error classes and a centralized error-handling middleware.
*   **Logging:** Integrate a robust logging library like `Winston` to log requests and errors.
*   **Containerization:** Dockerize your application for consistent development and deployment environments.
*   **CI/CD:** Set up a pipeline (e.g., with GitHub Actions) to automatically run tests and deploy your application.
*   **Rate Limiting:** Protect your API from abuse by limiting the number of requests a user can make.
*   **WebSockets:** For real-time features like notifications or live updates.

---

## H. API Usage Examples (cURL)

Here’s how you can interact with your running API using `curl` from your terminal.

### 1. Register a New User

```bash
curl -X POST http://localhost:3000/api/auth/register \
-H "Content-Type: application/json" \
-d '{
  "email": "testuser@example.com",
  "password": "Password123!",
  "firstName": "Test",
  "lastName": "User"
}'
```

### 2. Log In & Get Your Token

```bash
curl -X POST http://localhost:3000/api/auth/login \
-H "Content-Type: application/json" \
-d '{
  "email": "testuser@example.com",
  "password": "Password123!"
}'
```

From the response, copy the `token` value. Then, save it to a shell variable for convenience:

```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjb..."
```

### 3. Create a Book (Protected Route)

Now, use the `$TOKEN` variable to authenticate.

```bash
curl -X POST http://localhost:3000/api/books \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $TOKEN" \
-d '{
  "title": "The Hobbit",
  "author": "J.R.R. Tolkien",
  "publishedYear": 1937
}'
```

### 4. Get Your List of Books (Protected Route)

```bash
curl http://localhost:3000/api/books \
-H "Authorization: Bearer $TOKEN"
```

---

## I. Recreating This Blueprint with Your Own Data

This section provides a step-by-step guide to help you adapt this API blueprint for your own data models and features.

### Step 1: Define Your Data Model in `prisma/schema.prisma`

Identify the core entities in your new application and define them as Prisma models. Think about their properties (fields) and relationships with other models.

*   **Task:** Open `prisma/schema.prisma` and add your new model.
*   **Example (for a "Product" model):
    ```prisma
    model Product {
      id          String   @id @default(cuid())
      name        String
      description String?
      price       Float
      ownerId     String
      owner       User     @relation(fields: [ownerId], references: [id])
      createdAt   DateTime @default(now())
      updatedAt   DateTime @updatedAt
    }
    ```
*   **Key Considerations:**
    *   **`@id` and `@default(cuid())`**: Essential for unique identifiers.
    *   **Relationships**: If your model belongs to a `User` (like `Book` or `Product`), include `ownerId` and the `@relation` field.
    *   **Field Types**: Choose appropriate Prisma types (String, Int, Float, Boolean, DateTime, etc.).
    *   **Optional Fields**: Use `?` for nullable fields.

### Step 2: Generate and Apply Database Migrations

After defining your new model, you need to update your database schema.

*   **Task:** Run the Prisma migration command.
*   **Command:**
    ```bash
    npx prisma migrate dev --name "add_your_model_name"
    ```
*   **Why?**: This command compares your `schema.prisma` with the current database state, generates the necessary SQL, and applies it.

### Step 3: Create Validation Schema (`src/validations/yourModel.js`)

Define the rules for incoming data for your new model using Joi. This ensures data integrity and security.

*   **Task:** Create a new file `src/validations/yourModel.js` and define a Joi schema.
*   **Example (for `productSchema`):
    ```javascript
    const Joi = require('joi');

    const productSchema = Joi.object({
      name: Joi.string().min(3).max(255).required(),
      description: Joi.string().max(1000).optional(),
      price: Joi.number().positive().required(),
    });

    module.exports = {
      productSchema,
    };
    ```
*   **Key Considerations:**
    *   **Required Fields**: Use `.required()`.
    *   **Optional Fields**: Use `.optional()`.
    *   **Data Types**: Match Joi types to your Prisma model fields (e.g., `Joi.string()`, `Joi.number()`, `Joi.date()`).
    *   **Constraints**: Add `min`, `max`, `pattern`, `positive`, etc., as needed.

### Step 4: Implement CRUD Operations (Routes, Controllers, Services)

Follow the established pattern to create the API endpoints for your new model.

#### 4.1. Create Service (`src/services/yourModelService.js`)

This file will contain the core business logic for interacting with your new model in the database.

*   **Task:** Create `src/services/yourModelService.js` and implement functions for `create`, `get`, `update`, and `delete` operations using the Prisma client.
*   **Example (for `productService.js`):
    ```javascript
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    const createProduct = async (productData, ownerId) => {
      return await prisma.product.create({
        data: {
          ...productData,
          ownerId,
        },
      });
    };

    const getProducts = async (ownerId) => {
      return await prisma.product.findMany({ where: { ownerId } });
    };

    const getProductById = async (id, ownerId) => {
      return await prisma.product.findUnique({
        where: { id, ownerId },
      });
    };

    const updateProduct = async (id, ownerId, updateData) => {
      return await prisma.product.updateMany({
        where: { id, ownerId },
        data: updateData,
      });
    };

    const deleteProduct = async (id, ownerId) => {
      return await prisma.product.deleteMany({
        where: { id, ownerId },
      });
    };

    module.exports = {
      createProduct,
      getProducts,
      getProductById,
      updateProduct,
      deleteProduct,
    };
    ```
*   **Key Considerations:**
    *   **`ownerId`**: Crucial for ensuring users only interact with their own data. Pass `req.user.id` from the controller.
    *   **Prisma Methods**: Use `create`, `findMany`, `findUnique`, `updateMany`, `deleteMany`.

#### 4.2. Create Controller (`src/controllers/yourModelController.js`)

This file handles the HTTP request and response, delegating business logic to the service.

*   **Task:** Create `src/controllers/yourModelController.js` and implement functions for each API endpoint.
*   **Example (for `productController.js`):
    ```javascript
    const productService = require('../services/productService');
    const { productSchema } = require('../validations/product');

    const createProduct = async (req, res) => {
      const { error, value } = productSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }
      try {
        const product = await productService.createProduct(value, req.user.id);
        res.status(201).json(product);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    };

    const getProducts = async (req, res) => {
      try {
        const products = await productService.getProducts(req.user.id);
        res.status(200).json(products);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    };

    const getProduct = async (req, res) => {
      try {
        const product = await productService.getProductById(req.params.id, req.user.id);
        if (!product) {
          return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json(product);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    };

    const updateProduct = async (req, res) => {
      const { error, value } = productSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }
      try {
        const result = await productService.updateProduct(req.params.id, req.user.id, value);
        if (result.count === 0) {
          return res.status(404).json({ message: 'Product not found or not owned by user' });
        }
        res.status(200).json({ message: 'Product updated' });
      }
      catch (error) {
        res.status(500).json({ message: error.message });
      }
    };

    const deleteProduct = async (req, res) => {
      try {
        const result = await productService.deleteProduct(req.params.id, req.user.id);
        if (result.count === 0) {
          return res.status(404).json({ message: 'Product not found or not owned by user' });
        }
        res.status(204).send();
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    };

    module.exports = {
      createProduct,
      getProducts,
      getProduct,
      updateProduct,
      deleteProduct,
    };
    ```
*   **Key Considerations:**
    *   **Validation**: Always call `yourSchema.validate(req.body)` and handle errors.
    *   **`req.user.id`**: Pass this to service functions for authorization.
    *   **Error Handling**: Use `try...catch` blocks and return appropriate HTTP status codes (e.g., 400 for bad request, 401 for unauthorized, 404 for not found, 500 for server errors).

#### 4.3. Create Routes (`src/routes/yourModel.js`)

Define the API endpoints and link them to your controller functions.

*   **Task:** Create `src/routes/yourModel.js` and define your routes.
*   **Example (for `product.js`):
    ```javascript
    const express = require('express');
    const router = express.Router();
    const { authenticateToken } = require('../middleware/auth');
    const { validate } = require('../middleware/validation');
    const productController = require('../controllers/productController');
    const { productSchema } = require('../validations/product');

    // Apply authentication middleware to all product routes
    router.use(authenticateToken);

    router.route('/')
      .post(validate(productSchema), productController.createProduct)
      .get(productController.getProducts);

    router.route('/:id')
      .get(productController.getProduct)
      .put(validate(productSchema), productController.updateProduct)
      .delete(productController.deleteProduct);

    module.exports = router;
    ```
*   **Key Considerations:**
    *   **`authenticateToken`**: Apply this middleware to protect your routes.
    *   **`validate(yourSchema)`**: Apply your validation middleware to `POST` and `PUT` routes.
    *   **RESTful Design**: Use appropriate HTTP methods (GET, POST, PUT, DELETE) and URLs.

### Step 5: Integrate New Routes into `index.js`

Tell your main Express application about the new routes you've created.

*   **Task:** Open `index.js` and add your new route module.
*   **Example:**
    ```javascript
    // ... other imports
    const productRoutes = require('./src/routes/product');

    // ... other app.use statements
    app.use('/api/products', productRoutes);
    ```
*   **Why?**: This makes your new API endpoints accessible.

### Step 6: Write Tests for Your New API (`tests/yourModel.test.js`)

Create a dedicated test file to ensure your new API endpoints function correctly.

*   **Task:** Create `tests/yourModel.test.js` and write integration tests using `supertest`.
*   **Example (for `product.test.js`):
    ```javascript
    const request = require('supertest');
    const express = require('express');
    const productRouter = require('../src/routes/product');
    const authRouter = require('../src/routes/auth'); // Needed for user registration/login
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    const dotenv = require('dotenv');
    dotenv.config({ path: './config.env' });

    const app = express();
    app.use(express.json());
    app.use('/products', productRouter);
    app.use('/auth', authRouter);

    describe('Product Endpoints', () => {
      let token;
      let productId;

      beforeAll(async () => {
        // Clean up the database before tests
        await prisma.product.deleteMany({});
        await prisma.user.deleteMany({});

        // Register and login a user to get a token for protected routes
        await request(app)
          .post('/auth/register')
          .send({
            firstName: 'Test',
            lastName: 'User',
            email: 'testproduct@example.com',
            password: 'Password123!',
          });

        const res = await request(app)
          .post('/auth/login')
          .send({
            email: 'testproduct@example.com',
            password: 'Password123!',
          });
        token = res.body.token;
      });

      it('should create a new product', async () => {
        const res = await request(app)
          .post('/products')
          .set('Authorization', `Bearer ${token}`)
          .send({
            name: 'Laptop',
            description: 'Powerful computing device',
            price: 1200.00,
          });
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('id');
        productId = res.body.id;
      });

      it('should get a list of products', async () => {
        const res = await request(app)
          .get('/products')
          .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(1);
      });

      it('should get a single product by id', async () => {
        const res = await request(app)
          .get(`/products/${productId}`)
          .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('id', productId);
      });

      it('should update a product', async () => {
        const res = await request(app)
          .put(`/products/${productId}`)
          .set('Authorization', `Bearer ${token}`)
          .send({
            name: 'Gaming Laptop',
            price: 1500.00,
          });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message', 'Product updated');
      });

      it('should delete a product', async () => {
        const res = await request(app)
          .delete(`/products/${productId}`)
          .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(204);
      });
    });
    ```
*   **Key Considerations:**
    *   **`beforeAll`**: Use this to set up a clean test environment (e.g., clear database, register/login a test user).
    *   **`supertest`**: Use `request(app).post('/your-model-endpoint').send(...)` to simulate HTTP requests.
    *   **Assertions**: Use `expect(res.statusCode).toEqual(...)` and `expect(res.body).toHaveProperty(...)` to verify responses.
    *   **Authentication**: Remember to include the `Authorization` header with the `Bearer` token for protected routes.

This comprehensive guide should enable you to extend this blueprint with your own data models and API functionalities.
