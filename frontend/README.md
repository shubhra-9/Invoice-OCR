# Invoice OCR - Frontend

This is the frontend application for the Invoice OCR & Management System. It provides a secure, beautifully animated, and responsive user interface for managing document repositories and extracting data from invoices.

## 🛠️ Technology Stack

*   **React 18**: Core UI library.
*   **Vite**: Lightning-fast build tool and development server.
*   **TypeScript**: For static type safety and enhanced developer experience.
*   **Tailwind CSS**: Utility-first styling for rapid, responsive design.
*   **Framer Motion**: Complex physics-based animations for a premium feel.
*   **Clerk**: Complete user authentication and identity management.
*   **React Router DOM**: Client-side routing for seamless navigation.

## 📁 Directory Structure

```text
src/
├── assets/       # Static images and media files
├── components/   # Reusable UI components (Modals, Tables, Cards)
│   ├── dashboard/  # Dashboard-specific components
│   └── home/       # Landing page-specific components
├── pages/        # Full page views (HomePage, Dashboard, SignIn, etc.)
├── services/     # API connection logic (fetch calls to FastAPI backend)
├── utils/        # Helper functions
├── App.tsx       # Main router and security wrappers
└── main.tsx      # Entry point and global providers (ClerkProvider)
```

## 🚀 Getting Started

### 1. Install Dependencies
Make sure you are in the `/frontend` directory, then run:
```bash
npm install
```

### 2. Environment Variables
You must connect the frontend to your Clerk account to enable logins. 
Create a `.env.local` file in this `/frontend` directory and add your Publishable Key:
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_key_here
```

### 3. Start Development Server
```bash
npm run dev
```
The app will start instantly. Open your browser to `http://localhost:5173`.

## 🔗 Connecting to the Backend
By default, the `services/api.ts` file is configured to communicate with the FastAPI backend at `http://localhost:8000`. Make sure the backend server is running simultaneously for full functionality (especially for PDF uploads and data extraction).
