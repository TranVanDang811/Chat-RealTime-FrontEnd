# 💬 Chat Realtime Frontend (React + Vite + Redux Toolkit + TailwindCSS)

[![React](https://img.shields.io/badge/React-18-blue.svg?logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-Fast%20Bundler-646CFF.svg?logo=vite)](https://vitejs.dev/)
[![Redux Toolkit](https://img.shields.io/badge/Redux%20Toolkit-State%20Management-764ABC.svg?logo=redux)](https://redux-toolkit.js.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-Modern%20UI-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com/)
[![WebSocket](https://img.shields.io/badge/WebSocket-STOMP.js-blueviolet.svg)](https://stomp-js.github.io/)
[![Docker](https://img.shields.io/badge/Docker-Nginx%20Ready-2496ED.svg?logo=docker)](https://www.docker.com/)

A modern, responsive, and feature-rich web frontend client for the **Realtime Chat Application**, engineered with **React 18**, **Redux Toolkit**, **STOMP.js / SockJS**, and **TailwindCSS**.

---

## 📸 Screenshots Showcase

### 🔐 Authentication (Sign In & Sign Up)

<img width="1916" height="963" alt="Screenshot 2026-11-18 145254" src="https://github.com/user-attachments/assets/c978ec48-583d-4312-bf32-2163a2770e4b" />

<img width="1912" height="960" alt="Screenshot 2026-11-18 145342" src="https://github.com/user-attachments/assets/bf613bf4-222e-4225-a325-ba5642da0d4f" />

### 💬 Chat Room & Real-time Messaging

<img width="1911" height="963" alt="Screenshot 2026-11-18 145512" src="https://github.com/user-attachments/assets/eb4ec5e6-b519-4068-b3b6-1f9db4426057" />

### 🤝 Friend Management & Social Interaction

<img width="1914" height="963" alt="Screenshot 2026-11-18 145543" src="https://github.com/user-attachments/assets/4f150791-847c-4f3d-b10c-9d4abade7ae2" />

<img width="1913" height="964" alt="Screenshot 2026-11-18 145554" src="https://github.com/user-attachments/assets/77ce7851-07b2-487c-bb51-f6a156718b54" />

### 👤 Profile & User Settings

<img width="1913" height="963" alt="Screenshot 2026-11-18 145609" src="https://github.com/user-attachments/assets/9a82f111-2267-410e-90a0-8cda16d55e0b" />

---

## ✨ Features

* 🔐 **Secure Authentication**: JWT Access Token management, auto-refresh on 401 via Axios interceptors, route protection (`ProtectedRoute`).
* ⚡ **Instant Messaging**: Real-time message sending & receiving via WebSocket (STOMP.js).
* 🔄 **Optimistic UI Updates**: Instant message rendering with temporary IDs before server confirmation.
* 👥 **Direct & Group Chats**: Create 1-on-1 chats, organize group rooms, manage participants, and update room titles/nicknames.
* 🟢 **Live User Presence**: Real-time Online/Offline indicator badges for friends and room members.
* 🤖 **AI Chat Summarization**: One-click conversation summary powered by Google Gemini AI, displaying structured insights directly in the chat panel.
* 🔔 **Instant Notifications**: Real-time alert badges when messages arrive in background rooms.
* 🖼️ **Media & Avatar Upload**: Integrated Cloudinary media preview, profile editing, and avatar updating.
* 😀 **Rich Interactions**: Built-in Emoji Picker, message recall, and soft deletion.

---

## 🛠️ Tech Stack

* **Framework & Build**: React 18, Vite
* **State Management**: Redux Toolkit (Slices: `authSlice`, `chatSlice`, `friendSlice`)
* **Styling**: TailwindCSS, Lucide React Icons
* **Realtime Protocol**: `@stomp/stompjs`, `sockjs-client`
* **HTTP Client**: Axios with request/response interceptors
* **Routing**: React Router v6
* **Production Deployment**: Docker + Nginx reverse proxy

---

## ⚙️ Environment Variables

Create a `.env` file in the root frontend directory (see `.env.example`):

```properties
# Backend REST API Base URL
VITE_API_BASE_URL=http://localhost:8080

# Backend WebSocket URL
VITE_WS_URL=ws://localhost:8080/ws
```

---

## 🚀 Getting Started

### Prerequisites
* **Node.js**: v18.x or v20.x+
* **npm** or **yarn**

### Local Development
```bash
# 1. Clone the repository
git clone https://github.com/TranVanDang811/Chat-RealTime-FrontEnd.git
cd Chat-RealTime-FrontEnd

# 2. Install dependencies
npm install

# 3. Configure environment (.env)
cp .env.example .env

# 4. Start Vite development server
npm run dev
```
The application will run locally at `http://localhost:5173`.

### Production Build & Docker
```bash
# Build optimized static assets
npm run build

# Or build and run with Docker + Nginx
docker build -t chat-realtime-frontend:latest .
docker run -d -p 80:80 --name chat-frontend chat-realtime-frontend:latest
```

---

## 📁 Project Structure

```
src/
├── assets/             # Static graphics and images
├── components/         # Reusable UI widgets
│   ├── chat/           # Chat-specific components (EmojiPicker, MessageBubble)
│   ├── common/         # Modals, ToastContext, ProtectedRoute
├── features/           # Redux Toolkit Slices, Thunks, and API calls
│   ├── auth/           # authSlice, authThunks, authAPI
│   ├── chat/           # chatSlice, chatThunks, chatWebSocket
│   ├── friend/         # friendSlice, friendAPI
│   └── user/           # userAPI
├── layouts/            # Layout wrappers (ChatLayout, AuthLayout)
├── modal/              # Modal Dialogs (ProfileModal, InviteMemberModal, GroupMembersModal)
├── pages/              # Main view screens (ChatMain, Sidebar, SignIn, SignUp, Topbar)
├── routes.jsx          # Route definitions
├── services/           # Axios instance configuration
└── main.jsx            # Application entry point
```

---

## 👨‍💻 Author

* **Tran Van Dang**
* **Role**: Frontend / Backend Developer
* **GitHub**: [@TranVanDang811](https://github.com/TranVanDang811)
* **Email**: tranvandang08112003a@gmail.com
