# Frontend Setup (React Native CLI)

Tumhare paas already Node.js aur React Native CLI hai, to seedha steps follow karo:

## Step 1 — Naya RN CLI project banao
Apne `ai-study-assistant` folder ke bahar (ya kahi bhi) yeh chalao:
```bash
npx react-native init AIStudyAssistant
cd AIStudyAssistant
```

## Step 2 — Zaroori packages install karo
```bash
npm install axios @react-navigation/native @react-navigation/native-stack
npm install react-native-screens react-native-safe-area-context
npm install @react-native-async-storage/async-storage
npm install @react-native-documents/picker
```

Android ke liye extra (agar Android pe test kar rahe ho):
```bash
npx react-native run-android
```

## Step 3 — Iss folder (`frontend-src`) ki files copy karo
`frontend-src/App.js` aur `frontend-src/src/` — dono ko apne naye
`AIStudyAssistant` project me copy karo (App.js root me replace karo, src/ folder root me paste karo).

Final structure kuch aisa dikhega:
```
AIStudyAssistant/
├── App.js                <- replaced
├── src/
│   ├── api/api.js
│   ├── context/AuthContext.js
│   ├── navigation/AppNavigator.js
│   └── screens/
│       ├── LoginScreen.js
│       ├── RegisterScreen.js
│       ├── ChatScreen.js
│       └── UploadScreen.js
├── android/
├── ios/
└── ...
```

## Step 4 — Backend URL set karo
`src/api/api.js` file me `BASE_URL` check karo:
- Android Emulator use kar rahe ho → `http://10.0.2.2:8000` (already set)
- Real phone use kar rahe ho (same WiFi) → apne laptop ka IP daalo, e.g. `http://192.168.1.5:8000`

## Step 5 — Run karo
Pehle backend chalao (dusre terminal me), phir:
```bash
npx react-native run-android
```

Bas! App khulega -> Register karo -> Login karo -> AI se sawal pucho ya notes upload karo.

## Agar koi error aaye
- **Metro bundler issue**: `npx react-native start --reset-cache`
- **Android build fail**: Android Studio + JDK 17 install hona chahiye, `ANDROID_HOME` env variable set hona chahiye
- **Network error app me**: backend URL check karo (Step 4), aur backend `--host 0.0.0.0` se run ho raha ho
