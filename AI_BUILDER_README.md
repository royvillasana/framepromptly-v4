# AI Builder Feature Documentation

## Overview
The AI Builder allows users to generate complete UX workflows through natural language prompts. Instead of manually creating frameworks, stages, and tools, users can describe their workflow needs and the AI will generate a structured workflow that appears on the canvas.

## 🚀 Quick Start

### 1. Setup (Optional - Demo Mode Available)
To use real AI functionality, add your OpenAI API key to `.env.local`:
```bash
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

**Note:** The AI Builder works in demo mode without an API key, using mock responses for testing.

### 2. Using the AI Builder
1. Open the workflow canvas
2. Look for the **"AI Builder"** button in the bottom toolbar (with sparkle icon ✨)
3. Click the button to expand the AI input panel
4. Type your workflow request in natural language
5. Press Enter or click the send button
6. Review the generated workflow preview
7. Click "Accept" to add to canvas or "Reject" to discard

## 📝 Example Prompts

### Basic Examples
- "Create a Design Thinking flow for mobile app research"
- "Double Diamond process for website redesign" 
- "Google Sprint for new feature validation"
- "User research workflow with interviews and personas"

### Detailed Examples
- "Design Thinking workflow with Empathize and Define stages, including user interviews, persona creation, and journey mapping"
- "Lean UX process for MVP validation with assumption mapping and A/B testing"
- "Human-centered design approach for accessibility improvements with user testing and iterative design"

## 🎯 How It Works

### 1. AI Processing
- **Input**: Natural language description of workflow needs
- **AI Analysis**: Identifies suitable UX framework, relevant stages, and appropriate tools
- **Output**: Structured workflow with frameworks, stages, and tools

### 2. Workflow Generation
- **Framework Selection**: AI chooses most appropriate UX methodology
- **Stage Creation**: Generates 2-4 relevant stages with proper sequencing
- **Tool Integration**: Adds 1-3 tools per stage with realistic specifications
- **Smart Positioning**: Automatically positions nodes on canvas

### 3. Preview & Integration
- **Preview Panel**: Shows generated framework, stages, and tools before placement
- **Conversation History**: Keeps track of recent AI interactions
- **One-Click Integration**: Adds entire workflow to canvas with proper connections

## 🛠 Technical Details

### Architecture
- **AI Service Layer**: `src/services/ai-builder.ts` - Handles OpenAI integration
- **State Management**: `src/stores/ai-builder-store.ts` - Zustand store for AI state
- **UI Component**: `src/components/workflow/ai-builder-input.tsx` - Main interface
- **Canvas Integration**: Integrated into existing canvas toolbar

### Supported Frameworks
The AI Builder can generate workflows using these UX frameworks:
- Design Thinking (5 stages: Empathize, Define, Ideate, Prototype, Test)
- Double Diamond (4 stages: Discover, Define, Develop, Deliver)
- Google Design Sprint (5 stages: Map, Sketch, Decide, Prototype, Test)
- Human-Centered Design (3 stages: Inspiration, Ideation, Implementation)
- Jobs-to-Be-Done (3 stages: Job Mapping, Outcome ID, Solution Development)
- Lean UX (3 stages: Think, Make, Check)
- Agile UX (4 stages: Discovery, Alpha, Beta, Live)
- HEART Framework (5 stages: Happiness, Engagement, Adoption, Retention, Task Success)
- Hooked Model (4 stages: Trigger, Action, Variable Reward, Investment)

### Mock Service (Demo Mode)
When no API key is provided, the AI Builder uses a mock service that:
- Simulates realistic API delays (2 seconds)
- Generates Design Thinking workflows with Empathize and Define stages
- Includes sample tools like User Interviews and Persona Creation
- Provides feedback about the request in the reasoning field

## 🎨 UI Features

### Expandable Interface
- **Compact Button**: Subtle integration in bottom toolbar
- **Expanding Panel**: Slides up with full conversation interface
- **Responsive Design**: Adapts to different screen sizes

### Conversation Flow
- **Input Field**: Multi-line textarea with auto-resize
- **Sample Prompts**: Quick-start examples for new users
- **History Tracking**: Shows recent prompts and responses
- **Error Handling**: Clear error messages with retry options

### Workflow Preview
- **Framework Badge**: Shows selected UX methodology
- **Stage Summary**: Lists generated stages
- **Tool Count**: Displays number of tools created
- **Reasoning**: AI explanation of choices made
- **Accept/Reject**: Clear action buttons for workflow management

## 🔧 Configuration

### Environment Variables
```bash
# Required for real AI functionality
VITE_OPENAI_API_KEY=your_openai_api_key_here

# Existing Supabase configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Customization Options
- **API Provider**: Currently supports OpenAI, can be extended for other providers
- **Mock Responses**: Customizable demo workflows in `MockAIWorkflowBuilder`
- **UI Styling**: Uses existing design system with custom AI-specific styling
- **Positioning Logic**: Smart node placement using existing positioning utilities

## 🚨 Troubleshooting

### Common Issues

**AI Builder button not appearing**
- Check that the canvas toolbar is loaded
- Ensure no JavaScript errors in browser console

**"AI service not initialized" error**
- Verify API key is set correctly in `.env.local`
- Check browser console for configuration errors
- Try refreshing the page

**Generated workflow doesn't appear**
- Check browser console for errors
- Verify that you clicked "Accept" in the preview
- Ensure canvas has space for new nodes

**API errors with real OpenAI key**
- Verify API key is valid and has credits
- Check network connectivity
- Review OpenAI API status

### Debug Mode
The AI Builder includes console logging for debugging:
- Service initialization: `"Using mock AI service"` or API key status
- Workflow generation: Request/response logging
- Node creation: Canvas integration logging

## 🔮 Future Enhancements

### Planned Features
- **Workflow Refinement**: Modify existing workflows through follow-up prompts
- **Template Library**: Save and reuse AI-generated workflow patterns
- **Multi-provider Support**: Integration with Claude, Gemini, and other AI models
- **Advanced Positioning**: Smarter node arrangement and connection logic
- **Collaborative Features**: Share AI-generated workflows between team members

### Extensibility
The AI Builder architecture supports:
- Custom prompt templates
- Additional UX frameworks
- Custom node types
- Integration with external tools and services

## 📞 Support
For issues or questions about the AI Builder:
1. Check browser console for error messages
2. Review this documentation for common solutions
3. Test with demo mode first (without API key)
4. Verify existing workflow functionality works correctly