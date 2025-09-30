# main.py
import uvicorn
from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from ultralytics import YOLO
import cv2
import numpy as np
import io
import logging

# ==============================================================================
# 1. KHỞI TẠO APP VÀ LOAD MODEL
# ==============================================================================
app = FastAPI(
    title="Dog Breed Inference API",
    description="An API to predict dog breeds using a YOLOv8 model.",
    version="1.0.0"
)

# Load model sẵn một lần duy nhất khi service khởi động
# Đảm bảo file 'best_model.pt' nằm cùng thư mục hoặc cung cấp đường dẫn đúng
try:
    model = YOLO("best_model.pt")
    print("YOLO model loaded successfully.")
except Exception as e:
    print(f"Error loading YOLO model: {e}")
    model = None

# ==============================================================================
# 2. HÀM HỖ TRỢ (HELPER FUNCTION)
# ==============================================================================
def process_results_to_json(results, model_names):
    #Chuyển đổi kết quả từ model YOLO thành một list JSON có cấu trúc.
    detections = []
    if not results:
        return detections

    for r in results:
        for box in r.boxes:
            detections.append({
                "class": model_names[int(box.cls)],
                "confidence": float(box.conf),
                "box": box.xyxy.tolist()[0],
            })
    return detections

# ==============================================================================
# 3. API ENDPOINT
# ==============================================================================
@app.get("/", summary="Health Check")
def health_check():
    """Kiểm tra xem service có đang hoạt động không."""
    return JSONResponse(content={"status": "ok", "message": "YOLOv8 Inference Service is running."})

@app.post("/predict", summary="Predict from Image File")
async def predict_from_file(file: UploadFile = File(..., description="Image file to perform prediction on.")):
    """
    Nhận một file ảnh, thực hiện dự đoán và trả về các đối tượng được phát hiện.
    """
    if not model:
        return JSONResponse(
            content={"status": "error", "message": "Model is not loaded on the server"}, 
            status_code=503 # Service Unavailable
        )
    
    try:
        # Đọc nội dung file vào memory dưới dạng bytes
        contents = await file.read()
        
        # Chuyển bytes thành một numpy array mà OpenCV có thể đọc được
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is None:
            return JSONResponse(content={"status": "error", "message": "Could not decode the provided file as an image."}, status_code=400)

        # Thực hiện dự đoán trực tiếp trên ảnh (numpy array)
        results = model.predict(source=img, conf=0.25, save=False, verbose=False)
        logging.basicConfig(level=logging.DEBUG)
        logging.debug(f"Raw model results: {results}")
        # Xử lý và trả về kết quả
        output_detections = process_results_to_json(results, model.names)

        # Trả về đúng cấu trúc mà Node.js mong đợi
        return JSONResponse(content={"predictions": output_detections})

    except Exception as e:
        return JSONResponse(content={"status": "error", "message": f"An internal error occurred: {str(e)}"}, status_code=500)

# ==============================================================================
# 4. CHẠY SERVER
# ==============================================================================
if __name__ == "__main__":
    # Chạy server với Uvicorn. host="0.0.0.0" để có thể truy cập từ bên ngoài container/máy ảo
    uvicorn.run(app, host="0.0.0.0", port=8000)
