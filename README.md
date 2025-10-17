# 📱 Todo Manager - React Native App

A professional, performant, and feature-rich todo management application built with React Native, TypeScript, and modern best practices.

## ✨ Features

### Core Functionality
- ✅ **Add, Edit, Delete Todos** - Full CRUD operations
- ✅ **Complete/Uncomplete** - Toggle task completion status
- ✅ **Persistent Storage** - Data saved locally with AsyncStorage
- ✅ **Real-time Search** - Filter todos by title or description
- ✅ **Sort Options** - Sort by name, date, or completion status
- ✅ **Filter Options** - View all, active, or completed todos

### Enhanced Features
- 🎨 **Dark/Light Mode** - System-aware theme with manual toggle
- 👆 **Swipe to Delete** - Intuitive gesture-based deletion
- 🧹 **Clear Completed** - Bulk delete completed tasks
- 📊 **Statistics** - Track active and completed todo counts
- 🔄 **Pull to Refresh** - Refresh todo list
- 📱 **Responsive Design** - Works on all screen sizes

## 🛠️ Tech Stack

| Technology | Purpose | Why? |
|------------|---------|------|
| **React Native** | Framework | Cross-platform mobile development |
| **TypeScript** | Language | Type safety and better DX |
| **Expo** | Toolchain | Faster development and easy builds |
| **Zustand** | State Management | Lightweight, performant, minimal boilerplate |
| **FlashList** | List Rendering | 54% better FPS than FlatList |
| **NativeWind** | Styling | Tailwind CSS for React Native |
| **React Native Gesture Handler** | Gestures | Smooth swipe-to-delete |
| **React Native Reanimated** | Animations | 60 FPS native animations |
| **AsyncStorage** | Persistence | Local data storage |
| **EAS Build** | Deployment | Professional build pipeline |

## 📁 Project Structure

src/
├── components/
│ ├── common/ # Reusable UI components
│ │ ├── Button.tsx
│ │ ├── Input.tsx
│ │ └── Modal.tsx
│ └── todo/ # Todo-specific components
│ ├── TodoItem.tsx
│ ├── TodoForm.tsx
│ ├── SearchBar.tsx
│ └── EmptyState.tsx
├── screens/
│ └── TodoListScreen.tsx
├── store/ # Zustand state management
│ ├── todoStore.ts
│ └── themeStore.ts
├── types/ # TypeScript definitions
│ └── todo.types.ts
├── utils/ # Helper functions
│ ├── constants.ts
│ └── dateHelpers.ts
└── services/ # External services
└── storageService.ts


## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn
- Expo Go app (for testing on physical device)
- iOS Simulator or Android Emulator (for local testing)

### Installation

1. **Clone the repository**

2. **Install dependencies**

3. **Start the development server**

npx expo start

4. **Run on device/emulator**
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app for physical device

##  Building for Production

### Using EAS Build

1. **Install EAS CLI**
npm install -g eas-cli

2. **Login to Expo**
eas login

3. **Configure build**
eas build:configure

4. **Build for Android**
eas build --platform android --profile production

5. **Build for iOS**
eas build --platform ios --profile production

### Build Profiles
- `development` - Debug builds with developer tools
- `preview` - Internal testing builds (APK for Android)
- `production` - Production-ready builds for store submission

## 🎯 Performance Optimizations

### FlashList Implementation
- **estimatedItemSize**: 120px - Optimized for average todo item height
- **getItemType**: Separates completed vs active todos for better recycling
- **React.memo**: Prevents unnecessary re-renders of TodoItem components
- **useCallback**: Memoizes render functions and event handlers

### Code Quality
- ✅ TypeScript strict mode enabled
- ✅ ESLint + Prettier configured
- ✅ Zero `any` types used
- ✅ Comprehensive component documentation
- ✅ Single Responsibility Principle throughout

## 🎨 Design Philosophy

### UX Principles
- **Immediate Feedback** - All actions provide visual feedback
- **Forgiving UI** - Confirmation dialogs for destructive actions
- **Accessible** - Proper touch targets (48x48 minimum)
- **Consistent** - Unified spacing, colors, and typography

## 📊 Architecture Decisions

### State Management - Zustand
**Why not Redux?**
- Zustand is 75% smaller bundle size
- Less boilerplate (no actions, reducers, etc.)
- Built-in persistence middleware
- Better TypeScript inference

### List Rendering - FlashList
**Why not FlatList?**
- 54% better FPS performance
- Significantly lower memory usage
- Better handling of heterogeneous list items
- Industry standard for high-performance lists

### Styling - NativeWind
**Why not Styled Components?**
- Familiar Tailwind syntax
- Better performance (compiled at build time)
- Smaller bundle size
- Easier to maintain and refactor

## 🧪 Testing

### Manual Testing Checklist
- [ ] Add todo with all fields
- [ ] Edit existing todo
- [ ] Delete todo via swipe
- [ ] Toggle completion status
- [ ] Search todos
- [ ] Sort by name, date, status
- [ ] Filter by all, active, completed
- [ ] Clear completed todos
- [ ] Toggle dark/light mode
- [ ] Pull to refresh
- [ ] App persists data after restart
- [ ] Works on different screen sizes

## 📝 Evaluation Criteria Coverage

| Criteria | Implementation | Status |
|----------|---------------|--------|
| Code Structure | Modular, clean, logical organization | ✅ |
| TypeScript Usage | Strict mode, proper typing, no `any` | ✅ |
| State Management | Zustand with persistence | ✅ |
| Persistence | AsyncStorage via Zustand middleware | ✅ |
| Performance | FlashList, memoization, callbacks | ✅ |
| UI/UX | Monkeytype-inspired, responsive | ✅ |
| Build Readiness | Complete EAS configuration | ✅ |
| Optional Features | All 5 implemented | ✅ |

## 🎓 Learning Outcomes

### Technical Skills Demonstrated
- Advanced React Native patterns
- TypeScript strict mode development
- Performance optimization techniques
- Modern state management
- Professional git workflow
- Production build configuration

### Best Practices Applied
- Component composition
- Single Responsibility Principle
- DRY (Don't Repeat Yourself)
- Separation of concerns
- Proper error handling
- Comprehensive documentation

## 🚧 Known Limitations

- Offline-first: No server sync (by design for take-home)
- No user authentication (single user app)
- No todo categories/tags (could be future enhancement)
- No recurring todos (could be added)

## 🔮 Future Enhancements

- [ ] Cloud sync with backend API
- [ ] User authentication
- [ ] Todo categories/tags
- [ ] Priority levels
- [ ] Recurring todos
- [ ] Reminders/notifications
- [ ] Data export/import

## 👨‍💻 Developer

**Mohamed Jaasim**  
📧 mjaasimdev@gmail.com  

**Built with ❤️ using React Native and TypeScript**

