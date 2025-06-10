# 🏟️ SportCourts Booking Platform

A web application for booking sports venues. Users can register, browse available sports fields and book time slots. Built with a microservices architecture using Node.js, PostgreSQL, RabbitMQ, and React.

## 🧱 Services

- **User Service** – user registration & login
- **Venue Service** – venues and available slots
- **Booking Service** – booking logic
- **API Gateway** – routes all client requests
- **Frontend** – React.js web interface

## 🛠 Requirements

- Node.js ≥ 18
- PostgreSQL running on `localhost:5432` with:
  - database: `SportCourts`
  - user: `postgres`
  - password: `1234`
- RabbitMQ running on `localhost:5672`

## 🚀 How to Run

1. Make sure PostgreSQL and RabbitMQ are running locally.
2. Clone the project and install dependencies for each service:
```bash
cd user-service && npm install
cd venue-service && npm install
cd booking-service && npm install
cd api-gateway && npm install
cd frontend && npm install
```
3. Start app:
```bash
npm run start
```

## 🌍 URLs

- API Gateway: http://localhost:3000
- Frontend: http://localhost:3004
- RabbitMQ UI: http://localhost:15672 (user: `guest`, pass: `guest`)

## 🔗 Sample Endpoints

- `POST /users/register`
- `GET /venues`
- `POST /bookings`

## 🧪 Tech Stack

Node.js • Express/Nest • PostgreSQL • Sequelize/TypeORM • RabbitMQ • React.js
