# DailyFlow - Smart Daily Planner & Productivity Manager

A production-ready mobile application built with React Native, Expo, and Node.js/Express backend.

## Project Overview

DailyFlow is a comprehensive productivity and planning application with the following modules:

### Core Features
- **Authentication**: Registration, login, password reset, profile management
- **Daily Planner**: Create, edit, delete tasks with time scheduling
- **Smart Calendar**: Daily, weekly, monthly, and agenda views
- **Meeting Manager**: Schedule meetings with conflict detection
- **Pomodoro Timer**: Focus sessions with break tracking
- **Habit Tracker**: Daily habit monitoring with streaks
- **Digital Clock**: Multi-timezone support with stopwatch and alarms
- **Calculator**: Basic and scientific operations with history
- **Notes Manager**: Create, organize, pin, and search notes
- **Analytics Dashboard**: Productivity metrics and statistics
- **Notifications**: Local reminders for tasks, meetings, and habits

## Technology Stack

### Frontend
- **Framework**: React Native + Expo
- **Language**: TypeScript
- **Navigation**: Expo Router
- **State Management**: Zustand
- **Data Fetching**: TanStack Query
- **Styling**: NativeWind + React Native StyleSheet
- **Animations**: React Native Reanimated
- **Storage**: AsyncStorage, Expo SecureStore
- **Notifications**: Expo Notifications

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT
- **Validation**: express-validator
- **Security**: bcryptjs, helmet, rate-limiting

## Project Structure

```
PROJECT/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.ts
│   │   │   ├── taskController.ts
│   │   │   ├── meetingController.ts
│   │   │   ├── habitController.ts
│   │   │   ├── focusSessionController.ts
│   │   │   └── noteController.ts
│   │   ├── models/
│   │   │   ├── User.ts
│   │   │   ├── Task.ts
│   │   │   ├── Meeting.ts
│   │   │   ├── Habit.ts
│   │   │   ├── HabitLog.ts
│   │   │   ├── FocusSession.ts
│   │   │   ├── Note.ts
│   │   │   ├── Alarm.ts
│   │   │   └── CalculatorHistory.ts
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── tasks.ts
│   │   │   ├── meetings.ts
│   │   │   ├── habits.ts
│   │   │   ├── focus.ts
│   │   │   └── notes.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts
│   │   │   └── errorHandler.ts
│   │   └── server.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── frontend/
│   ├── app/
│   │   ├── _layout.tsx (Root layout with auth/app routing)
│   │   ├── (auth)/
│   │   │   ├── _layout.tsx
│   │   │   ├── index.tsx (Login)
│   │   │   ├── register.tsx
│   │   │   └── forgot-password.tsx
│   │   └── (app)/
│   │       ├── _layout.tsx (Tab navigation)
│   │       ├── (home)/
│   │       │   ├── _layout.tsx
│   │       │   ├── index.tsx (Dashboard)
│   │       │   ├── add-task.tsx
│   │       │   ├── add-meeting.tsx
│   │       │   └── tools.tsx (Clock, Calculator)
│   │       ├── planner/
│   │       │   ├── _layout.tsx
│   │       │   ├── index.tsx (Daily Planner)
│   │       │   └── task-detail.tsx
│   │       ├── calendar/
│   │       │   ├── _layout.tsx
│   │       │   ├── index.tsx (Calendar views)
│   │       │   └── event-detail.tsx
│   │       ├── focus/
│   │       │   ├── _layout.tsx
│   │       │   ├── index.tsx (Pomodoro)
│   │       │   ├── habits.tsx
│   │       │   └── analytics.tsx
│   │       └── profile/
│   │           ├── _layout.tsx
│   │           ├── index.tsx (Profile)
│   │           ├── settings.tsx
│   │           └── notes.tsx
│   ├── src/
│   │   ├── store/
│   │   │   ├── authStore.ts
│   │   │   └── appStore.ts
│   │   ├── utils/
│   │   │   ├── api.ts
│   │   │   ├── storage.ts
│   │   │   ├── notifications.ts
│   │   │   └── helpers.ts
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── LoadingSpinner.tsx
│   │   │   │   └── EmptyState.tsx
│   │   │   ├── dashboard/
│   │   │   │   ├── GreetingCard.tsx
│   │   │   │   ├── TaskSummary.tsx
│   │   │   │   ├── QuickAdd.tsx
│   │   │   │   └── UpcomingMeetings.tsx
│   │   │   ├── planner/
│   │   │   │   ├── TaskList.tsx
│   │   │   │   ├── TaskForm.tsx
│   │   │   │   └── TimelineView.tsx
│   │   │   ├── calendar/
│   │   │   │   ├── CalendarView.tsx
│   │   │   │   ├── DatePicker.tsx
│   │   │   │   └── EventList.tsx
│   │   │   └── tools/
│   │   │       ├── Clock.tsx
│   │   │       ├── Calculator.tsx
│   │   │       ├── Timer.tsx
│   │   │       └── Alarm.tsx
│   │   └── hooks/
│   │       ├── useAuth.ts
│   │       ├── useTasks.ts
│   │       ├── useMeetings.ts
│   │       ├── useHabits.ts
│   │       └── useFocus.ts
│   ├── app.json
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   └── .env.example
│
└── README.md
```

## Setup Instructions

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
npm install
```

2. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

3. Configure environment variables:
- Set `MONGODB_URI` to your MongoDB instance
- Set `JWT_SECRET` to a strong secret key
- Configure other settings as needed

4. Start the server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
npm install
```

2. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

3. Update `EXPO_PUBLIC_API_URL` to your backend URL
   - Android emulator builds map `localhost` to `10.0.2.2`.
   - For a physical device, use the backend machine's reachable LAN address.

4. Start the development server:
```bash
npm start
```

### Run on Android

```bash
npm run android
```

### Build APK for Android

```bash
eas build --platform android
```

## API Documentation

### Authentication Endpoints

```
POST   /api/auth/register        - Register new user
POST   /api/auth/login           - Login user
POST   /api/auth/forgot-password - Send a one-time reset code by email
POST   /api/auth/reset-password  - Reset password with the emailed code
GET    /api/auth/me              - Get current user
PUT    /api/auth/profile         - Update user profile
POST   /api/auth/change-password - Change password
DELETE /api/auth/account         - Delete account and associated data
```

Password reset email requires valid `SMTP_HOST`, `SMTP_USER`, and `SMTP_PASS`
settings in `backend/.env`; `SMTP_FROM` is optional.

### Task Endpoints

```
GET    /api/tasks                - Get tasks (supports date/completed filters)
GET    /api/tasks/statistics     - Get task statistics
GET    /api/tasks/:id            - Get specific task
POST   /api/tasks                - Create task
PUT    /api/tasks/:id            - Update task
DELETE /api/tasks/:id            - Delete task
```

### Meeting Endpoints

```
GET    /api/meetings             - Get meetings
GET    /api/meetings/upcoming    - Get upcoming meetings
GET    /api/meetings/:id         - Get specific meeting
POST   /api/meetings             - Create meeting
PUT    /api/meetings/:id         - Update meeting
DELETE /api/meetings/:id         - Delete meeting
```

### Habit Endpoints

```
GET    /api/habits               - Get all habits
GET    /api/habits/:id           - Get specific habit
GET    /api/habits/:habitId/logs - Get habit logs
GET    /api/habits/:habitId/statistics - Get habit statistics
POST   /api/habits               - Create habit
POST   /api/habits/:habitId/logs - Log habit completion
PUT    /api/habits/:id           - Update habit
DELETE /api/habits/:id           - Delete habit
```

### Focus Session Endpoints

```
GET    /api/focus                - Get focus sessions
GET    /api/focus/statistics     - Get focus statistics
POST   /api/focus                - Create session
PUT    /api/focus/:id/end        - End session
DELETE /api/focus/:id            - Delete session
```

### Notes Endpoints

```
GET    /api/notes                - Get notes (supports search, category, pinned filters)
GET    /api/notes/:id            - Get specific note
POST   /api/notes                - Create note
PUT    /api/notes/:id            - Update note
DELETE /api/notes/:id            - Delete note
PUT    /api/notes/:id/toggle-pin - Toggle note pin status
```

## Database Schemas

### User
```typescript
{
  email: string (unique)
  password: string (hashed)
  firstName: string
  lastName: string
  profilePicture?: string
  timezone: string
  theme: 'light' | 'dark'
  notificationsEnabled: boolean
  createdAt: Date
  updatedAt: Date
}
```

### Task
```typescript
{
  userId: ObjectId
  title: string
  description?: string
  startTime: Date
  endTime: Date
  priority: 'low' | 'medium' | 'high'
  category: string
  completed: boolean
  completedAt?: Date
  recurring: 'none' | 'daily' | 'weekly' | 'monthly'
  reminderTime?: number
  createdAt: Date
  updatedAt: Date
}
```

### Meeting
```typescript
{
  userId: ObjectId
  title: string
  description?: string
  date: Date
  startTime: Date
  endTime: Date
  location?: string
  meetingLink?: string
  participants: string[]
  category: string
  reminder?: number
  recurring: 'none' | 'daily' | 'weekly' | 'monthly'
  createdAt: Date
  updatedAt: Date
}
```

### Habit
```typescript
{
  userId: ObjectId
  name: string
  description?: string
  frequency: 'daily' | 'weekly' | 'monthly'
  reminderTime?: string
  color: string
  startDate: Date
  endDate?: Date
  active: boolean
  createdAt: Date
  updatedAt: Date
}
```

### HabitLog
```typescript
{
  userId: ObjectId
  habitId: ObjectId
  date: Date
  completed: boolean
  note?: string
  createdAt: Date
  updatedAt: Date
}
```

### FocusSession
```typescript
{
  userId: ObjectId
  sessionType: 'focus' | 'shortBreak' | 'longBreak' | 'custom'
  duration: number
  actualDuration: number
  completed: boolean
  startTime: Date
  endTime?: Date
  notes?: string
  createdAt: Date
  updatedAt: Date
}
```

### Note
```typescript
{
  userId: ObjectId
  title: string
  content: string
  category: string
  pinned: boolean
  color?: string
  createdAt: Date
  updatedAt: Date
}
```

## Security Features

- Password hashing with bcryptjs
- JWT authentication with token expiry
- Secure token storage using Expo SecureStore
- Input validation and sanitization
- Rate limiting on API endpoints
- CORS configuration
- Helmet for HTTP headers security
- User data isolation (all queries filtered by userId)

## Offline Support

Offline persistence, queued writes, and automatic synchronization are not
implemented. Data operations require a reachable backend.

## Testing

### Backend Tests

```bash
npm test
npm test:watch
```

### Frontend Tests

```bash
npm test
npm test:watch
```

## Build & Deployment

### Backend Deployment

Deploy to:
- Railway
- Render
- AWS EC2
- DigitalOcean

1. Set environment variables on hosting platform
2. Push to git repository
3. Connect and deploy

### Frontend Android APK

1. Install EAS CLI:
```bash
npm install -g eas-cli
```

2. Configure EAS:
```bash
eas init
```

3. Build APK:
```bash
eas build --platform android --local
```

4. Test the built APK:
```bash
eas build:run --platform android
```

## Known Limitations

- The Android export check creates a JavaScript bundle; a native APK/Gradle build
  still requires an Android project and build toolchain.
- Expo Calendar integration, notes/alarm/calculator/analytics mobile screens, and
  task/meeting/habit reminder scheduling are not implemented in the mobile UI.
- Offline persistence and synchronization are not implemented.
- Password reset requires valid SMTP settings in `backend/.env`.
- No Jest test files are currently present; the test scripts exit with "No tests found".
- Notification delivery requires OS permission and may be restricted by Android
  battery/background policies.

## Contributing

Follow these conventions:
- Use TypeScript for type safety
- Follow existing code style
- Add tests for new features
- Document API changes

## License

MIT

## Contact

DailyFlow Team
