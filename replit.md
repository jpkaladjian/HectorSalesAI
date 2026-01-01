# Hector Sales AI - Multi-Country CRM Platform

## Overview

Hector is a comprehensive AI-powered sales assistant and CRM platform built for ADS GROUP SECURITY. The application combines conversational AI (Claude), a complete CRM system, and an intelligent multi-country company enrichment system supporting 13 countries (France, Belgium, Switzerland, Luxembourg, UK, Germany, Spain, Italy + 5 French overseas territories).

**Key capabilities:**
- AI chat assistant with 4 operational modes (sales questions, meeting prep, training, objection handling)
- Full CRM with prospects, opportunities, and sales pipeline management
- Multi-country company enrichment with intelligent provider fallback (Pappers → OpenCorporates → WebSearch)
- GPS tracking for field sales teams with real-time supervision
- Twilio-integrated dynamic phoning with AI transcription
- LinkedIn prospection module with Chrome extension
- Batch CSV import and automated nightly enrichment

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state, React hooks for local state
- **UI Components**: Radix UI primitives with Tailwind CSS styling
- **Build Tool**: Vite with Replit-specific plugins
- **PWA Support**: Service workers for offline functionality and GPS position queuing

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ESM modules
- **API Design**: RESTful endpoints under `/api/*`
- **Authentication**: Session-based auth with Passport.js, JWT tokens for API access
- **AI Integration**: Anthropic Claude SDK for conversational AI and sales assistance
- **Python Service**: FastAPI service on port 5001 for specialized enrichment tasks (Pappers integration)

### Data Storage
- **Database**: PostgreSQL via Neon Serverless
- **ORM**: Drizzle ORM with type-safe schema definitions
- **Schema Location**: `shared/schema.ts` and related schema files
- **Multi-tenancy**: Row-Level Security (RLS) for entity isolation (France/Luxembourg/Belgium)
- **Migrations**: Drizzle Kit for schema migrations

### Enrichment System Architecture
- **Orchestrator Pattern**: Centralized enrichment orchestrator with provider chain
- **Provider Priority**: 
  1. Pappers (France + DOM-TOM) - via Python service
  2. OpenCorporates (8 European countries)
  3. WebSearch/Brave (Switzerland + universal fallback)
- **Caching**: 30-day cache for API responses
- **Rate Limiting**: 10 requests/minute per IP

### Key Design Patterns
- **Cascade Fallback**: When primary enrichment provider fails, system automatically falls back to secondary providers
- **Entity Isolation**: Multi-entity support with data separation between France, Luxembourg, and Belgium operations
- **CRON Automation**: node-cron for scheduled tasks (weekly reports, daily stats, cleanup jobs)
- **Service Layer**: Business logic encapsulated in service classes under `server/services/`

## External Dependencies

### AI & Machine Learning
- **Anthropic Claude**: Primary AI for chat, sales assistance, and content generation
- **Speech Recognition**: Browser-native Web Speech API

### Communication Services
- **Twilio**: Phone calls, SMS, call recording and transcription
- **Resend**: Transactional email delivery for password resets and notifications

### Data Enrichment APIs
- **Pappers API**: French company data (SIREN/SIRET validation, company details)
- **OpenCorporates**: European company registry data
- **Brave Search API**: Web search fallback for enrichment

### Database & Infrastructure
- **Neon PostgreSQL**: Serverless PostgreSQL database
- **Replit**: Hosting platform with integrated secrets management

### Frontend Libraries
- **Leaflet**: GPS tracking maps and visualization
- **Recharts**: Analytics dashboards and charts
- **PapaParse**: CSV file parsing for batch imports

### Development & Testing
- **Vitest**: Unit and integration testing (91+ tests)
- **Playwright**: End-to-end testing
- **TypeScript**: Full type safety across frontend and backend