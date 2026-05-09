🛍️ Elegant Essentials — Full-Stack Fashion E-Commerce Platform

> A production-ready fashion e-commerce store built with React, Node.js, MongoDB, and Redux Toolkit. Features a full storefront, admin dashboard, Google OAuth, real email delivery, and persistent cart state.

---

## 📸 Pages at a Glance

| Page | Description |
|------|-------------|
| `/` | Hero carousel, category grid, new arrivals, blog section, footer |
| `/category/:slug` | Filterable, sortable product listings per category |
| `/product/:id` | Full product detail with add-to-bag |
| `/cart` | Cart with quantity controls, order summary, checkout |
| `/login` | Email/password + Google OAuth sign-in |
| `/register` | Account creation |
| `/about` | Brand story, team, values |
| `/contact` | Contact form with real email delivery |
| `/admin` | Full admin dashboard (products, orders, categories, analytics) |

---

## ⚙️ Tech Stack

### Frontend
| Technology | Role |
|------------|------|
| React 18 | UI library |
| React Router v6 | Client-side routing |
| Redux Toolkit | Global state management |
| React Redux | React bindings for Redux |
| Recharts | Admin revenue charts |
| Tailwind CSS | Utility classes (base layer) |
| Vite | Build tool & dev server |

### Backend
| Technology | Role |
|------------|------|
| Node.js + Express | REST API server |
| MongoDB + Mongoose | Database & ODM |
| JSON Web Tokens | Authentication |
| Passport.js | Google OAuth 2.0 strategy |
| Nodemailer | Contact form email delivery via Gmail |
| bcryptjs | Password hashing |
| express-session | Session middleware |
| dotenv | Environment variable management |

---

## Getting Started
 
### Prerequisites

- Node.js 18+
- MongoDB (local or [Atlas](https://www.mongodb.com/atlas))
- A Gmail account (for the contact form)
- A Google Cloud project (for OAuth — optional)

---

### 1. Clone the repository
 
```bash
git clone https://github.com/your-username/maison.git
cd maison
```
 
---
 
### 2. Backend setup
 
```bash
cd server
npm install
```

Create a `.env` file in the `server/` directory:
 
```env
MONGODB_URI=mongodb://localhost:27017/maison
JWT_SECRET=your_long_random_jwt_secret
SESSION_SECRET=your_long_random_session_secret
CLIENT_URL=http://localhost:5173
PORT=5000
 
# Google OAuth (optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
 
# Gmail — for the Contact Us form
GMAIL_USER=yourstore@gmail.com
GMAIL_PASS=your_gmail_app_password
```

> **Getting a Gmail App Password:**
> 1. Go to [myaccount.google.com](https://myaccount.google.com) → Security
> 2. Enable 2-Step Verification
> 3. Go to Security → App Passwords → generate one for "Mail"
> 4. Paste the 16-character code as `GMAIL_PASS`

Start the backend:
 
```bash
npm run dev
# Server runs on http://localhost:5000
```
 
---
 
### 3. Frontend setup
 
```bash
cd client
npm install
npm run dev
# App runs on http://localhost:5173
```
 
---

## 🔐 Authentication
 
The app supports two sign-in methods:
 
### Email & Password
- Passwords are hashed with **bcryptjs** (12 salt rounds)
- A signed **JWT** (7-day expiry) is returned on login
- Token is stored in `localStorage` and read into the Redux `authSlice` on startup
### Google OAuth 2.0
- Handled by **Passport.js** (`passport-google-oauth20`)
- On success, the backend redirects to `/oauth-callback?token=...`
- `OAuthCallback.jsx` saves the token and dispatches `setTokenFromStorage()` to sync Redux

---

## 🛒 Cart & State Management
 
Cart state is managed by **Redux Toolkit** and **persisted to `localStorage`** automatically, so it survives page refreshes.

---

## 🛠️ Admin Dashboard
 
Access at `/admin`. Sign in with any registered account.
 
### Features
| Section | Capabilities |
|---------|-------------|
| **Dashboard** | Live revenue chart (real orders by month), top products, recent orders, low stock alerts |
| **Products** | Add / edit / delete products, image upload (file or URL), search |
| **Sale Items** | Toggle any product on/off sale, set discount %, live sale price preview |
| **Orders** | View all orders, update status (pending → processing → shipped → delivered → cancelled), expand order items |
| **Categories** | Add / edit / delete categories (stored in `localStorage`) |
| **Customers** | Order history per customer |
| **Notifications** | Bell icon with unread count — auto-generated from new orders and status changes |
 
---

## 📧 Contact Form Email
 
When a customer submits the contact form at `/contact`, **two emails are sent** via Nodemailer:
 
1. **Store notification** — formatted email to your Gmail inbox with a Reply button that goes directly to the customer
2. **Customer auto-reply** — branded confirmation email sent to the customer

---

## 🗺️ API Reference
 
### Auth — `/api/auth`
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Create account |
| POST | `/login` | Sign in, returns JWT |
| GET | `/google` | Initiate Google OAuth |
| GET | `/google/callback` | OAuth callback |
 
### Products — `/api/products`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | Public | Get all products |
| GET | `/:id` | Public | Get single product |
| POST | `/` | Required | Create product |
| PUT | `/:id` | Required | Update product |
| DELETE | `/:id` | Required | Delete product |
 
### Orders — `/api/orders`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/` | Required | Place order |
| GET | `/my-orders` | Required | Get user's orders |
| GET | `/all` | Required | Get all orders (admin) |
| PATCH | `/:id/status` | Required | Update order status (admin) |
 
### Contact — `/api/contact`
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Send contact form email |
 
---

## 🌍 Category Routes (Storefront)
 
| URL | Shows |
|-----|-------|
| `/category/new-in` | All products (newest first) |
| `/category/sale` | Products with `onSale: true` |
| `/category/women` | Products where `category === "Women"` |
| `/category/men` | Products where `category === "Men"` |
| `/category/bags` | Products where `category === "Bags"` |
| `/category/fragrances` | Products where `category === "Fragrances"` |
| `/category/all` | All products |
 
> Category matching is **case-insensitive**. A product with category `"women"` or `"WOMEN"` will appear at `/category/women`.
 
---
 
## 📦 Key Dependencies
 
### Frontend
```json
{
  "react": "^18",
  "react-router-dom": "^6",
  "@reduxjs/toolkit": "^2",
  "react-redux": "^9",
  "recharts": "^2",
  "vite": "^5"
}
```
 
### Backend
```json
{
  "express": "^4",
  "mongoose": "^8",
  "jsonwebtoken": "^9",
  "bcryptjs": "^2",
  "passport": "^0.7",
  "passport-google-oauth20": "^2",
  "nodemailer": "^6",
  "dotenv": "^16",
  "cors": "^2",
  "express-session": "^1"
}
```
 
---
 
## 🔧 Environment Variables Reference
 
| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | ✅ | MongoDB connection string |
| `JWT_SECRET` | ✅ | Secret for signing JWTs |
| `SESSION_SECRET` | ✅ | Secret for express-session |
| `CLIENT_URL` | ✅ | Frontend URL (e.g. `http://localhost:5173`) |
| `PORT` | ✅ | Backend port (default: 5000) |
| `GMAIL_USER` | ✅ | Gmail address for contact form |
| `GMAIL_PASS` | ✅ | Gmail App Password (16 characters) |
| `GOOGLE_CLIENT_ID` | ⬜ | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | ⬜ | Google OAuth client secret |
 
---
 
## 📱 Mobile Responsiveness
 
All pages are fully responsive:
- Navbar collapses to a hamburger menu on mobile
- Hero, product grids, and footer reflow to single-column layouts
- Category page search bar uses `font-size: 16px` to prevent iOS auto-zoom
- Cart layout stacks vertically on small screens
- Admin dashboard has scrollable tables
---
 
## 🤝 Contributing
 
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "Add your feature"`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request
---
 
## 📄 License
 
This project is licensed under the MIT License.
 
---
 
<p align="center">Built by HH MIR TECH SOLUTIONS</p>
