# TUBES RPLL

Fullstack project with Express TypeORM backend, React Native mobile app, and Vue.js web application.

## Project Structure

```
tubes-rpll/
├── backend/          # Express + TypeORM API
├── mobile/           # React Native Android App
└── web/              # Vue.js Web Application
```

## Backend (Express + TypeORM)

### Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure your database credentials in .env
npm run dev
```

### Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Run production build

### Tech Stack
- Express.js
- TypeORM
- PostgreSQL
- TypeScript

## Mobile (React Native)

### Setup
```bash
cd mobile
npm install
```

### Run on Android
```bash
npm run android
```

### Tech Stack
- React Native
- TypeScript
- React Navigation
- Axios

## Web (Vue.js)

### Setup
```bash
cd web
npm install
npm run dev
```

### Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Tech Stack
- Vue 3
- TypeScript
- Vite
- Vue Router
- Pinia

## Getting Started

1. **Backend**: Set up PostgreSQL database and configure `.env` file
2. **Mobile**: Ensure Android SDK is installed and emulator is running
3. **Web**: Just run `npm install` and `npm run dev`

## License

ISC
