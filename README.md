# ⚡ Typer - The Ultimate Speed Typing Platform

Typer is a high-performance typing challenge platform built for typists who want to compete, track their progress, and master the art of speed typing. From daily official challenges to advanced performance analytics, Typer provides a premium, competitive environment for the typing community.

![Typer Preview](https://github.com/user-attachments/assets/ae0e159e-1d54-4f9a-8a4a-765f0e9b25f4) <!-- Example placeholder for future screenshot -->

## 🚀 Key Features

### 🏁 Competitive Typing Engine
- **Real-time Feedback**: Instant visual cues for correct/incorrect characters and active word highlighting.
- **Precision Metrics**: Accurate calculation of Gross WPM, Net WPM (penalized for uncorrected errors), and character-level accuracy.
- **Focus System**: Prevents accidental typing when the engine is not active, ensuring fair starts.

### 📅 Daily & Official Challenges
- **The Daily Streak**: A new official challenge every 24 hours. Complete it to maintain and grow your streak.
- **Difficulty Tiers**:
    - **EASY**: Lowercase words, no punctuation.
    - **MEDIUM**: Mixed case with basic punctuation and numbers.
    - **HARD**: Random words with a high frequency of numbers and special characters.
    - **SUPER HARD**: Pure character-level chaos, combining random letters, symbols, and numbers.

### 📊 Performance Analytics
- **Personal Dashboard**: Track your average WPM, top speed, total challenges completed, and longest streak.
- **Dynamic Graphs**: Visualize your progress over time with interactive performance charts (Powered by Recharts).
- **Public Profiles**: Showcase your stats and competitive history to the world.

### 🌍 Global Leaderboards
- **Hall of Fame**: Rank against the fastest typists globally based on Top WPM.
- **Pagination support**: Browse through hundreds of competitors seamlessly.

---

## 🛠️ Technical Stack

- **Framework**: [Next.js 15+ (App Router)](https://nextjs.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) with native PostCSS support.
- **Database**: [SQLite](https://www.sqlite.org/) with [Prisma ORM](https://www.prisma.io/) for type-safe data access.
- **Authentication**: [NextAuth.js (Auth.js v5 Beta)](https://authjs.dev/) with support for GitHub and Google OAuth.
- **Animations**: [Framer Motion](https://www.framer.com/motion/) for smooth interaction and micro-animations.
- **Icons**: [Lucide React](https://lucide.dev/) for consistent, beautiful iconography.
- **Charting**: [Recharts](https://recharts.org/) for data-driven visualizations.
- **Theming**: [next-themes](https://github.com/pacocoursey/next-themes) for flawless Dark/Light mode support.

---

## 🏗️ Getting Started

### 1. Prerequisites
- **Node.js**: v18 or later
- **npm**: v9 or later (or yarn/pnpm)

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/your-username/typer.git
cd typer
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory and configure the following:
```env
DATABASE_URL="file:./dev.db"
AUTH_SECRET="your-generated-auth-secret"

# OAuth Providers (Optional for local dev, required for login)
AUTH_GITHUB_ID="your-client-id"
AUTH_GITHUB_SECRET="your-client-secret"
AUTH_GOOGLE_ID="your-client-id"
AUTH_GOOGLE_SECRET="your-client-secret"

# Cron Security
CRON_SECRET="your-cron-secret"
```

### 4. Database Initialization
Run the migrations and seed the database with initial challenges:
```bash
npx prisma db push
npx prisma db seed
```

### 5. Running Localy
Start the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to start typing.

---

## 🤖 Automation & Cron
The platform includes automated endpoints for maintaining the challenge rotation:
- `/api/cron/daily`: Rotates the official challenge and normalizes streak dates.
- `/api/cron/weekend`: Generates a batch of new challenges for the upcoming week.

---

## 📄 License
This project is **Proprietary / Source-Available**. All rights are reserved by the copyright holder. 
The source code is provided for viewing and evaluation purposes only. No reuse, modification, or commercial use is permitted without express written consent. 
See the [LICENSE](file:///Users/adityapranavbhuvanapalli/typer/LICENSE) file for more details.
