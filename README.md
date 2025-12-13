# DynoFX - Advanced Forex Trading Simulator

DynoFX is a comprehensive forex trading education and simulation platform. It combines real-time trading mechanics with gamified learning, allowing users to master the financial markets in a risk-free environment.

## 🚀 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with Custom "Modern Fintech" Theme
- **Database & Auth**: [Supabase](https://supabase.com/)
- **State Management**: React Hooks & Supabase Realtime
- **Icons**: Lucide React

## ✨ Features

- **Authentication**: Secure Login/Signup with robust password validation and Google OAuth support.
- **Modern UI/UX**: Premium "Dark Mode" aesthetic with glassmorphism and responsive design.
- **Mobile First**: Fully optimized for trading on the go.
- **Landing Page**: High-converting entry point with feature showcases.
- **Trading Simulator**: (In Progress) Real-time execution simulation.
- **Gamification**: (In Progress) XP, Levels, and Achievements.

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1.  **Clone the repository** (if applicable)
2.  **Navigate to the app directory**:
    ```bash
    cd app
    ```
3.  **Install dependencies**:
    ```bash
    npm install
    ```
4.  **Configure Environment Variables**:
    Create a `.env.local` file in the `app` root and add your Supabase credentials:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```
5.  **Run the development server**:
    ```bash
    npm run dev
    ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📂 Project Structure

- `app/`: Next.js App Router pages and layouts.
- `components/ui/`: Reusable UI components (Buttons, Inputs, etc.).
- `lib/`: Utility functions and Supabase client configuration.
- `public/`: Static assets (Logos, images).
- `scripts/`: Database validation and maintenance scripts.

## 📜 License

© 2024-2025 DynoFX. All rights reserved.
