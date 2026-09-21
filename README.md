# ABuild Homes Estates — Backend API 🏛️

Robust, high-performance, modular RESTful API powering **ABuild Homes Estates**, an online real-estate platform supporting verified luxury properties, offer negotiations, customer reviews, and secure Stripe checkout.

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-lightgrey.svg)](https://expressjs.com/)
[![Mongoose](https://img.shields.io/badge/Mongoose-9.x-brightgreen.svg)](https://mongoosejs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-forestgreen.svg)](https://www.mongodb.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Admin%20SDK-amber.svg)](https://firebase.google.com/)
[![Stripe](https://img.shields.io/badge/Stripe-Payment%20Gateway-blueviolet.svg)](https://stripe.com/)

---

## 🏗️ Architecture Overview

The backend has been converted from a monolithic `index.js` script to a clean, enterprise-grade **Modular MVC Architecture** designed for both traditional server hosts and serverless platforms (Vercel / Netlify Functions):

```
Abuild-Homes-Estate-server/
├── index.js                  # Root application entry & serverless export
├── firebaseAdmin.js          # Resilient Firebase Admin SDK initializer
├── package.json              # Project dependencies & scripts
├── vercel.json               # Serverless deployment configuration
└── src/
    ├── index.js              # Express app bootstrap & route registration
    ├── config/
    │   └── db.js             # Mongoose connection with global connection caching
    ├── models/               # Strict Mongoose Schemas & Indexes
    │   ├── User.js           # User roles, verification status, timestamps
    │   ├── Property.js       # Granular location, valuation range, status
    │   ├── Review.js         # User reviews linked to properties
    │   ├── Wishlist.js       # Saved properties per user
    │   ├── Offer.js          # Price proposals, agent approval workflows
    │   └── Payment.js        # Stripe transactions, receipts, status
    ├── controllers/          # Business logic handlers
    │   ├── authController.js
    │   ├── userController.js
    │   ├── propertyController.js
    │   ├── reviewController.js
    │   ├── wishlistController.js
    │   ├── offerController.js
    │   └── paymentController.js
    ├── routes/               # Modular Express Route definitions
    │   ├── authRoutes.js
    │   ├── userRoutes.js
    │   ├── propertyRoutes.js
    │   ├── reviewRoutes.js
    │   ├── wishlistRoutes.js
    │   ├── offerRoutes.js
    │   └── paymentRoutes.js
    └── middlewares/          # Security, auth, and error handlers
        ├── apiGuard.js       # Blocker preventing direct browser address-bar inspection
        ├── verifyToken.js    # JWT Bearer token authentication
        ├── verifyAdmin.js    # RBAC: Admin-only route guard
        ├── verifyAgent.js    # RBAC: Agent-only route guard
        └── errorHandler.js   # Global error formatting
```

---

## ⚡ Key Highlights

- **Direct Browser Navigation Guard (`apiGuard`)**: Blocks unauthorized direct browser address-bar inspection (e.g. typing `http://localhost:5000/api/v1/properties` directly into a browser tab), returning `403 Forbidden` unless accessed via authorized client applications or API tokens.
- **Serverless-Safe Database Connection**: Implements `global.mongoose` connection caching in `src/config/db.js` to eliminate connection leaks across hot/cold serverless lambdas.
- **Granular Property Location**: Model supports `houseNumber`, `roadNumber`, `division`, `country`, and `continent`, automatically synchronizing and maintaining backward compatibility with the legacy `propertyLocation` string.
- **User Avatar (`imgUrl`) Synchronization**: Stores hosted HTTPS avatar URLs in MongoDB with bidirectional `photoURL` / `imgUrl` pre-save synchronization.
- **Robust Role-Based Access Control (RBAC)**: Fine-grained middleware protection (`verifyToken`, `verifyAdmin`, `verifyAgent`) ensuring secure API access.
- **Flexible Firebase Admin Initialization**: Gracefully parses private keys from environment variables (`FIREBASE_PRIVATE_KEY` with `\n` normalization or Base64 encoded JSON) without requiring insecure credential files in source control.
- **Backwards Compatible API**: Preserves all legacy endpoint structures (`/jwt`, `/reviews`, `/create-payment-intent`, `/api/v1/update-profile`) alongside standard versioned `/api/v1/*` resources.

---

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```ini
# Server Configuration
PORT=5000

# MongoDB Database Connection
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/AbuildHomesDB?retryWrites=true&w=majority

# Authentication Secrets
ACCESS_TOKEN_SECRET=your_jwt_secret_key_here

# Stripe Payment Gateway
STRIPE_SECRET_KEY=sk_test_51...

# Firebase Admin SDK Credentials
FIREBASE_PROJECT_ID=abuild-homesabd
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-...@abuild-homesabd.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

---

## 📡 API Endpoints

### Authentication & Token
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/jwt` | Generate signed JWT for authenticated user | Public |

### Users (`/api/v1/users`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/v1/users` | List all users | Admin |
| `GET` | `/api/v1/users/:email` | Get user details by email | Private |
| `GET` | `/api/v1/users/role/:email` | Get user role (`user`, `agent`, `admin`, `fraud`) | Public |
| `POST` | `/api/v1/users` | Register or upsert user | Public |
| `PATCH` | `/api/v1/users/role/:id` | Update role (`admin`, `agent`, `fraud`) | Admin |
| `PATCH` | `/api/v1/users/profile` | Update profile (name, imgUrl, photoURL) | Private |
| `PATCH` | `/api/v1/username` | Update user display name | Private |
| `DELETE` | `/api/v1/users/:id` | Delete user record | Admin |

### Properties (`/api/v1/properties`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/v1/properties` | Get verified properties (search, filter, sort) | Public |
| `GET` | `/api/v1/properties/all` | Get all properties (pending, verified, rejected) | Admin |
| `GET` | `/api/v1/properties/agent` | Get properties listed by authenticated agent | Agent |
| `GET` | `/api/v1/properties/:id` | Get single property details | Public |
| `POST` | `/api/v1/properties` | Submit new property listing | Agent |
| `PATCH` | `/api/v1/properties/:id` | Update property listing | Agent / Admin |
| `PATCH` | `/api/v1/properties/status/:id`| Verify or reject listing | Admin |
| `DELETE` | `/api/v1/properties/:id` | Delete property | Agent / Admin |

### Wishlist (`/api/v1/wishlists`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/v1/wishlists` | Get saved properties for user | Private |
| `POST` | `/api/v1/wishlists` | Add property to wishlist | Private |
| `DELETE` | `/api/v1/wishlists/:id` | Remove property from wishlist | Private |

### Offers (`/api/v1/offers`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/v1/offers/user` | Get offers submitted by buyer | Private |
| `GET` | `/api/v1/offers/agent` | Get incoming offers for agent's properties | Agent |
| `POST` | `/api/v1/offers` | Submit formal purchase offer | Private |
| `PATCH` | `/api/v1/offers/status/:id` | Accept or reject offer | Agent |

### Payments & Stripe
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/create-payment-intent` | Initialize Stripe Payment Intent | Private |
| `POST` | `/api/v1/payments` | Record completed transaction & mark offer as bought | Private |
| `GET` | `/api/v1/payments/user` | View transaction history | Private |

### Reviews (`/api/v1/reviews`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/v1/reviews` | List recent reviews (supports `?id=` for property) | Public |
| `GET` | `/api/v1/reviews/user` | Get reviews authored by user | Private |
| `POST` | `/api/v1/reviews` | Post review for a property | Private |
| `DELETE` | `/api/v1/reviews/:id` | Delete review | Private / Admin |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or newer)
- MongoDB Atlas cluster
- Stripe developer test keys
- Firebase project with Service Account

### Installation
```bash
# Clone the repository
git clone https://github.com/abdnimit1203/Abuild-Homes-Estate-server.git
cd Abuild-Homes-Estate-server

# Install dependencies
npm install

# Start development server
node index.js
# Or with nodemon
npm run dev
```

Server will be running at `http://localhost:5000`.

---

## 📄 License
ISC © [Abdullah Ibne Ali](https://github.com/abdnimit1203)
