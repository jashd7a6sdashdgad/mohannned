# Jaifer Study Assistant

A modern Next.js study assistant web application optimized for Grade 10 students at Jaifer bin Julanda School in Oman.

## Features

### 🎨 Modern Clean UI  
- Clean, minimal white theme with modern design aesthetics
- Professional interface optimized for focused study sessions
- Smooth animations and transitions powered by Framer Motion

### 💬 Intelligent Chat Interface
- Real-time chat with AI study assistant
- Support for both Arabic and English languages
- Course-specific context selection
- Smooth typing indicators and loading animations

### 📺 YouTube Integration
- Automatic YouTube link detection in responses
- Beautiful video cards with thumbnails
- Direct "Watch on YouTube" functionality
- Responsive video card layout

### 📎 File Upload Support
- Drag-and-drop file upload interface
- Support for multiple file types (images, PDFs, documents)
- File preview functionality
- Clean upload progress indicators

### 📱 Responsive Design
- Optimized for both mobile and desktop
- Touch-friendly interface for mobile devices
- Adaptive layouts that work across all screen sizes
- Custom scrollbars and mobile-optimized controls

### 🔗 N8N Integration
- Connected to n8n webhook for intelligent responses
- Contextual course information sent with queries
- Real-time message processing and response handling

## Tech Stack

- **Framework**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS with custom theme
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Build Tool**: Turbopack (for faster development)

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Configuration

The application is configured to work with the n8n webhook at:
```
https://n8n.1000273.xyz/webhook/MohannedRAG
```

### Supported Courses
- Mathematics
- Physics
- Chemistry
- Biology
- English
- Arabic
- Islamic Studies
- History
- Geography
- General Studies

## Usage

1. **Select a Course**: Use the dropdown in the header to select your subject
2. **Start Chatting**: Type your study questions in the input area
3. **File Attachments**: Click the paperclip icon to upload study materials
4. **YouTube Videos**: The assistant will automatically render YouTube links as interactive cards
5. **Keyboard Shortcuts**: Use Shift+Enter for new lines in messages

## Features in Detail

### Chat Interface
- Scrollable message history with timestamp display  
- User messages appear on the right (blue), assistant messages on the left (white surface)
- Real-time typing indicators while the assistant is responding
- Error handling for network issues with user-friendly messages

### File Upload Modal
- Modern drag-and-drop interface
- Support for images, PDFs, Word documents, and text files
- File preview for images
- Upload progress tracking
- File size display and management

### YouTube Card Renderer
- Automatic detection of YouTube URLs in messages
- High-quality thumbnail display
- Video title and channel information
- Direct link to open videos on YouTube
- Responsive card layout for multiple videos

### Responsive Design
- Mobile-first approach with progressive enhancement
- Adaptive text sizes and spacing
- Touch-optimized buttons and inputs
- Collapsible header on smaller screens
- Mobile-friendly file upload interface

## Development

### Scripts
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Project Structure
```
src/
├── app/
│   ├── globals.css      # Global styles and Tailwind imports
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Home page
└── components/
    ├── StudyAssistant.tsx   # Main chat interface
    ├── YouTubeCard.tsx      # YouTube video renderer
    └── FileUpload.tsx       # File upload modal
```

## Production Deployment

1. Build the application:
   ```bash
   npm run build
   ```
2. Start the production server:
   ```bash
   npm start
   ```

The application is optimized for deployment on Vercel, Netlify, or any Node.js hosting platform.

## Browser Support

- Modern browsers with ES6+ support
- Mobile Safari and Chrome
- Desktop Chrome, Firefox, Safari, Edge

Built for Jaifer bin Julanda School - Educational use.
