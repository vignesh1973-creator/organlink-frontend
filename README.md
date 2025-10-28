# OrganLink Frontend

Decentralized Organ Donation Platform - React + TypeScript + Vite Frontend

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Local Development

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and set `VITE_API_URL` to your backend URL

3. **Run development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

## 📦 Deployment on Vercel

### Step-by-Step Vercel Deployment

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/vignesh1973-creator/organlink-frontend.git
   git push -u origin main
   ```

2. **Deploy on Vercel**
   - Go to [https://vercel.com](https://vercel.com)
   - Click "Add New" → "Project"
   - Import your GitHub repository `organlink-frontend`
   - Configure project:
     - **Framework Preset**: Vite
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`
     - **Install Command**: `npm install`

3. **Set Environment Variables in Vercel**
   - In project settings → Environment Variables
   - Add:
     ```
     VITE_API_URL = https://your-backend-url.onrender.com
     ```
   - **Important**: No quotes needed in Vercel env vars

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live at `https://your-project.vercel.app`

### Auto-Deploy on Push

Once connected to GitHub, Vercel automatically:
- Deploys on every push to `main`
- Creates preview deployments for PRs
- Provides deployment previews

## 🔧 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `https://organlink-backend.onrender.com` |

## 🏗️ Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Shadcn/ui** - UI components
- **React Router** - Routing
- **Ethers.js** - Blockchain interaction

## 📱 Features

- **Multi-Portal System**
  - Hospital Portal
  - Admin Portal
  - Organization Portal
  - Public Landing Page

- **AI-Powered Matching**
  - Smart organ matching algorithm
  - Policy-based allocation
  - Real-time notifications

- **Blockchain Integration**
  - Immutable record keeping
  - Signature verification
  - IPFS document storage

## 🌐 API Integration

The frontend communicates with the backend API via REST endpoints:
- `/api/hospital/*` - Hospital operations
- `/api/admin/*` - Admin functions
- `/api/organization/*` - Organization management
- `/api/public/*` - Public data

## 📝 License

MIT License - see LICENSE file for details

## 👥 Contributors

- Vignesh - Developer

---

**Note**: Make sure your backend is deployed on Render before deploying the frontend on Vercel.
