## Project Overview

This project provides a solution to a backend challenge using Node.js (version 22.12.0), NestJS, PostgreSQL, and Docker. It implements a small API that interacts with the Contentful API to fetch 'Product' entries every hour, store them in a database, and provide endpoints for both public and private modules.

### Challenge Description

The goal of this challenge is to build a backend service that integrates with the Contentful API and a database to fetch and manage product data. The service should:

- **Scheduled Task**: Fetch product data from Contentful every hour.
- **Public Module**: Expose paginated data (up to 5 items per page) that can be filtered by product attributes (e.g., name, category, price).
- **Private Module**: Expose protected reports requiring JWT authentication, including:
  - Percentage of deleted products.
  - Percentage of non-deleted products with filtering options (price, custom date range).
  - A custom report of your choice.
- **Persistence**: Deleted products should not reappear after restarting the app.

### Project Features

- **Public Module**: Allows retrieval of paginated product data with filters.
- **Private Module**: Provides reports on product statistics.
- **Contentful Integration**: Automatically fetches product data from Contentful at hourly intervals.
- **Database Integration**: Uses PostgreSQL to store product data.
- **Dockerized**: The project is fully Dockerized for easy setup and deployment.

### Tech Stack

- **Node.js (v22.12.0)**: The server is built using Node.js (LTS version).
- **NestJS**: Framework for building efficient, scalable Node.js applications.
- **PostgreSQL**: Relational database used for storing product data.
- **TypeORM**: ORM for interacting with the PostgreSQL database.
- **Swagger**: API documentation exposed at `/docs`.
- **Docker**: For containerizing the application.

## Setting Up the Project

### Prerequisites

1. **Node.js**: Ensure you're using Node.js v22.12.0 or later.
2. **Docker**: Docker is required to run the project in containers.

### Step 1: Copy and Configure the Environment Variables

Before running the app, copy the `.env.example` file and rename it to `.env`. Fill in the variables with the appropriate values to connect to the Contentful API and the PostgreSQL database.

```bash
cp .env.example .env
```

After copying the `.env.example` file to `.env`, open the `.env` file and configure it with the necessary values:

#### Contentful Configuration:

- `CONTENTFUL_SPACE_ID=<your_contentful_space_id>`
- `CONTENTFUL_ACCESS_TOKEN=<your_contentful_access_token>`
- `CONTENTFUL_CONTENT_TYPE=<your_contentful_content_type_id>`

#### PostgreSQL Database Configuration:

- `DATABASE_HOST=localhost` (or the hostname of your database)
- `DATABASE_PORT=5432` (default PostgreSQL port)
- `DATABASE_USER=postgres` (or your PostgreSQL username)
- `DATABASE_PASSWORD=postgres` (or your PostgreSQL password)
- `DATABASE_NAME=backend_test_nest` (or your database name)

#### JWT Secret:

- `JWT_SECRET=<your_jwt_secret>`

Make sure to replace the placeholders with your actual values.

### Step 2: Running the Application with Docker

Once the `.env` file is configured, you can use Docker to run the app and the PostgreSQL database.

To start the application with `docker-compose`, run the following command:

```bash
docker-compose up
```

### Step 3: Accessing the API

Once the containers are up and running, you can access the API at:

- Public API: http://localhost:3000/api
- API Documentation (Swagger): http://localhost:3000/docs

### Step 4: Running Tests

To run the tests, simply execute the following command:

```bash
npm run test
```

---

## Endpoints

### Public Module

- **GET `/api/products`**: Retrieve paginated products with optional filters (name, category, price range). It returns up to 5 items per page.

### Private Module (Requires JWT)

- **GET `/api/reports/deleted-products`**: Report showing the percentage of deleted products.
- **GET `/api/reports/non-deleted-products`**: Report showing the percentage of non-deleted products with filtering options (e.g., with price, custom date range).
- **GET `/api/reports/custom`**: A custom report of your choice.

**Authentication**: To access the private module, provide a valid JWT token in the request headers.

---

## Solution for the Challenge

This project fulfills all requirements for the backend challenge:

1. **Hourly sync with Contentful**: The server automatically fetches product data from Contentful at hourly intervals.
2. **Database Integration**: The products are stored in PostgreSQL using TypeORM.
3. **Paginated Public API**: The public API returns a paginated list of products (up to 5 per page) with filters.
4. **JWT Authentication**: The private reports require a JWT for authorization.
5. **Persistence**: Deleted products are flagged and do not reappear after restarting the application.
6. **Dockerized**: The app is fully containerized using Docker and can be easily set up using `docker-compose`.

---

## Additional Information

- **Conventional Commit**: This project follows conventional commit standards for clear and consistent versioning.
- **GitFlow**: We use GitFlow for branching and version control.
