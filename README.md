# Invoice OCR & Management System

An intelligent, full-stack web application designed to automatically extract, organize, and manage data from PDF invoices. Built with a modern React frontend and a robust FastAPI Python backend.

## 🌟 Features

*   **Secure Authentication**: User login and registration powered by Clerk.
*   **Repository Management**: Organize your invoices into custom "Repositories" (folders) for specific clients or months.
*   **Automated OCR Extraction**: Upload PDF invoices and let the AI extract key data points (Invoice Number, Date, PO Number, Total Amount, etc.).
*   **SAP Integration**: Built-in endpoints to sync extracted invoice data directly to SAP systems.
*   **Modern UI/UX**: A beautiful, responsive interface built with Tailwind CSS and animated using Framer Motion.

## 🛠️ Tech Stack

### Frontend
*   **Framework**: React 18 with Vite
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS & Vanilla CSS
*   **Animations**: Framer Motion
*   **Authentication**: Clerk
*   **Routing**: React Router DOM

### Backend
*   **Framework**: FastAPI (Python)
*   **Database**: SQLite (Development) / PostgreSQL (Production) ORM via SQLAlchemy
*   **Migrations**: Alembic
*   **Document Processing**: PyMuPDF, OCR Integration

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18+)
*   Python (3.9+)
*   A Clerk Account (for authentication keys)

### 1. Clone the Repository
```bash
git clone https://github.com/shubhra-9/Invoice-OCR.git
cd Invoice-OCR
```

### 2. Frontend Setup
```bash
cd frontend
npm install

# Create a .env.local file and add your Clerk Publishable Key:
# VITE_CLERK_PUBLISHABLE_KEY=pk_test_...

npm run dev
```

### 3. Backend Setup
Open a new terminal window:
```bash
cd backend

# Create a virtual environment
python -m venv venv
# Activate it (Windows)
.\venv\Scripts\activate
# Activate it (Mac/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Start the server
uvicorn main:app --reload --port 8000
```

## 📁 Project Structure

*   `/frontend` - Contains the React application (UI, routing, API calls).
*   `/backend` - Contains the FastAPI application (endpoints, database models, OCR logic).
