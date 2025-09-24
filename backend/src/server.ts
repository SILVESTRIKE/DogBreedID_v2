// server.ts
import mongoose from "mongoose";
import app from "./app";
import WebSocket from "ws";

const startServer = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI phải được định nghĩa trong file .env");
  }
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET phải được định nghĩa trong file .env");
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Đã kết nối thành công tới MongoDB");
  } catch (error) {
    console.error("❌ Lỗi kết nối MongoDB:", error);
    process.exit(1);
  }

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 HTTP Server đang chạy trên cổng ${PORT}`);
  });

  // --- WebSocket Gateway Setup ---
  const WSS_PORT = parseInt(process.env.WSS_PORT || "8080", 10);
  const PY_WS_URL = process.env.PY_WS_URL || "ws://localhost:9001/ws/infer";

  const wss = new WebSocket.Server({ port: WSS_PORT }, () => {
    console.log(`🚀 WebSocket Gateway đang lắng nghe trên cổng :${WSS_PORT}`);
  });

  let pyws: WebSocket | null = null;
  const pendingMap = new Map<string, WebSocket>(); // Map requestId -> client websocket

  function connectPy() {
    const pythonWs = new WebSocket(PY_WS_URL);

    pythonWs.on("open", () => {
      console.log("✅ Đã kết nối tới Python infer server");
      pyws = pythonWs;
    });

    pythonWs.on("message", (data) => {
      // data from python: JSON {id:..., detections: [...], error:...}
      try {
        const msg = JSON.parse(data.toString());
        const reqId = msg.id;

        if (pendingMap.has(reqId)) {
          const wsClient = pendingMap.get(reqId);
          if (wsClient && wsClient.readyState === WebSocket.OPEN) {
            wsClient.send(JSON.stringify({ type: "detections", payload: msg }));
          }
          pendingMap.delete(reqId);
        } else {
          console.log("Không tìm thấy client phù hợp cho id yêu cầu", reqId);
        }
      } catch (e) {
        console.error("❌ Lỗi xử lý tin nhắn từ Python:", e);
      }
    });

    pythonWs.on("close", () => {
      console.log("Python WS đã đóng, đang kết nối lại sau 1s...");
      pyws = null;
      setTimeout(connectPy, 1000);
    });

    pythonWs.on("error", (e) => {
      console.error("❌ Lỗi Python WS:", e.message);
      if (
        pythonWs.readyState === WebSocket.OPEN ||
        pythonWs.readyState === WebSocket.CONNECTING
      ) {
        pythonWs.close();
      }
    });

    return pythonWs;
  }

  pyws = connectPy(); // Initial connection attempt

  wss.on("connection", (ws) => {
    console.log("FE client đã kết nối");

    ws.on("message", async (message) => {
      // Expect JSON: {type: 'frame', image: '<base64>', meta: {...}}
      let data;
      try {
        data = JSON.parse(message.toString());
      } catch (e) {
        console.error("❌ Lỗi phân tích JSON từ FE client:", e);
        return;
      }

      if (data.type === "frame" && data.image) {
        // Dynamically import uuid to resolve ERR_REQUIRE_ESM
        const { v4: uuidv4 } = await import("uuid");
        const reqId = uuidv4();
        pendingMap.set(reqId, ws);

        const payload = JSON.stringify({
          id: reqId,
          image: data.image,
          meta: data.meta || {},
        });

        if (pyws && pyws.readyState === WebSocket.OPEN) {
          pyws.send(payload);
        } else {
          ws.send(
            JSON.stringify({
              type: "error",
              message: "python_server_unavailable",
            })
          );
          pendingMap.delete(reqId);
        }

        // Tùy chọn: timeout nếu không có phản hồi từ Python
        setTimeout(() => {
          if (pendingMap.has(reqId)) {
            pendingMap.delete(reqId);
            try {
              if (ws.readyState === WebSocket.OPEN) {
                ws.send(
                  JSON.stringify({
                    type: "error",
                    message: "infer_timeout",
                    id: reqId,
                  })
                );
              }
            } catch (e) {
              console.error("Error sending timeout to FE client:", e);
            }
          }
        }, 5000); // 5s timeout, có thể điều chỉnh
      }

      if (data.type === "ping") {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: "pong" }));
        }
      }
    });

    ws.on("close", () => console.log("FE client đã ngắt kết nối"));
    ws.on("error", (e) => console.error("Lỗi FE client WS:", e.message));
  });
};

startServer();
