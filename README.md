# DogDex AI - Intelligent Dog Breed Identification and Health Tracker

DogDex AI is a full-stack platform built with a monorepo architecture using Backend-for-Frontend (BFF) and microservices design. It classifies dog breeds from images, video uploads, or real-time camera streams, and integrates a dashboard for dog species dictionaries, AI assistant recommendations, and leaderboards.

This repository is organized into three major layers:
1. Frontend: Next.js application (Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, Zustand, React Query).
2. Backend (BFF): Node.js and Express API gateway (TypeScript) utilizing MongoDB, Redis caching, and BullMQ queues.
3. AI Service: Python microservice (FastAPI, uvicorn) running computer vision model inferences on PyTorch.

---

## AI Microservice Architecture

The Python AI service (ai_service/main.py) uses a custom hybrid detector-classifier model pipeline:

1. Detector (YOLOv11n): The first-pass model (yolo11n.pt) acts as a scanner to detect animal instances in the image (matching COCO classes: Cat, Dog, Horse, Sheep, Cow, Bear) with default image confidence of 0.25.
2. Classifier (YOLOv8s): The second-pass model (model_v8s_pro.pt, downloaded from HakuDevon/Dog_Breed_ID on Hugging Face) processes cropped bounding box images from the detector at a threshold of 0.1.
3. Decision Logic:
   - If the detector identifies a dog: the classifier attempts to identify the specific breed. If breed confidence is above 0.45, the breed label is assigned; otherwise, it falls back to "Unknown Dog".
   - If the detector identifies a non-dog animal: the classifier overrides the label to a dog breed only if classifier confidence exceeds 0.65. Otherwise, the detector's original label (e.g. Cat, Horse) is preserved.

---

## Core Services & Optimizations

### 1. Express BFF API
- Media Processing: Integrates fluent-ffmpeg and sharp to handle uploaded image and video assets.
- Task Queue: Implements BullMQ with ioredis connections to process video tracks asynchronously.
- Cloud Integration: Connects with Cloudinary for persistent media storage.
- Throttling & Caching: Employs express-rate-limit backed by Redis and custom caches.

### 2. Video Processing Pipeline
The `/predict/video` endpoint processes videos using:
- YOLO tracking API (`tracker.track`) with BYTETracker.
- Frame striding (VID_STRIDE = 3) to optimize processing latency.
- ID caching: Breed classifications are stored in memory by tracking ID (`track_id`). Each animal is only cropped and classified once during the video run.
- Imageio writer compilation with libx264 (or mjpeg fallback) to write the annotated video response.

### 3. WebSocket Real-time Stream
The WebSocket route `/predict-stream` supports low-latency live camera feeds. It initializes BYTETracker locally and pushes real-time JSON lists containing tracked boxes, IDs, and labels back to the client.

---

## Installation & Running

### Prerequisites
- Node.js v18+ & npm/pnpm
- Python 3.9+
- MongoDB instance
- Redis server
- Docker & Docker Compose (optional)

### 1. Set Up Environment Variables
Create a `.env` file in the root folder and configure database settings:
```env
MONGO_URI=mongodb://localhost:27017/dogdex
DB_NAME=dogdex
# For BFF backend and AI config
```

### 2. Run the AI Microservice
1. Navigate to the AI folder, set up virtual environment, and install dependencies:
   ```bash
   cd ai_service
   python -m venv .venv
   .venv\Scripts\activate  # Windows
   # source .venv/bin/activate # Linux/macOS
   pip install -r requirements.txt
   ```
2. Place model weights or let the script download them from Hugging Face.
3. Start uvicorn:
   ```bash
   python main.py
   ```
   API runs at http://localhost:8000.

### 3. Run the Backend API Gateway
1. Navigate to the backend folder:
   ```bash
   cd backend
   npm install
   ```
2. Launch server:
   ```bash
   npm run dev
   ```

### 4. Run the Next.js Frontend
1. Navigate to the frontend folder:
   ```bash
   cd frontend
   npm install
   ```
2. Start development mode:
   ```bash
   npm run dev
   ```
