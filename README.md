# Code Gym

A comprehensive coding education platform with AI-powered mentoring, featuring four unique learning modes to master programming skills.

**Live Demo**: [https://code-gym-seven.vercel.app](https://code-gym-seven.vercel.app)

## Features

### Learning Modes

- **Mastery Mode**: LeetCode-style coding challenges with real-time code execution
- **Build Mode**: Guided project building with milestone-based progression
- **Hunt Mode**: Bug hunting exercises with daily challenges
- **Academy Mode**: Structured 7-phase learning paths

### Core Features

- Real-time code execution in multiple languages (Python, JavaScript, TypeScript)
- Monaco Editor with syntax highlighting and autocomplete
- AI-powered mentor for hints and code review
- XP & leveling system with achievements
- Daily streaks and progress tracking
- Dark/light theme support

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| [Next.js](https://nextjs.org/) | 16.1.3 | React framework with App Router |
| [React](https://react.dev/) | 19.2.3 | UI library |
| [TypeScript](https://www.typescriptlang.org/) | 5.x | Type safety |
| [Tailwind CSS](https://tailwindcss.com/) | 4.x | Utility-first styling |
| [Monaco Editor](https://microsoft.github.io/monaco-editor/) | 4.7.0 | Code editor |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers) | 16.1.3 | Serverless API endpoints |
| [Prisma](https://www.prisma.io/) | 7.2.0 | ORM & database toolkit |
| [NextAuth.js](https://next-auth.js.org/) | 5.0.0-beta | Authentication |

### Database & Infrastructure
| Technology | Purpose |
|------------|---------|
| [Neon](https://neon.tech/) | Serverless PostgreSQL database |
| [Vercel](https://vercel.com/) | Deployment & hosting |
| [Piston API](https://github.com/engineer-man/piston) | Sandboxed code execution |

### Development Tools
| Tool | Purpose |
|------|---------|
| [ESLint](https://eslint.org/) | Code linting |
| [Prettier](https://prettier.io/) | Code formatting |
| [GitHub Actions](https://github.com/features/actions) | CI/CD pipeline |

### Libraries & Utilities
| Library | Purpose |
|---------|---------|
| [React Hook Form](https://react-hook-form.com/) | Form handling |
| [Zod](https://zod.dev/) | Schema validation |
| [bcryptjs](https://github.com/dcodeIO/bcrypt.js) | Password hashing |
| [clsx](https://github.com/lukeed/clsx) | Conditional classnames |
| [tailwind-merge](https://github.com/dcastil/tailwind-merge) | Tailwind class merging |

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- PostgreSQL database (or use Neon free tier)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/GalSened/code-gym.git
cd code-gym
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Configure your `.env` file:
```env
DATABASE_URL="your-postgresql-connection-string"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
```

5. Push database schema:
```bash
npx prisma db push
```

6. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Protected dashboard pages
│   └── api/               # API routes
├── components/
│   ├── ui/                # Base UI components
│   ├── forms/             # Form components
│   ├── layout/            # Layout components
│   └── features/          # Feature-specific components
├── lib/
│   ├── auth/              # Authentication config
│   ├── db/                # Database client
│   ├── services/          # External services (Piston)
│   ├── validations/       # Zod schemas
│   └── utils/             # Utility functions
└── types/                 # TypeScript types
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run db:push` | Push schema to database |
| `npm run db:studio` | Open Prisma Studio |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `NEXTAUTH_URL` | Yes | App URL for NextAuth |
| `NEXTAUTH_SECRET` | Yes | Secret for NextAuth JWT |
| `GOOGLE_CLIENT_ID` | No | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | No | Google OAuth secret |
| `GITHUB_CLIENT_ID` | No | GitHub OAuth client ID |
| `GITHUB_CLIENT_SECRET` | No | GitHub OAuth secret |
| `GROQ_API_KEY` | No | Groq API key for AI mentor |
| `PISTON_API_URL` | No | Piston API URL (default provided) |

## Deployment

The app is configured for automatic deployment to Vercel via GitHub Actions:

- **Push to `main`**: Deploys to production
- **Pull requests**: Creates preview deployments

### Manual Deployment

```bash
npx vercel --prod
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgments

- [Piston](https://github.com/engineer-man/piston) for code execution
- [Neon](https://neon.tech/) for serverless PostgreSQL
- [Vercel](https://vercel.com/) for hosting
