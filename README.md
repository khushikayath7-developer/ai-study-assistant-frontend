# AI Study Assistant — Mobile App

A React Native study assistant that supports account authentication, AI-powered chat, conversation history, and questions based on uploaded PDF or image notes.

## Features

- User registration and login
- AI-powered study chat
- English, Hindi, and Hinglish questions
- Conversation history and new chats
- PDF and image uploads
- Questions based on uploaded study notes
- Responsive layouts with safe-area and keyboard handling

## Requirements

Install the following tools before running the project:

- Node.js 22.11 or later
- npm
- JDK 17
- Android Studio and the Android SDK
- A running AI Study Assistant backend

## Installation

Clone the repository and install its dependencies:

```bash
git clone https://github.com/khushikayath7-developer/ai-study-assistant-frontend.git
cd ai-study-assistant-frontend
npm install
```

## Backend configuration

The backend URL is configured in `src/api/api.js`:

```javascript
export const BASE_URL = 'https://ai-study-assistant-backend-wzx9.onrender.com';
```

Use the appropriate URL when running a local backend:

- Android Emulator: `http://10.0.2.2:8000`
- Physical phone on the same Wi-Fi network: `http://YOUR_COMPUTER_IP:8000`
- Hosted backend: use the deployed HTTPS URL

## Run the Android app

Start Metro in the project root:

```bash
npm start
```

In a second terminal, run the application:

```bash
npm run android
```

## Build a release APK

On Windows, use the included build command. It avoids native build failures caused by long project paths and copies the completed APK back into the project:

```bash
npm run build:apk
```

The generated APK will be available at:

```text
android/app/build/outputs/apk/release/app-release.apk
```

The current release configuration uses the Android debug keystore and is suitable for testing. Configure a private production signing key before publishing the application to Google Play.

## Project structure

```text
AIStudyAssistant/
├── App.tsx
├── src/
│   ├── api/
│   ├── components/
│   ├── context/
│   ├── navigation/
│   └── screens/
├── android/
├── ios/
└── scripts/
```

## Troubleshooting

### Reset the Metro cache

```bash
npx react-native start --reset-cache
```

### The app cannot connect to the backend

- Confirm that the backend is running and accessible.
- Verify `BASE_URL` in `src/api/api.js`.
- Do not use `localhost` from a physical phone.
- Confirm that the phone and development computer are on the same network when using a local IP address.

### Android build requirements

Confirm that JDK 17, Android Studio, the Android SDK, and the `ANDROID_HOME` environment variable are configured correctly.
