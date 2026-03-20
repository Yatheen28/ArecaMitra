# ArecaMitra - Arecanut Disease Detection App

A full-stack web application designed to help farmers identify diseases in Arecanut leaves. Features a FastAPI backend and a React/Vite frontend with a polished, premium aesthetic.

## Features
- Upload leaf images via Gallery or Device Camera
- Pre-trained TensorFlow model for disease prediction
- Premium dark green farming UI (shadcn/ui + Tailwind + Framer Motion)
- Bilingual toggle between English and Kannada
- Provides prediction confidence, health status, and actionable treatments

## Local Setup

### 1. Backend

Open a terminal and navigate to the project root:

```sh
cd E:\areca_leaf_mode
pip install -r requirements.txt
uvicorn app:app --reload --port 8000
```
This will start the FastAPI server with the model loaded at `http://localhost:8000`.

### 2. Frontend

Open a new terminal and navigate to the frontend folder:

```sh
cd E:\areca_leaf_mode\frontend
npm install
npm run dev
```

Open `%VITE_API_URL%` or the address printed in the terminal (e.g. `http://localhost:5173`) in your browser to view the app.

---
ArecaMitra - Empowering farmers with automated insights.
