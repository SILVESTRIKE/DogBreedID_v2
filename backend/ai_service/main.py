import uvicorn
from fastapi import FastAPI, File, UploadFile
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
from fastapi import WebSocket, WebSocketDisconnect

# ==============================================================================
# 1. KHỞI TẠO APP VÀ LOAD MODEL
# ==============================================================================
app = FastAPI(
    title="Dog Breed Inference API",
    description="An API to predict dog breeds using a YOLOv8 model.",
    version="5.0.0"
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
# 2. HÀM HỖ TRỢ
# ==============================================================================
def process_results_to_json(results, model_names):
    detections = []
    if not results or not results[0].boxes:
        return detections
    
    for box in results[0].boxes:
        detections.append({
            "class": model_names[int(box.cls)],
            "confidence": float(box.conf),
            "box": [round(coord) for coord in box.xyxy.tolist()[0]],
        })
    return detections

# ==============================================================================
# 3. API ENDPOINT
# ==============================================================================
@app.get("/", summary="Health Check")
def health_check():
    return JSONResponse(content={"status": "ok", "message": "YOLOv8 Inference Service is running."})

@app.post("/predict", summary="Predict multiple objects and return a base64 visualized image")
async def predict_from_image_file(file: UploadFile = File(...)):
    if not model:
        return JSONResponse(content={"status": "error", "message": "Model is not loaded"}, status_code=503)
    try:
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            return JSONResponse(content={"status": "error", "message": "Could not decode image."}, status_code=400)
        
        results = model.predict(source=img, conf=0.25, save=False, verbose=False)
        output_detections = process_results_to_json(results, model.names)
        output_detections = sorted(output_detections, key=lambda x: x['confidence'], reverse=True)
        
        image_to_draw = img.copy()
        for det in output_detections:
            box = det['box']; label = f"{det['class']} ({det['confidence']:.2f})"
            cv2.rectangle(image_to_draw, (box[0], box[1]), (box[2], box[3]), (0, 255, 0), 2)
            cv2.putText(image_to_draw, label, (box[0], box[1] - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
        _, buffer = cv2.imencode('.jpg', image_to_draw)
        processed_image_base64 = base64.b64encode(buffer).decode('utf-8')

        return JSONResponse(content={
            "predictions": output_detections,
            "processed_media_base64": processed_image_base64,
            "media_type": "image/jpeg"
        })
    except Exception as e:
        traceback.print_exc()
        return JSONResponse(content={"status": "error", "message": f"An internal error occurred: {str(e)}"}, status_code=500)

@app.post("/predict-video", summary="Process Video and return a base64 processed video")
async def predict_from_video_file(file: UploadFile = File(...)):
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

        original_fps = int(cap.get(cv2.CAP_PROP_FPS))
        frame_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        frame_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        
        tracked_objects = {}
        frame_count = 0
        frame_skip = max(1, round(original_fps / 10))

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret: break
            
            if frame_count % frame_skip == 0:
                results = model.track(source=frame, conf=0.5, persist=True, verbose=False, tracker="bytetrack.yaml")
                
                if results[0].boxes.id is not None:
                    boxes = results[0].boxes.xyxy.cpu().numpy().astype(int)
                    track_ids = results[0].boxes.id.cpu().numpy().astype(int)
                    confs = results[0].boxes.conf.cpu().numpy()
                    clss = results[0].boxes.cls.cpu().numpy().astype(int)

                    for box, track_id, conf, cls_id in zip(boxes, track_ids, confs, clss):
                        class_name = model.names[cls_id]
                        confidence_float = float(conf)
                        
                        if track_id not in tracked_objects or confidence_float > tracked_objects[track_id]['confidence']:
                            tracked_objects[track_id] = {
                                "class": class_name, "confidence": confidence_float, "box": box.tolist()
                            }
            frame_count += 1

        final_predictions = sorted(list(tracked_objects.values()), key=lambda x: x['confidence'], reverse=True)

        output_filename = f"{uuid.uuid4()}.mp4"
        output_path = os.path.join(tempfile.gettempdir(), output_filename)
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        out = cv2.VideoWriter(output_path, fourcc, original_fps, (frame_width, frame_height))
        
        cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret: break
            
            for track_id, data in tracked_objects.items():
                box = data['box']; label = f"ID {track_id}: {data['class']} ({data['confidence']:.2f})"
                cv2.rectangle(frame, (box[0], box[1]), (box[2], box[3]), (0, 255, 0), 2)
                cv2.putText(frame, label, (box[0], box[1] - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
            out.write(frame)

        cap.release()
        out.release()
        
        with open(output_path, "rb") as video_file:
            processed_video_base64 = base64.b64encode(video_file.read()).decode('utf-8')
        os.remove(output_path)

        return JSONResponse(content={
            "predictions": final_predictions,
            "processed_media_base64": processed_video_base64,
            "media_type": "video/mp4"
        })
    except Exception as e:
        print("="*80); traceback.print_exc(); print("="*80)
        return JSONResponse(content={"status": "error", "message": f"An internal error occurred: {str(e)}"}, status_code=500)
    finally:
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)
            
@app.websocket("/predict-stream")
async def predict_stream(websocket: WebSocket):
    await websocket.accept()
    if not model:
        await websocket.send_json({"status": "error", "message": "Model is not loaded"})
        await websocket.close()
        return
    try:
        while True:
            data = await websocket.receive_text()

            try:
                img_data = base64.b64decode(data.split(',')[1])
                nparr = np.frombuffer(img_data, np.uint8)
                img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

                if img is not None:
                    results = model.predict(source=img, conf=0.4, save=False, verbose=False)
                    detections = process_results_to_json(results, model.names)
                    
                    high_conf_detections = [d for d in detections if d['confidence'] > 0.8]

                    if high_conf_detections:
                        # Get the annotated image from the results
                        annotated_frame = results[0].plot()

                        # Create a unique filename
                        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S_%f")
                        highest_conf_det = max(high_conf_detections, key=lambda x: x['confidence'])
                        breed_name = highest_conf_det['class'].replace(' ', '_')
                        filename = f"{timestamp}_{breed_name}.jpg"
                        save_path = os.path.join(SAVE_DIR, filename)
                        
                        # Save the annotated image
                        cv2.imwrite(save_path, annotated_frame)
                        print(f"[WS] Saved annotated prediction frame to: {save_path}")

                        # The saved file is in `backend/public/processed-images`
                        # The URL path will be `/processed-images/filename.jpg`
                        image_url = f"/processed-images/{filename}"

                        # Send a special message to the client and close connection
                        await websocket.send_json({
                            "status": "captured",
                            "imageUrl": image_url,
                            "detections": high_conf_detections
                        })
                        print(f"[WS] Sent capture notification for {image_url}, closing connection.")
                        await websocket.close()
                        break  # Exit the while loop
                    else:
                        # If no high-confidence detection, send normal results
                        await websocket.send_json({"status": "ok", "detections": detections})
                else:
                    print("[WS] ERROR: Received data could not be decoded into an image.")
            except Exception as e:
                print(f"[WS] ERROR processing received data frame: {e}")
                continue
    except WebSocketDisconnect:
        print("[WS] Client disconnected.")
    except Exception as e:
        print(f"WebSocket Error: {e}")
        await websocket.close()

# ==============================================================================
# 4. CHẠY SERVER
# ==============================================================================
if __name__ == "__main__":
    uvicorn.run(app, host="localhost", port=8000)