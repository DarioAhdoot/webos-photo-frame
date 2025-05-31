# VS Code Configuration for Immich WebOS Screensaver

This VS Code configuration provides everything you need for efficient development and debugging of the WebOS photo screensaver app.

## 🚀 Quick Start

### 1. Install Recommended Extensions
When you open the project, VS Code will prompt you to install recommended extensions. Click "Install All" for the best experience.

### 2. Start Development
Use the Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`):
- **Tasks: Run Task** → `dev` - Starts the development server
- **Debug: Start Debugging** → `Launch Chrome (Dev Server)` - Starts debugging

Or use the shortcuts:
- `Cmd+Shift+P` → "Tasks: Run Task" → "dev"
- `F5` - Start debugging (will automatically start dev server)

## 🛠 Available Tasks

Access via **Terminal** → **Run Task...** or `Cmd+Shift+P` → **Tasks: Run Task**:

### Development Tasks
- **`dev`** - Start development server with hot reload
- **`build`** - Build for production
- **`preview`** - Preview production build locally
- **`type-check`** - Run TypeScript type checking
- **`lint`** - Run ESLint

### WebOS Tasks  
- **`webos:build`** - Build and package for WebOS
- **`webos:install`** - Install on connected WebOS device
- **`webos:launch`** - Launch app on WebOS device

## 🐛 Debugging Options

### In VS Code (Recommended)
1. **F5** or **Debug** → **Start Debugging**
2. Choose **"Launch Chrome (Dev Server)"**
3. Sets breakpoints in your TypeScript/React code
4. Full source map support

### Debug Configurations Available:
- **Launch Chrome (Dev Server)** - Debug development build in Chrome
- **Launch Edge (Dev Server)** - Debug development build in Edge  
- **Attach to Chrome** - Attach to existing Chrome debug session
- **Debug Production Build** - Debug production build

### Debugging Features:
- ✅ Breakpoints in TypeScript/React code
- ✅ Step through code execution
- ✅ Inspect variables and state
- ✅ Console output in VS Code
- ✅ Hot reload during debugging
- ✅ Source maps for production debugging

## ⚙️ Automated Features

### Format on Save
- Prettier formatting on file save
- ESLint auto-fix on save
- Auto-organize imports

### IntelliSense & Autocomplete
- TypeScript IntelliSense
- Tailwind CSS class autocomplete
- Path autocompletion
- React/Hook snippets (see snippets section)

### Error Detection
- Real-time TypeScript errors
- ESLint warnings/errors highlighted
- Build errors in Problems panel

## 📝 Code Snippets

Type these prefixes and press `Tab`:

### React Components
- **`rfc`** - React functional component with TypeScript
- **`rhook`** - Custom React hook template

### State Management  
- **`zstore`** - Zustand store with persistence
- **`usequery`** - TanStack Query hook

### Photo Sources
- **`photosource`** - New photo source implementation template

## 🔧 Keyboard Shortcuts

### Development
- **`F5`** - Start debugging
- **`Ctrl+Shift+` `** - Open terminal
- **`Cmd+Shift+P`** - Command palette

### Navigation
- **`Cmd+P`** - Quick file open
- **`Cmd+Shift+O`** - Go to symbol in file
- **`Cmd+T`** - Go to symbol in workspace

### Debugging
- **`F9`** - Toggle breakpoint
- **`F10`** - Step over
- **`F11`** - Step into
- **`Shift+F11`** - Step out

## 📦 WebOS Development Workflow

### 1. Development & Testing
```bash
# Start development server
Tasks: Run Task → dev

# Debug in browser
F5 → Launch Chrome (Dev Server)
```

### 2. Build & Package
```bash
# Build for production
Tasks: Run Task → build

# Package for WebOS
Tasks: Run Task → webos:build
```

### 3. Device Installation
```bash
# Install on WebOS device (requires WebOS SDK)
Tasks: Run Task → webos:install

# Launch on device
Tasks: Run Task → webos:launch
```

## 🎯 Productivity Tips

### 1. Multiple Terminals
Use **Terminal** → **Split Terminal** to run multiple commands:
- Terminal 1: `npm run dev` (development server)
- Terminal 2: `npm run type-check --watch` (continuous type checking)

### 2. Debugging Immich Integration
1. Set breakpoints in `src/services/ImmichPhotoSource.ts`
2. Start debugging with F5
3. Configure Immich source in settings
4. Watch API calls and responses in real-time

### 3. Component Development
1. Use React DevTools extension (auto-installed)
2. Inspect component state and props
3. Use the snippets for rapid component creation

### 4. State Debugging
- Zustand stores are debuggable in React DevTools
- Set breakpoints in store actions
- Inspect state changes in real-time

## 🔍 Troubleshooting

### Debug Server Won't Start
- Check if port 3001 is available
- Kill existing Node processes: `pkill -f vite`
- Restart VS Code

### Breakpoints Not Working
- Ensure source maps are enabled (already configured)
- Check that you're debugging the development build
- Restart the debug session

### WebOS Tasks Failing
- Install WebOS SDK first
- Connect WebOS device to development mode
- Check device connection with `ares-device-info`

### TypeScript Errors
- Run **Tasks: Run Task** → **type-check** for full type checking
- Check VS Code TypeScript version (should use workspace version)

This configuration gives you a complete, professional development environment for your WebOS photo screensaver app! 🚀