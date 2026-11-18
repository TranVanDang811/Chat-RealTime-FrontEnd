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
<p align="center">
  <img width="850" alt="Sign In Screen" src="https://github.com/user-attachments/assets/f1834a47-e875-460a-a633-847f89cf1186" />
</p>
<p align="center">
  <img width="850" alt="Sign Up Screen" src="https://github.com/user-attachments/assets/2d582b2f-4f57-41fc-946a-d76582cd04be" />
</p>

### 💬 Chat Room & Real-time Messaging
<p align="center">
  <img width="850" alt="Chat Workspace" src="https://github.com/user-attachments/assets/f1c36e1a-5631-4ceb-834d-f65f886ed937" />
</p>

### 🤝 Friend Management & Social Interaction
<p align="center">
  <img width="850" alt="Friend Request Interface" src="https://github.com/user-attachments/assets/5860e67f-1a23-4110-8f41-e1e595472d41" />
</p>
<p align="center">
  <img width="850" alt="Friend List" src="https://github.com/user-attachments/assets/5db23eed-1d13-4c44-b81c-d930e822eeac" />
</p>

### 👤 Profile & User Settings
<p align="center">
  <img width="850" alt="Profile Modal" src="https://github.com/user-attachments/assets/5b0da824-a995-46f1-bd5f-6cca660a2f57" />
</p>

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
