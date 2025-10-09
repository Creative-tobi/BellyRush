# BellyRush — Food Delivery Platform

![BellyRush Banner](https://via.placeholder.com/1200x400/4CAF50/FFFFFF?text=BellyRush+Food+Delivery)

**BellyRush** is a full-featured food delivery platform built with the MERN stack (MongoDB, Express, React, Node.js). It enables customers to order food from verified vendors, vendors to manage menus and orders, delivery riders to accept and fulfill deliveries, and admins to oversee the entire ecosystem.

---

##  Features

###  **Customer Dashboard**
- Browse restaurants & menus
- Add items to cart
- Place orders with Stripe-like payment flow (dev mode supported)
- Track order status in real-time
- Update profile & delivery address
- View order history

###  **Vendor Dashboard**
- Manage restaurant profile & menu items
- View and update order status (`pending` → `paid` → `assigned` → `completed`)
- Assign orders to available delivery riders
- Track earnings and performance
- Edit business hours, cuisine, and delivery area

###  **Delivery Rider Dashboard**
- Set availability status (`available`, `busy`, `offline`)
- Accept assigned orders
- Mark orders as **delivered**
- View earnings and ratings
- Update profile & vehicle info

###  **Admin Dashboard**
- Full CRUD operations for:
  - Vendors
  - Buyers (Customers)
  - Delivery Riders
  - Menu Items
  - Orders
- Real-time platform analytics (revenue, active users, average order value)
- User verification management
- Profile settings with image upload

###  **Authentication & Security**
- JWT-based authentication
- Role-based access control (`admin`, `vendor`, `buyer`, `delivery`)
- OTP email verification for admin registration
- Protected routes

###  **Email Integration**
- Nodemailer-powered email service
- Sends OTP during admin registration
- Sends verification & status update emails

###  **File Upload**
- Profile & menu item image uploads via `multer`
- Images served statically from `/uploads`

---

##  Tech Stack

### Frontend
- **React** (v18+)
- **React Router DOM** for routing
- **Tailwind CSS** for styling
- **Framer Motion** for smooth animations
- **Axios** for API calls

### Backend
- **Node.js** with **Express**
- **MongoDB** with **Mongoose** ODM
- **JWT** for authentication
- **Nodemailer** for email
- **Multer** for file uploads
- **Bcrypt** for password hashing

### DevOps
- Environment variables (`.env`)
- CORS enabled
- RESTful API design

---

##  Project Structure

```
bellyrush/
├── client/                 # React frontend
│   ├── src/
│   │   ├── component/      # Reusable components (Api.js, etc.)
│   │   ├── pages/          # Dashboard views (Customer, Vendor, Admin, Delivery)
│   │   └── App.js
├── server/                 # Express backend
│   ├── config/             # Database & Cloudinary config
│   ├── controller/         # Route handlers (admin.controller.js, etc.)
│   ├── middleware/         # Auth & validation middleware
│   ├── model/              # Mongoose schemas
│   ├── routes/             # API routes
│   ├── service/            # Nodemailer service
│   └── server.js
├── uploads/                # Uploaded images (auto-created)
├── .env                    # Environment variables
└── README.md
```

---

##  Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas)
- SMTP email service (e.g., Gmail, SendGrid)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/bellyrush.git
cd bellyrush
```

### 2. Set Up Backend
```bash
cd server
npm install

# Create .env file
cp .env.example .env
```

**Update `.env`**:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
SMTP_HOST=HOST
SMTP_PORT=PORT_NUMBER  # e.g., 587 for TLS, 465 for SSL
SMTP_SECURE=false      # true for 465, false for other ports
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password  # Use Gmail App Password
```

Start the server:
```bash
npm run dev
```

### 3. Set Up Frontend
```bash
cd ../client
npm install
```

**Update `src/component/Api.js`**:
```js
export const BACKEND_BASE_URL = "http://localhost:"; // Update if backend runs on a different URL
```

Start the React app:
```bash
npm start
```

### 4. Access Dashboards
| Role       | Register URL               | Login URL                |
|------------|----------------------------|--------------------------|
| Customer   | `/customer/register`       | `/customer/login`        |
| Vendor     | `/vendor/register`         | `/vendor/login`          |
| Delivery   | `/delivery/register`       | `/delivery/login`        |
| Admin      | `/admin/register`          | `/admin/login`           |

> 💡 **Note**: Admin registration requires email verification via OTP.

---

## Testing Email

If emails aren’t sending:
1. Ensure `SMTP_PORT=2525` and `secure=false` in Nodemailer config
2. For Gmail, **enable 2FA** and use an **[App Password](https://myaccount.google.com/apppasswords)**
3. Test with a simple script:
   ```js
   // test-email.js
   const sendEmail = require("./service/nodemailer");
   sendEmail({
     to: "your-test@email.com",
     subject: "Test",
     html: "<h1>It works!</h1>"
   });
   ```

---

##  Contributing

Contributions are welcome! Please fork the repository and create a pull request with your improvements.

---

##  License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

##  Acknowledgements

- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Nodemailer](https://nodemailer.com/)
- [MongoDB Atlas](https://www.mongodb.com/atlas)

---

> **BellyRush** — Satisfy hunger, one delivery at a time. 