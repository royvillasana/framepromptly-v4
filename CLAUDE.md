# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FramePromptly is a UX framework workflow builder application built with React, TypeScript, and Supabase. It allows users to create visual workflows using various UX methodologies (Design Thinking, Double Diamond, etc.) and generate AI prompts based on their workflow configurations.

## Commands

### Development
- `npm run dev` - Start development server on port 8080
- `npm run build` - Build for production
- `npm run build:dev` - Build in development mode
- `npm run preview` - Preview production build

### Code Quality
- `npm run lint` - Run ESLint to check code quality

## Architecture

### Core Technologies
- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with custom theme variables
- **State Management**: Zustand stores for global state
- **Backend**: Supabase (PostgreSQL database with Row Level Security)
- **Workflow Visualization**: React Flow (@xyflow/react) for canvas-based node editing

### Project Structure

#### State Management (`src/stores/`)
- `workflow-store.ts` - Manages UX frameworks, stages, tools, and canvas nodes/edges
- `project-store.ts` - Handles project CRUD operations and canvas data persistence
- `prompt-store.ts` - Manages AI prompt generation and execution
- `knowledge-store.ts` - Handles knowledge base content for projects

#### Key Components (`src/components/`)
- `workflow/workflow-canvas.tsx` - Main React Flow canvas with node interactions
- `workflow/` - Node components (FrameworkNode, StageNode, ToolNode, PromptNode)
- `project/` - Project management dialogs and lists
- `knowledge/` - Knowledge base panel for document/content management

#### Pages (`src/pages/`)
- `Index.tsx` - Landing page with authentication check
- `Workflow.tsx` - Main workflow builder interface with project selection
- `Auth.tsx` - Authentication page
- `NotFound.tsx` - 404 page

#### Database Integration (`src/integrations/supabase/`)
- Row Level Security enabled for multi-tenant data isolation
- Tables: projects, prompts, knowledge_base
- Real-time subscriptions for collaborative features

### UX Framework System

The application includes 9 built-in UX frameworks with predefined stages and tools:
- Design Thinking (5 stages: Empathize, Define, Ideate, Prototype, Test)
- Double Diamond
- Google Design Sprint
- Human-Centered Design
- Jobs-to-Be-Done
- Lean UX
- Agile UX
- HEART Framework
- Hooked Model

Each framework contains:
- Stages with specific characteristics (duration, participants, deliverables)
- Tools with detailed metadata (effort, expertise, resources, output)
- Visual workflow representation through React Flow nodes

### Canvas Auto-Save System

- Node position changes auto-save to localStorage and Supabase
- Debounced saving (600ms) prevents excessive database calls
- Project-specific canvas data stored in `projects.canvas_data` JSON field

### Prompt Generation Workflow

1. User configures workflow by adding framework → stages → tools
2. Tools generate contextual AI prompts based on UX methodology
3. Variables in prompts can be customized per execution
4. Prompt history and outputs stored for reference

## Important Development Notes

### TypeScript Configuration
- Base URL set to "." with "@/*" path mapping to "./src/*"
- Relaxed type checking: noImplicitAny, strictNullChecks disabled
- Supports React JSX compilation

### Supabase Functions
Located in `supabase/functions/`:
- `generate-ai-prompt/` - AI prompt generation endpoint
- `process-document/` - Document processing for knowledge base
- `process-image/` - Image processing for knowledge base

### Authentication
- Supabase Auth integration with `useAuth` hook
- Protected routes redirect to `/auth` if not authenticated
- Row Level Security policies ensure data isolation

### Node Positioning System
- Custom `node-positioning.ts` utility for auto-arranging workflow nodes
- React Flow handles dragging, zooming, and connections
- Marquee selection tool for multi-node operations