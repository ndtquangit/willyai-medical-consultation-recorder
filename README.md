# Medical Consultation Recorder - Next.js Application

## Overview
A professional web application for medical professionals to record, store, and manage audio consultations with patients.

## Key Features
- 🎤 Browser-based audio recording
- 🗄️ Secure PostgreSQL storage
- 🔍 Filterable consultation history
- 🎧 Built-in audio playback
- 📱 Responsive, accessible UI

## Technology Stack
| Component        | Technology           |
|------------------|----------------------|
| Frontend         | Next.js 15 (App Router), TypeScript, Tailwind CSS |
| Backend          | Next.js API Routes   |
| Database         | PostgreSQL (BYTEA)   |
| ORM              | Drizzle ORM          |
| Audio Processing | Web Audio API        |

## Setup Instructions

### 1. Prerequisites
- Node.js v18+
- PostgreSQL 14+
- npm or yarn

### 2. Database Setup
```sql
-- Create database
CREATE DATABASE willyai;

-- Create user
CREATE USER postgres WITH PASSWORD 'securepassword';
GRANT ALL PRIVILEGES ON DATABASE willyai TO postgres;
```
### 3. Application Setup
```bash
# Clone repository
git clone https://github.com/ndtquangit/willyai-medical-consultation-recorder
cd willyai-medical-consultation-recorder

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
```

Edit .env.local with your database credentials:

```env
DATABASE_URL="postgresql://postgres:securepassword@localhost:5432/willyai"
```
### 4. Run Migrations
```bash
# Generate migrations from schema
npx drizzle-kit generate

# Apply migrations
npx drizzle-kit migrate
```
### 5. Development Server
```bash
npm run dev
```
The application will be available at http://localhost:3000/consultations

## Key Architectural Decisions
### 1. Audio Storage Approach
**Decision**: Store audio directly in PostgreSQL as BYTEA
Rationale:
- Simplifies backup/restore operations
- Keeps all consultation data in one place
- Good for moderate-sized audio files (typical consultations)

**Alternative Considered**: Store audio files in S3 and keep references in DB

### 2. ORM Selection
**Decision**: Drizzle ORM over Prisma/TypeORM
Rationale:
- Type-safe SQL queries
- Lightweight and performant
- Excellent TypeScript support
- Simple schema migrations

### 3. Audio Processing
**Decision**: Web Audio API
Rationale:
- Native browser support
- No additional dependencies
- Good enough quality for voice recordings
- Progressive enhancement possible

## Deployment
- To be added later

## Testing
- To be added later

## Troubleshooting
**Issue**: Audio recording fails

**Solution**: Check browser microphone permissions

**Issue**: Database connection errors

**Solution**: Verify DATABASE_URL in .env.local

## Contributing
Pull requests welcome. Please open an issue first to discuss major changes.
