# Family Expense Tracker Scalability & Architecture Guide

This document describes the architectural layout of the **Family Expense Tracker** application, security protocols, database optimizations, and outlines strategies for future enhancements, scaling, deployment, and high-availability operations.

---

## 1. Modular Architecture

The backend follows a modular, layer-separated architecture to isolate responsibilities:

*   **Models Layer (`models/`)**: Defines database schemas (Mongoose models) for application entities. No business logic lives here except database hooks (e.g., password hashing).
*   **Controllers Layer (`controllers/`)**: Coordinates application requests, extracts inputs, calls service functions, and formats HTTP responses.
*   **Services Layer (`services/`)**: Contains core business logic, database queries, and role verification/authorization rules.
*   **Routes Layer (`routes/`)**: Mounts versioned URL endpoints (`/api/v1/*`), binds controllers, and applies route-specific validation and auth middleware.
*   **Validators Layer (`validators/`)**: Declares request validation schemas using `express-validator` to guarantee incoming payloads meet data type and structure constraints before controller processing.
*   **Middleware Layer (`middleware/`)**: Contains general application and security utilities (e.g. rate limiters, CORS, Helmet, JWT protectors, and centralized error interceptors).

---

## 2. JWT Authentication

The application implements state-free user sessions using **JSON Web Tokens (JWT)**:

*   **Token Generation**: Upon successful login or registration, the backend generates a JWT containing the user's unique MongoDB database identifier (`id`), signs it with the server's private `JWT_SECRET`, and sets it as an `HttpOnly`, `Secure` (in production) cookie named `jwt`.
*   **Benefits**:
    *   **HttpOnly Cookies**: Prevents client-side scripts (XSS attacks) from reading the token.
    *   **SameSite Config**: Prevent Cross-Site Request Forgery (CSRF) by configuration (`SameSite=none` or `SameSite=lax`).
    *   **Stateless**: The server does not need to store session states in memory or cache on every request, making it easily horizontally scalable across instances.

---

## 3. Role-Based Access Control (RBAC)

The application supports dual roles to distinguish authority levels:

1.  **Admin (Parent/Guardian)**:
    *   Authorized to read and delete any family expense.
    *   Authorized to access family statistics and view profiles of all registered family members.
2.  **User (Child/Spouse)**:
    *   Authorized to create, read, update, and delete *only their own* expenses.
    *   Forbidden from viewing other family members' lists or aggregate family stats.

RBAC is enforced via:
*   A custom middleware `restrictTo('admin')` that intercepts endpoints on the routing layer.
*   Security validations on the service layer checking `expense.user.toString() === req.user.id` before executing updates or deletes for standard users.

---

## 4. MongoDB Indexing

To support fast search queries and scale with growing transaction feeds:

*   **Primary Indexes**:
    *   An index is automatically generated on the unique `email` key in the `User` schema.
*   **Compound Indexes**:
    *   In the `Expense` model, we configured a compound index on `{ user: 1, date: -1 }`.
    *   **Why?** When standard users load their dashboard, the query executed is `Expense.find({ user: userId }).sort({ date: -1 })`. By indexing the query field (`user`) and sorting order (`date`), MongoDB retrieves files using an **Index Scan (IXSCAN)** rather than a costly **Collection Scan (COLLSCAN)**, keeping operations fast even with millions of records.

---

## 5. Redis Caching (Future Enhancement Roadmap)

To mitigate database read bottlenecks and improve performance under high traffic:

*   **Proposed Mechanism**: Integrate **Redis** (an in-memory key-value data store) as a cache between the Node.js application and MongoDB.
*   **Caching Strategy (Cache-Aside)**:
    1.  When a query (like `/api/v1/users/stats` or `/api/v1/expenses`) is received, the service first queries Redis using a unique cache key (e.g. `family:stats` or `user:expenses:<userId>`).
    2.  If data exists (Cache Hit), return immediately.
    3.  If not (Cache Miss), query MongoDB, save the result to Redis with a Time-To-Live (TTL) expiry (e.g. 5 minutes), and return.
*   **Cache Invalidation**:
    *   Whenever an expense is created, updated, or deleted, delete or update the corresponding cache key to ensure subsequent reads retrieve fresh, accurate data.

---

## 6. Docker Deployment (Future Enhancement Roadmap)

To guarantee build environment consistency across development, testing, staging, and production:

*   **Multi-Stage Dockerfile**: Declare multi-stage Docker builds to keep final production images tiny.
*   **Docker Compose Configuration**:
    *   Standardize the app stack (Node.js API container, React client static container hosted via Nginx, local MongoDB, and Redis cache instance) using a `docker-compose.yml` file.
    *   Automates port forwarding, environment variable mounting, and database persistent storage volumes out-of-the-box.

---

## 7. Load Balancing

To handle scale demands beyond a single Node.js instance:

*   **Strategy**: Introduce a load balancer (such as **Nginx**, **AWS ALB**, or **HAProxy**) as the primary entry point in front of the API servers.
*   **Functionality**:
    *   Distribute incoming API request traffic evenly across a cluster of backend Node.js worker containers (horizontal scaling).
    *   Handle SSL termination, offloading cryptography operations from Node.js applications.
    *   Implement health checks to automatically isolate failed Node.js instances from the routing pool.
*   **Session Management**: Since JWT is stateless, any Node.js container can parse and verify the JWT cookie, facilitating round-robin load balancing without requiring "sticky sessions".

---

## 8. Microservices Readiness

If the application expands to include features like budgeting alerts, receipt optical character recognition (OCR), bank account synchronization, and report generation, we can migrate to a microservices architecture:

*   **Service Decomposition**:
    *   **Auth Service**: Handles registrations, logins, profile details, and JWT issuance.
    *   **Expense Tracker Service**: Standard CRUD logic for logs.
    *   **Analytics Service**: Computes monthly family reports and category split charts.
    *   **Notification Service**: Sends SMS or email notifications (budget limits reached).
*   **Inter-Service Communication**:
    *   Synchronous: Use gRPC or REST APIs for internal service calls.
    *   Asynchronous: Use a message broker (like **RabbitMQ** or **Apache Kafka**) to dispatch events. E.g., when an expense is logged, dispatch an `expense.created` event, which the Notification Service consumes to verify budget limits and send alerts asynchronously without blocking the user request thread.
