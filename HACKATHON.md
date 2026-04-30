# GradX - TenzorX 2026 National AI Hackathon

## Project Overview

**GradX** is an AI-powered student engagement platform designed specifically for Indian students planning higher education - either study abroad or domestic programs. The platform's ultimate goal is to funnel students toward education loan products through our strategic partnership with **Poonawalla Fincorp**.

## Problem Statement

Indian students face significant challenges when planning for higher education:
- Complicated university selection process across multiple countries
- Lack of personalized guidance for applications
- Uncertainty about admission chances
- Financial planning gaps
- Limited access to effective SOP/essay assistance
- Complex timeline management for multiple applications

## Solution

GradX addresses these challenges through AI-powered, personalized features:

### Core Features

1. **AI Mentor Shikha** - Conversational AI guide powered by Groq/Llama 3.3
2. **Career Navigator** - 5-step wizard for university matching with match scores
3. **ROI Calculator** - Financial projections with visual charts
4. **Admit Predictor** - AI-powered admission chance predictions
5. **Readiness Score** - Comprehensive profile readiness assessment
6. **SOP Co-Pilot** - AI-assisted statement of purpose generation
7. **Application Timeline** - Phase-wise task management
8. **Education Loan** - Poonawalla Fincorp loan eligibility & application
9. **Growth Loop** - Gamified task management with XP & streaks

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, Groq SDK
- **Database**: Supabase (Auth + PostgreSQL)
- **AI**: Groq API with Llama 3.3
- **Charts**: Recharts
- **Animations**: Framer Motion

## Key Innovations

1. **Poonawalla Fincorp Integration** - Seamless education loan funnel
2. **Gamification** - XP, badges, streaks, levels
3. **DigiLocker Mock** - Document verification simulation
4. **WhatsApp Reminders** - Notification mock system
5. **Multi-Modal SOP** - Generate, improve, feedback modes
6. **Circular Gauges** - Visual readiness/admission indicators

## Design System

### Color Palette
- Primary: Purple (#7C3AED)
- Secondary: Indigo (#4F46E5)
- Accent: Emerald (#10B981)
- Background: Dark gradient (slate-900 → purple-950)

### Mobile-First Responsive Design
- Fully responsive across all devices
- Tailwind CSS for all styling
- No external images required

## Deployment

### Environment Variables Required
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GROQ_API_KEY=your_groq_api_key
```

### Vercel Configuration
- Framework: Next.js
- Region: blr1 (Bangalore)
- Build Command: npm run build

## Project Structure

```
src/
├── app/
│   ├── (auth)/           # Login/Signup
│   ├── (dashboard)/     # Protected dashboard routes
│   │   ├── career-navigator/
│   │   ├── admit-predictor/
│   │   ├── roi-calculator/
│   │   ├── readiness-score/
│   │   ├── sop-copilot/
│   │   ├── timeline/
│   │   ├── loan/
│   │   ├── mentor/
│   │   ├── profile/
│   │   ├── growth-loop/
│   │   └── demo/
│   └── api/             # API routes
├── components/
│   ├── shared/          # Reusable components
│   └── layout/          # Navbar, etc.
└── lib/
    ├── supabase.ts      # Supabase client
    ├── gamification.ts  # Badge/streak system
    └── types.ts         # TypeScript interfaces
```

## Results

- Complete student engagement platform
- 13+ pages with full functionality
- 9 AI-powered API endpoints
- Supabase authentication + database
- Mobile-responsive design
- Production-ready deployment config

## Team

- Developed for TenzorX 2026 National AI Hackathon
- Strategic partnership: Poonawalla Fincorp

## Hackathon Submission

**Submission Date**: April 14, 2026
**Version**: 1.0.0
**Status**: Production Ready