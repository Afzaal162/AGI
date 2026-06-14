<div align="center">

# 🌌 GENESIS
### *Where Products Come to Life*

**AI-Powered UGC Content Studio — Generate Stunning Product Images & Videos in Seconds**

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-Visit_Now-6366f1?style=for-the-badge)](https://agi-eta-beige.vercel.app)
[![GitHub Stars](https://img.shields.io/github/stars/Afzaal162/AGI?style=for-the-badge&color=f59e0b)](https://github.com/Afzaal162/AGI)
[![License](https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge)](LICENSE)

---

> 💡 **No expensive photoshoots. No models. No studios.**
> Just upload a product + model photo and watch AI do the magic.

---

</div>

## 🎬 What Does Genesis Do?

Genesis is a **full-stack AI UGC studio** that lets brands and creators generate photorealistic product content in seconds. Upload your product image and a model photo — Genesis uses **Stability AI** to blend them into professional-grade UGC images, and **Fal.ai** to animate them into scroll-stopping videos.

```
📸 Upload Product + Model Photos
         ↓
🤖 AI Blends Them Together
         ↓
🖼️ Get Photorealistic UGC Image
         ↓
🎬 Convert to Social Media Video
         ↓
⬇️ Download & Post Everywhere
```

---

## ✨ Features

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│   🖼️  AI Image Generation    →  Stability AI SDXL      │
│   🎬  AI Video Generation    →  Fal.ai Stable Video    │
│   🔐  Authentication         →  Clerk + Google OAuth   │
│   💳  Credits System         →  Pay per generation     │
│   ☁️  Cloud Storage          →  Cloudinary CDN         │
│   📊  Error Monitoring       →  Sentry                 │
│   🌐  Community Gallery      →  Share your work        │
│   📱  Fully Responsive       →  Mobile + Desktop       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🛠️ Built With

### 🎨 Frontend
![React](https://img.shields.io/badge/React_18-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=flat-square&logo=react-router&logoColor=white)

### ⚙️ Backend
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat-square&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=flat-square&logo=Prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat-square&logo=postgresql&logoColor=white)

### 🤖 AI & Cloud
![Stability AI](https://img.shields.io/badge/Stability_AI-FF6B6B?style=flat-square)
![Fal.ai](https://img.shields.io/badge/Fal.ai-8B5CF6?style=flat-square)
![Google Gemini](https://img.shields.io/badge/Google_Gemini-4285F4?style=flat-square&logo=google&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=flat-square&logo=cloudinary&logoColor=white)
![Clerk](https://img.shields.io/badge/Clerk-6C47FF?style=flat-square)
![Sentry](https://img.shields.io/badge/Sentry-362D59?style=flat-square&logo=sentry&logoColor=white)

### 🚀 Deployment
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white)
![Neon](https://img.shields.io/badge/Neon_DB-00E699?style=flat-square)

---

## 📁 Project Structure

```
AGI/
│
├── 🎨 reactjs/                    # Frontend Application
│   └── src/
│       ├── components/            # Navbar, Footer, Cards, Buttons
│       ├── pages/                 # Home, Generate, Result, Community
│       ├── config/                # Axios instance
│       └── types/                 # TypeScript interfaces
│
└── ⚙️ server/                     # Backend API
    ├── controllers/
    │   ├── projectController.ts   # Image & Video generation
    │   ├── userController.ts      # User & project management
    │   └── clerk.ts               # Webhook handler
    ├── routes/                    # API route definitions
    ├── middleware/                 # Auth protection
    ├── config/                    # DB, AI, Cloud setup
    └── prisma/                    # Database schema & migrations
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js `v18+`
- PostgreSQL database ([Neon](https://neon.tech) recommended — free tier available)
- Accounts on: [Clerk](https://clerk.com) · [Cloudinary](https://cloudinary.com) · [Stability AI](https://stability.ai) · [Fal.ai](https://fal.ai)

---

### 1. Clone the repo

```bash
git clone https://github.com/Afzaal162/AGI.git
cd AGI
```

---

### 2. Setup Backend

```bash
cd server
npm install
```

Create `server/.env`:

```env
# ─── Database ─────────────────────────────
DATABASE_URL=postgresql://...

# ─── Clerk Auth ───────────────────────────
CLERK_SECRET_KEY=sk_...
CLERK_WEBHOOK_SECRET=whsec_...

# ─── Cloudinary ───────────────────────────
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# ─── AI Services ──────────────────────────
STABILITY_API_KEY=sk-...
GOOGLE_CLOUD_API_KEY=AIza...
FAL_API_KEY=xxxx:xxxx

# ─── App ──────────────────────────────────
CLIENT_URL=http://localhost:5173
PORT=5000
```

```bash
npx prisma generate
npx prisma migrate dev
npm run server
```

---

### 3. Setup Frontend

```bash
cd reactjs
npm install
```

Create `reactjs/.env`:

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_...
VITE_BASE_URL=http://localhost:5000
```

```bash
npm run dev
```

### 4. Open [http://localhost:5173](http://localhost:5173) 🎉

---

## 🔌 API Reference

### User Routes — `/api/user`
| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/credits` | Fetch user credit balance |
| `GET` | `/projects` | Get all user projects |
| `GET` | `/projects/:id` | Get single project by ID |
| `GET` | `/publish/:id` | Toggle project visibility |

### Project Routes — `/api/projects`
| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/create` | Generate UGC image |
| `POST` | `/video` | Generate video from image |
| `GET` | `/published` | Get community gallery |
| `DELETE` | `/:id` | Delete a project |

---

## 💳 Credits System

| Action | Credits Cost |
|--------|-------------|
| 🖼️ Generate Image | 5 credits |
| 🎬 Generate Video | 10 credits |
| 🎁 New User Bonus | 20 credits |

---

## 🌍 Deployment

Deployed on **Vercel** with automatic CI/CD from GitHub:

| Service | URL |
|---------|-----|
| 🎨 Frontend | `https://your-app.vercel.app` |
| ⚙️ Backend | `https://agi-eta-beige.vercel.app` |

---

## 🤝 Contributing

Contributions are always welcome!

```bash
# 1. Fork the project
# 2. Create your feature branch
git checkout -b feature/AmazingFeature

# 3. Commit your changes
git commit -m "✨ Add AmazingFeature"

# 4. Push to the branch
git push origin feature/AmazingFeature

# 5. Open a Pull Request
```

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more information.

---

<div align="center">

## 👨‍💻 Author

**Muhammad Afzaal Hassan**

[![GitHub](https://img.shields.io/badge/GitHub-Afzaal162-181717?style=for-the-badge&logo=github)](https://github.com/Afzaal162)

---

### If you found this project useful, please consider giving it a ⭐

*Built with ❤️ — Powered by AI 🤖*

</div>
