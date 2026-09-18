# LocalFix — Local Services Marketplace

LocalFix is a full-stack MERN marketplace for discovering and booking local service professionals such as electricians, plumbers, carpenters, AC technicians, painters, cleaners, maids and appliance repair specialists.

## What is implemented

- Customer, provider and admin roles
- JWT authentication + bcrypt password hashing
- Role-based authorization middleware
- Service category management
- Provider profiles, verification and service selection
- MongoDB geospatial provider search (`2dsphere` / `$near`)
- Provider availability by day and time
- Booking state machine: pending → accepted/rejected → in_progress → completed
- Time-slot conflict checking
- Razorpay integration with an explicit local demo-payment fallback when keys are absent
- Payment verification endpoint and webhook-ready endpoint
- Socket.IO real-time booking/notification events
- Cloudinary-ready image upload flow with local-file fallback
- Nodemailer/Brevo-ready email notifications with console fallback for local development
- Reviews and 1–5 star ratings with aggregate provider rating updates
- Customer, provider and admin dashboards
- Mapbox-ready frontend map component
- Seed data and demo accounts

## Project structure

```text
localfix/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── sockets/
│   │   └── utils/
│   ├── uploads/
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── services/
│   └── package.json
├── package.json
└── README.md
```


## Optional integrations

### Razorpay
Set:

```env
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
```

Without these variables, LocalFix exposes a clearly labelled demo-payment flow so the complete booking journey can still be demonstrated locally.

### Cloudinary
Set:

```env
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

Without them, uploads are stored under `backend/uploads` for development.

### Email / Brevo / SMTP
Set the SMTP variables in `backend/.env`. Without them, email notifications are printed as demo messages to the server console.

### Mapbox
Set:

```env
VITE_MAPBOX_TOKEN=...
```

The app already persists provider coordinates and performs MongoDB geospatial search even when the map token is absent.

## Main API groups

```text
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me

GET    /api/services
POST   /api/services                  # admin
PUT    /api/services/:id              # admin
DELETE /api/services/:id              # admin

GET    /api/providers
GET    /api/providers/:id
GET    /api/providers/profile/me      # provider
POST   /api/providers/profile         # provider
PUT    /api/providers/:id/verify      # admin

GET    /api/availability/:providerId
POST   /api/availability              # provider

POST   /api/bookings                  # customer
GET    /api/bookings/my
GET    /api/bookings/:id
PUT    /api/bookings/:id/status

POST   /api/payments/create-order
POST   /api/payments/verify
POST   /api/payments/webhook

POST   /api/reviews
GET    /api/reviews/provider/:providerId

GET    /api/notifications
PUT    /api/notifications/:id/read

GET    /api/admin/dashboard
GET    /api/admin/users
PUT    /api/admin/users/:id/toggle
```

## Booking lifecycle

```text
Customer creates booking
        ↓
      pending
       /   \
   accept  reject
     ↓        ↓
 accepted   rejected
     ↓
 in_progress
     ↓
 completed
     ↓
 customer review
```

## Real-time events

Socket.IO rooms are created per user:

```text
user_<userId>
```

Used events include:

```text
new_notification
booking_accepted
booking_rejected
booking_completed
```

## Portfolio talking points

LocalFix demonstrates more than CRUD: multi-role authentication, marketplace business rules, geospatial queries, availability conflicts, booking state transitions, online payments, real-time notifications, image storage, email automation, reviews, and admin operations.
