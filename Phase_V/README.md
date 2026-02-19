# Phase V: Web-based Frontend

A modern, reactive React frontend for the Urdu Text Generator with streaming text display.

## Features

- ✨ Beautiful, responsive UI with Urdu support
- 🌊 Streaming text generation (ChatGPT-like experience)
- 🎨 Gradient design with Noto Nastaliq Urdu font
- ⚡ Real-time parameter control (temperature, max length)
- 📱 Mobile-friendly responsive design
- 🎯 RTL (Right-to-Left) layout for Urdu

## Project Structure

```
Phase_V/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── TextGenerator.jsx    # Main text generation component
│   │   ├── App.jsx                   # Root component
│   │   ├── main.jsx                  # Entry point
│   │   └── index.css                 # Styles
│   ├── public/
│   ├── index.html                    # HTML template
│   ├── package.json                  # Dependencies
│   └── vite.config.js               # Vite configuration
└── README.md                         # This file
```

## Prerequisites

- Node.js 16+ and npm
- FastAPI backend running (from Phase_IV)

## Installation & Setup

### Step 1: Install Dependencies

```powershell
cd Phase_V/frontend
npm install
```

### Step 2: Start the FastAPI Backend

In a **separate terminal**, start the API from Phase_IV:

```powershell
cd ../Phase_IV
uvicorn api.main:app --reload --host 0.0.0.0 --port 8000
```

### Step 3: Start the Frontend

```powershell
cd Phase_V/frontend
npm run dev
```

The app will open at: **http://localhost:3000**

## Usage

1. **Enter Urdu Text** (optional): Type an Urdu starting phrase in the input field
2. **Adjust Parameters**:
   - **Max Length**: 50-500 tokens (how long the generated text will be)
   - **Temperature**: 0.1-2.0 (controls randomness - lower is more predictable)
3. **Generate**: Click the button or press `Ctrl + Enter`
4. **Watch**: Text will stream in word-by-word like ChatGPT!

## Features Explained

### Streaming Text Display
- Generated text appears word-by-word with a typing cursor
- Creates a ChatGPT-like streaming experience
- Smooth animation with 100ms delay between words

### Temperature Control
- **0.1 - 0.5**: Very predictable, coherent text
- **0.6 - 1.0**: Balanced creativity (recommended)
- **1.1 - 2.0**: More random and creative

### Keyboard Shortcuts
- `Ctrl + Enter`: Generate text
- Clear button clears the output

## Tech Stack

- **React 18**: Modern React with hooks
- **Vite**: Fast build tool and dev server
- **Axios**: HTTP client for API calls
- **Noto Nastaliq Urdu**: Beautiful Urdu font from Google Fonts
- **CSS3**: Custom animations and gradients

## API Integration

The frontend connects to the FastAPI backend via proxy:
- Development: `http://localhost:8000` (proxied through Vite)
- Endpoints used:
  - `POST /generate`: Generate text

## Development

### Run in Development Mode
```powershell
npm run dev
```

### Build for Production
```powershell
npm run build
```

### Preview Production Build
```powershell
npm run preview
```

## Customization

### Change Colors
Edit the gradient in `src/index.css`:
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Adjust Streaming Speed
In `TextGenerator.jsx`, change the interval:
```javascript
}, 100) // milliseconds between words
```

### Change Default Values
In `TextGenerator.jsx`:
```javascript
const [maxLength, setMaxLength] = useState(200)  // Default length
const [temperature, setTemperature] = useState(0.8)  // Default temp
```

## Troubleshooting

### "سرور سے رابطہ نہیں ہو سکا" (Cannot connect to server)
- Make sure the FastAPI backend is running on port 8000
- Check: `http://localhost:8000/health`

### Urdu text not displaying properly
- The page uses RTL (right-to-left) layout
- Font: Noto Nastaliq Urdu loads from Google Fonts
- Check internet connection if font doesn't load

### Port already in use
```powershell
# Change port in vite.config.js
server: {
  port: 3001  // Use different port
}
```

## Screenshots

The UI includes:
- 🎨 Beautiful gradient header
- 📝 Urdu text input field
- 🎚️ Interactive sliders for parameters
- 📊 Real-time streaming text display
- 💫 Typing cursor animation
- 🧹 Clear button to reset

## Running Both Services

**Terminal 1 (Backend)**:
```powershell
cd Phase_IV
uvicorn api.main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 (Frontend)**:
```powershell
cd Phase_V/frontend
npm run dev
```

Then visit: **http://localhost:3000**

## Browser Support

- ✅ Chrome/Edge (Recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers

---

Enjoy generating beautiful Urdu text! 🌙
