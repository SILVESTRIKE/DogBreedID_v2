import asyncio
import base64
import json
import cv2
import numpy as np
from ultralytics import YOLO
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
import uvicorn
import os

app = FastAPI()
#demo
# Load model once (heavy op)
# Use environment variable for model path, default to 'best.pt'
MODEL_PATH = os.getenv("dog_breed_classifier.onnx", "dog_breed_classifier.onnx")
model = None
try:
    model = YOLO(MODEL_PATH)   # path tới .pt của bạn
    # Optionally warmup the model
    model.predict(np.zeros((640, 640, 3), dtype=np.uint8), verbose=False)
    print(f"YOLOv8 model loaded successfully from {MODEL_PATH}")
except Exception as e:
    print(f"Error loading YOLOv8 model from {MODEL_PATH}: {e}")
    print("Predictions will not be available until the model is loaded correctly.")

async def decode_image_b64(b64str):
    b = base64.b64decode(b64str)
    arr = np.frombuffer(b, np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)  # BGR
    return img

def detections_to_json(results, model):
    out = []
    for r in results:
        boxes = r.boxes      # Boxes object
        for box in boxes:
            cls_id = int(box.cls[0])
            conf = float(box.conf[0])
            xyxy = [float(x) for x in box.xyxy[0].tolist()]  # x1,y1,x2,y2
            out.append({
                "class_id": cls_id,
                "class_name": model.names.get(cls_id, str(cls_id)),
                "confidence": conf,
                "bbox": xyxy
            })
    return out

@app.websocket("/ws/infer")
async def websocket_infer(ws: WebSocket):
    if model is None:
        # If model failed to load, refuse WebSocket connection or send error
        await ws.close(code=1011, reason="AI model not loaded on server.")
        return

    await ws.accept()
    try:
        while True:
            msg = await ws.receive_text()
            # Expect JSON: {"id": "...", "image": "<base64 str>", "meta": {...}}
            data = json.loads(msg)
            frame_b64 = data.get("image")
            req_id = data.get("id", None)
            if not frame_b64:
                await ws.send_text(json.dumps({"error":"no_image","id":req_id}))
                continue

            # decode
            img = await decode_image_b64(frame_b64)  # BGR np array
            if img is None:
                await ws.send_text(json.dumps({"error":"image_decode_failed","id":req_id}))
                continue

            # run inference (synchronous call)
            # set conf/filter/specific params as needed
            results = model.predict(img, conf=0.35, imgsz=640, verbose=False)
            det_json = detections_to_json(results, model)
            # return structured JSON with same id (so Node/FE can match)
            resp = {"id": req_id, "detections": det_json}
            await ws.send_text(json.dumps(resp))
    except WebSocketDisconnect:
        print("client disconnected")
    except Exception as e:
        print("error in ws:", e)
        try:
            await ws.send_text(json.dumps({"error":str(e)}))
        except:
            pass

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=9001, workers=1)
#cd d:/DoAnTotNghiep/backend/ai_service
#uvicorn main:app --host 0.0.0.0 --port 9001 --workers 1
