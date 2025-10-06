import uvicorn
from fastapi import FastAPI, File, UploadFile, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse
from ultralytics import YOLO
import cv2
import numpy as np
import tempfile
import os
import uuid
import base64
import traceback
import datetime
from typing import List, Dict, Any

# ==============================================================================
# 1. KHỞI TẠO APP VÀ LOAD MODEL
# ==============================================================================
app = FastAPI(
    title="Dog Breed Inference API",
    description="An API to predict dog breeds from images and videos using a YOLOv8 model.",
    version="6.0.0" # Updated version
)

try:
    model = YOLO("best_model.pt")
    print("YOLO model loaded successfully.")
except Exception as e:
    print(f"Error loading YOLO model: {e}")
    model = None

# Define the save directory relative to this script's location
SAVE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'public', 'processed-images'))
os.makedirs(SAVE_DIR, exist_ok=True)
print(f"Annotated frames will be saved to: {SAVE_DIR}")

# ==============================================================================
# 2. HÀM HỖ TRỢ (REFACTORED)
# ==============================================================================

def process_results(results) -> List[Dict[str, Any]]:
    """
    Processes detection or tracking results and returns a structured list of detections.
    Includes track_id if available.
    """
    detections = []
    if not results or not results[0].boxes:
        return detections

    boxes = results[0].boxes
    track_ids = boxes.id.int().cpu().tolist() if boxes.id is not None else [None] * len(boxes)
    class_ids = boxes.cls.int().cpu().tolist()
    confs = boxes.conf.float().cpu().tolist()
    xyxy_coords = boxes.xyxy.cpu().tolist()
    
    for track_id, class_id, conf, xyxy in zip(track_ids, class_ids, confs, xyxy_coords):
        detections.append({
            "track_id": track_id,
            "class": model.names[class_id],
            "confidence": conf,
            "box": [round(coord) for coord in xyxy],
        })
    return detections

def draw_custom_annotations(frame, detections: List[Dict[str, Any]]):
    """
    Draws custom bounding boxes and labels on a frame.
    Label includes track_id if present.
    """
    annotated_frame = frame.copy()
    for det in detections:
        box = det['box']
        confidence = det['confidence']
        class_name = det['class']
        track_id = det.get('track_id')

        label = f"{class_name} ({confidence:.2f})"
        if track_id is not None:
            label = f"ID {track_id}: {label}"

        # Draw bounding box
        cv2.rectangle(annotated_frame, (box[0], box[1]), (box[2], box[3]), (0, 255, 0), 2)
        
        # Draw label background
        (w, h), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.7, 2)
        (x1, y1, x2, y2) = box
        cv2.rectangle(annotated_frame, (x1, y1 - h - 10), (x1 + w, y1 - 10), (0, 255, 0), -1)
        
        # Draw label text
        cv2.putText(annotated_frame, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 0), 2)
        
    return annotated_frame

# ==============================================================================
# 3. API ENDPOINTS (IMPROVED, SEPARATE ROUTES)
# ==============================================================================

@app.get("/", summary="Health Check")
def health_check():
    """Provides a simple health check endpoint."""
    return JSONResponse(content={"status": "ok", "message": "YOLOv8 Inference Service is running."})

@app.post("/predict/image", summary="Predict from a single image")
async def predict_from_image_file(file: UploadFile = File(...)):
    """
    Accepts an image file, returns predictions and a base64 annotated image.
    """
    if not model:
        return JSONResponse(content={"status": "error", "message": "Model is not loaded"}, status_code=503)
    try:
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            return JSONResponse(content={"status": "error", "message": "Could not decode image."}, status_code=400)
        
        results = model.predict(source=img, conf=0.25, verbose=False)
        detections = process_results(results) # Use new helper
        
        annotated_image = draw_custom_annotations(img, detections) # Use new helper
        _, buffer = cv2.imencode('.jpg', annotated_image)
        processed_image_base64 = base64.b64encode(buffer).decode('utf-8')

        return JSONResponse(content={
            "predictions": sorted(detections, key=lambda x: x['confidence'], reverse=True),
            "processed_media_base64": processed_image_base64,
            "media_type": "image/jpeg"
        })
    except Exception as e:
        traceback.print_exc()
        return JSONResponse(content={"status": "error", "message": f"An internal error occurred: {str(e)}"}, status_code=500)

@app.post("/predict/video", summary="Process video and return best shot for each track")
async def predict_from_video_file(file: UploadFile = File(...)):
    """
    Tracks each dog in a video, finds the best frame for each, saves it as an image,
    and returns a list of predictions with URLs to the saved images.
    """
    if not model:
        return JSONResponse(content={"status": "error", "message": "Model is not loaded"}, status_code=503)

    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as tmp:
        contents = await file.read()
        tmp.write(contents)
        tmp_path = tmp.name

    try:
        cap = cv2.VideoCapture(tmp_path)
        if not cap.isOpened():
            return JSONResponse(content={"status": "error", "message": "Could not open video file."}, status_code=400)

        tracked_objects = {} # Stores the best prediction for each track_id

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            
            results = model.track(source=frame, conf=0.5, persist=True, verbose=False, tracker="bytetrack.yaml")
            
            if results[0].boxes.id is not None:
                detections = process_results(results)
                for det in detections:
                    track_id = det['track_id']
                    if track_id is None: continue
                    
                    confidence = det['confidence']
                    
                    # If new track_id or higher confidence, store its data and frame
                    if track_id not in tracked_objects or confidence > tracked_objects[track_id]['confidence']:
                        tracked_objects[track_id] = det
                        tracked_objects[track_id]['frame'] = frame.copy()
        cap.release()
        os.unlink(tmp_path)

        # Process the best shots
        final_predictions = []
        for track_id, data in tracked_objects.items():
            best_frame = data.pop('frame')
            breed_name = data['class'].replace(' ', '_')
            
            # Save the best frame as an image
            filename = f"capture_{track_id}_{breed_name}_{uuid.uuid4().hex[:6]}.jpg"
            save_path = os.path.join(SAVE_DIR, filename)
            
            # Draw annotation only for this specific object on its best frame
            annotated_frame = draw_custom_annotations(best_frame, [data])
            cv2.imwrite(save_path, annotated_frame)
            
            data['image_url'] = f"/processed-images/{filename}"
            final_predictions.append(data)

        return JSONResponse(content={
            "predictions": sorted(final_predictions, key=lambda x: x['track_id']),
            "media_type": "video/best_shots"
        })
    except Exception as e:
        traceback.print_exc()
        return JSONResponse(content={"status": "error", "message": f"An internal error occurred: {str(e)}"}, status_code=500)
    finally:
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)

@app.websocket("/predict-stream")
async def predict_stream(websocket: WebSocket):
    """
    Real-time prediction via WebSocket. Uses tracking to maintain object IDs across frames.
    """
    await websocket.accept()
    if not model:
        await websocket.send_json({"status": "error", "message": "Model is not loaded"})
        await websocket.close()
        return
    
    try:
        while True:
            data = await websocket.receive_text()
            img_data = base64.b64decode(data.split(',')[1])
            nparr = np.frombuffer(img_data, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

            if img is not None:
                results = model.track(source=img, conf=0.4, persist=True, verbose=False)
                detections = process_results(results)
                
                high_conf_detections = [d for d in detections if d['confidence'] > 0.8]

                if high_conf_detections:
                    best_det = max(high_conf_detections, key=lambda x: x['confidence'])
                    track_id = best_det.get('track_id', 'N/A')
                    breed_name = best_det['class'].replace(' ', '_')

                    filename = f"capture_ws_{track_id}_{breed_name}_{uuid.uuid4().hex[:6]}.jpg"
                    save_path = os.path.join(SAVE_DIR, filename)
                    annotated_frame = draw_custom_annotations(img, high_conf_detections)
                    cv2.imwrite(save_path, annotated_frame)
                    
                    image_url = f"/processed-images/{filename}"
                    print(f"[WS] Captured high-confidence frame: {save_path}")

                    await websocket.send_json({
                        "status": "captured",
                        "imageUrl": image_url,
                        "detections": high_conf_detections
                    })
                    await websocket.close()
                    break
                else:
                    await websocket.send_json({"status": "ok", "detections": detections})
            else:
                print("[WS] ERROR: Received data could not be decoded into an image.")

    except WebSocketDisconnect:
        print("[WS] Client disconnected.")
    except Exception as e:
        print(f"WebSocket Error: {e}")
        traceback.print_exc()
        try:
            await websocket.close()
        except RuntimeError:
            pass # Ignore, socket already closed

# ==============================================================================
# 4. CHẠY SERVER
# ==============================================================================
if __name__ == "__main__":
    uvicorn.run(app, host="localhost", port=8000)
