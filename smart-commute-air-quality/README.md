# Smart Commute Air Quality 🌱🚴‍♂️

A comprehensive MERN stack web application designed to help users find the healthiest and most efficient commuting routes based on real-time air quality data. 

## 🚀 Features

- **Interactive Maps:** Real-time map rendering using `Leaflet` and `react-leaflet`.
- **Air Quality Routing:** Suggests routes with the best air quality index (AQI).
- **User Authentication:** Secure JWT-based login and registration system.
- **Admin Dashboard:** Seeded admin accounts for platform management.
- **Premium Subscription:** Integrated `Razorpay` payment gateway for premium features.
- **Notifications:** SMS and email alerts powered by `Twilio` and `Nodemailer`.
- **Beautiful UI:** Responsive, modern design built with `Tailwind CSS`, `Framer Motion` animations, and `Lucide React` icons.

---

## 🛠️ Tech Stack

**Frontend:**
- React (Vite)
- Tailwind CSS
- React Router DOM
- React Leaflet
- Framer Motion

**Backend:**
- Node.js & Express.js
- MongoDB & Mongoose
- JWT (JSON Web Tokens) & bcryptjs
- Razorpay
- Twilio & Nodemailer

---

## ⚙️ Prerequisites

Before you begin, ensure you have met the following requirements:
* **Node.js** (v16.x or higher) installed on your machine.
* **MongoDB** installed locally or an active MongoDB Atlas cluster URI.
* **Git** installed on your machine.

---

## 💻 Installation & Setup

Follow these steps to get the project up and running locally.

### 1. Clone the repository
```bash
git clone <your-repository-url>
cd MERNPROJECT
```

### 2. Backend Setup
Navigate to the backend directory and install the dependencies:
```bash
cd backend
npm install
```

Create a `.env` file in the `/backend` directory and add the following environment variables:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
CLIENT_ORIGINS=http://localhost:5173,https://smartcommuteairquality.vercel.app
JWT_SECRET=your_jwt_secret_key
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
EMAIL_USER=your_email_address
EMAIL_PASS=your_email_password
```

Seed the initial Admin user and start the development server:
```bash
# Optional: Seed the database with an admin user
npm run seed:admin

# Start the server (runs on nodemon)
npm run dev
```

### 3. Frontend Setup
Open a new terminal window, navigate to the frontend directory, and install the dependencies:
```bash
cd smart-commute-air-quality
npm install
```

Create a `.env` file in the `/smart-commute-air-quality` directory for any required frontend variables (e.g., API URLs):
```env
VITE_API_BASE_URL=http://localhost:5000
```

For deployment, set `VITE_API_BASE_URL` to the public backend URL in the frontend hosting
environment, and set `CLIENT_ORIGINS` on the backend to the frontend origins that should
be allowed (comma-separated, without trailing slashes). Redeploy the frontend after
changing its environment variables.

Start the frontend Vite development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173` and the backend at `http://localhost:5000`.

---

## 📁 Project Structure

```text
MERNPROJECT/
├── backend/                  # Express.js backend server
│   ├── package.json          # Backend dependencies
│   ├── server.js             # Main entry point
│   ├── seedAdmin.js          # Script to create an admin account
│   └── ...                   # Controllers, models, routes, etc.
│
└── smart-commute-air-quality/ # React + Vite frontend
    ├── src/
    │   ├── components/       # Reusable UI components
    │   ├── pages/            # Page components (Profile, etc.)
    │   ├── App.jsx           # Main React component
    │   └── ...
    ├── index.html
    ├── package.json          # Frontend dependencies
    ├── tailwind.config.js    # Tailwind configuration
    └── vite.config.js        # Vite configuration
```

---

## 📜 Available Scripts

### In the `backend` directory:
- `npm run dev`: Starts the backend server with Nodemon for hot-reloading.
- `npm start`: Starts the Node.js server.
- `npm run seed:admin`: Runs the script to create a default administrator in the database.

### In the `smart-commute-air-quality` directory:
- `npm run dev`: Starts the Vite development server.
- `npm run build`: Builds the React application for production.
- `npm run lint`: Runs ESLint to find code issues.
- `npm run preview`: Previews the production build locally.

---

## 🤝 Contributing

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
