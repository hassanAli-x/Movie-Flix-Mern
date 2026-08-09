# 🎬 MovieFlix

A full-stack movie discovery app built with the MERN stack. Browse trending movies, search the full TMDB catalog, save favorites to your account, and view detailed info — all behind real JWT-based authentication.

**🔗 Live Demo:** [movie-flix-mern.vercel.app](https://movie-flix-mern.vercel.app)
**🔗 Backend API:** [movie-flix-mern.onrender.com](https://movie-flix-mern.onrender.com)

> Note: the backend is hosted on Render's free tier, which spins down after inactivity. The first request after idle time may take 20–30 seconds to respond while it wakes up.

---

## ✨ Features

- **Authentication** — signup/login with hashed passwords (bcrypt) and JWT-based sessions
- **Email verification** — new accounts trigger a verification email via Resend (implemented and functional; not currently required to log in — see note below)
- **Movie browsing** — live data from [TMDB](https://www.themoviedb.org/), with infinite scroll pagination
- **Search** — debounced live search across TMDB's full catalog
- **Featured carousel** — Swiper-powered hero section highlighting trending titles
- **Favorites** — save/remove movies per account, persisted in MongoDB (not just localStorage)
- **Movie details** — full description, genre, rating, and poster for each title
- **Protected routes** — Home and Movie Detail pages require authentication
- **Responsive dark UI** — built with Tailwind CSS

---

## 🛠️ Tech Stack

**Frontend**
- React (Vite)
- React Router
- Tailwind CSS
- Swiper.js
- Lucide React (icons)

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- JWT (jsonwebtoken)
- bcryptjs
- Resend (transactional email)

**External API**
- [TMDB API](https://www.themoviedb.org/documentation/api) for movie data

**Deployment**
- Frontend → Vercel
- Backend → Render
- Database → MongoDB Atlas

---

## 📁 Project Structure

```
movie-app/
├── frontend/
│   ├── src/
│   │   ├── components/     # Navbar, MovieCard, ProtectedRoute
│   │   ├── context/        # AuthContext, FavoritesContext
│   │   ├── pages/          # Login, Signup, Home, MovieDetail, VerifyEmail
│   │   ├── services/       # TMDB API calls
│   │   └── App.jsx
│   └── package.json
└── backend/
    ├── models/              # User schema
    ├── middleware/          # JWT auth middleware
    ├── src/
    │   ├── controllers/     # auth & favorites logic
    │   ├── routes/          # auth & favorites routes
    │   ├── utils/           # email sending
    │   ├── app.js
    │   └── server.js
    └── package.json
```

---

## 🚀 Running Locally

### Prerequisites
- Node.js installed
- A free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster
- A free [TMDB API key](https://www.themoviedb.org/settings/api)
- A free [Resend API key](https://resend.com) (optional — only needed for verification emails)

### 1. Clone the repo
```bash
git clone https://github.com/hassanAli-x/Movie-Flix-Mern.git
cd Movie-Flix-Mern
```

### 2. Backend setup
```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:
```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_random_secret_string
RESEND_API_KEY=your_resend_api_key
FRONTEND_URL=http://localhost:5173
PORT=3000
```

Run it:
```bash
npm run dev
```

### 3. Frontend setup
```bash
cd ../frontend
npm install
```

Create a `.env` file in `frontend/`:
```
VITE_TMDB_API_KEY=your_tmdb_api_key
VITE_API_URL=http://localhost:3000
```

Run it:
```bash
npm run dev
```

Visit `http://localhost:5173`.

---

## 📌 Notes on Email Verification

Signup sends a real verification email via Resend, and the `/verify-email` flow is fully implemented and working. However, Resend's free tier (without a paid custom domain) can only deliver to the email address tied to the Resend account itself — not arbitrary third-party addresses. Since this is a portfolio project rather than a production app, email verification is implemented but **not required** to log in, so anyone can sign up and use the app immediately with any email address.

---

## 🔮 Possible Future Improvements

- Enforce email verification once a custom domain is set up
- Genre-based filtering
- User reviews/ratings
- Watchlist separate from favorites
- Skeleton loading states

---

## 📄 License

This project was built for portfolio/learning purposes.