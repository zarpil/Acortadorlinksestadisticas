# Kutt. SaaS - Modern Link Shortener

A high-performance, open-source link management and shortening platform built with modern web technologies. Designed for speed, security, and a premium user experience.

![Dashboard Preview](https://via.placeholder.com/1200x600?text=Kutt.+SaaS+Dashboard)

## 🚀 Key Features

- **Blazing Fast Redirects**: High-performance URL resolution.
- **Advanced Analytics**: Track clicks, geographic location (Country/City), device types, OS, and referrers.
- **Custom Slugs & Expiration**: Create memorable custom links and set individual TTL (Time-To-Live) expirations.
- **UTM Tracking**: Built-in support for marketing campaigns.
- **Premium UI/UX**: Glassmorphism design, smooth animations, and automatic light/dark mode support.
- **Role-Based Access**: Multi-tier architecture (Free, Pro, Enterprise) with an integrated Admin Panel.

## 🛠️ Technology Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Server Actions)
- **Database ORM**: [Prisma](https://www.prisma.io/)
- **Authentication**: [NextAuth.js v5](https://next-auth.js.org/) (Auth.js)
- **UI & Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/)
- **Charts**: [Recharts](https://recharts.org/)

## 🏗️ Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL Database

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/zarpil/Acortadorlinksestadisticas.git
   cd Acortadorlinksestadisticas
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy the example environment file and update the variables:
   ```bash
   cp .env.example .env
   ```
   *Make sure to set your `DATABASE_URL` and generate a `NEXTAUTH_SECRET`.*

4. **Initialize the Database:**
   Apply migrations to your PostgreSQL database:
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Run the Development Server:**
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🔒 Security Features

- **IDOR Prevention**: Server Actions meticulously verify session ownership before data mutation.
- **CSRF Protection**: Handled natively by Next.js Server Actions.
- **SQL Injection Prevention**: Parameterized queries enforced via Prisma ORM.

## 🚀 Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new).

When deploying, ensure you configure the following Environment Variables in your Vercel project settings:
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
