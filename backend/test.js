const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// --- CẤU HÌNH ---
// =================================================================
const BASE_URL = 'http://localhost:3000/api'; // URL của server backend

// Thông tin tài khoản admin (cần có sẵn trong CSDL)
const ADMIN_CREDENTIALS = {
    email: 'admin@example.com',
    password: 'adminpassword',
};

// Thông tin người dùng mới sẽ được tạo để test
const NEW_USER_CREDENTIALS = {
    username: `testuser_${Date.now()}`,
    email: `testuser_${Date.now()}@example.com`,
    password: 'password123',
};

// Đường dẫn đến ảnh test
const IMAGE_PATH = path.join(__dirname, 'test_dog.jpg');
// =================================================================


// --- BIẾN TOÀN CỤC ĐỂ LƯU TRẠNG THÁI ---
let adminToken = null;
let userToken = null;
let newUserId = null;
let modelId = null;


// --- HÀM HELPER ---
const logStep = (message) => console.log(`\n\x1b[34m[BƯỚC] ${message}\x1b[0m`);
const logSuccess = (message) => console.log(`\x1b[32m  ✓ ${message}\x1b[0m`);
const logError = (message) => console.error(`\x1b[31m  ✗ ${message}\x1b[0m`);
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));


// --- KỊCH BẢN TEST ---
async function runTests() {
    logStep('Bắt đầu chuỗi test End-to-End...');

    // === BƯỚC 1: QUẢN LÝ MODEL (VỚI TÀI KHOẢN ADMIN) ===
    logStep('Đăng nhập với tài khoản Admin');
    const adminLoginRes = await axios.post(`${BASE_URL}/auth/login`, ADMIN_CREDENTIALS);
    adminToken = adminLoginRes.data.accessToken;
    logSuccess(`Đăng nhập Admin thành công. Token: ${adminToken.substring(0, 15)}...`);

    logStep('Tạo một bản ghi AI Model mới');
    const modelData = {
        name: "EfficientNetV2B0 Dog Classifier v1.0 (Test)",
        taskType: "DOG_BREED_CLASSIFICATION",
        format: "ONNX",
        huggingFaceRepo: "HakuDevon/Dog_Breed_ID",
        fileName: "dog_breed_classifier.onnx",
        labelsFileName: "labels.json",
        version: "1.0.0",
    };
    const createModelRes = await axios.post(`${BASE_URL}/ai-models`, modelData, {
        headers: { Authorization: `Bearer ${adminToken}` },
    });
    modelId = createModelRes.data.id;
    logSuccess(`Tạo Model thành công. ID: ${modelId}`);

    logStep('Kích hoạt (Activate) Model vừa tạo');
    await axios.patch(`${BASE_URL}/ai-models/${modelId}`, { status: 'ACTIVE' }, {
        headers: { Authorization: `Bearer ${adminToken}` },
    });
    logSuccess(`Kích hoạt Model ID ${modelId} thành công.`);
    await delay(500);


    // === BƯỚC 2: XÁC THỰC NGƯỜI DÙNG MỚI ===
    logStep('Đăng ký một người dùng mới');
    await axios.post(`${BASE_URL}/auth/register`, NEW_USER_CREDENTIALS);
    logSuccess(`Đăng ký người dùng ${NEW_USER_CREDENTIALS.email} thành công.`);

    // Lưu ý: Trong thực tế, cần có bước verify OTP. Ở đây chúng ta bỏ qua
    // và giả định tài khoản được tự động verify hoặc có một endpoint debug để verify.
    // Nếu không, bước login sẽ thất bại. (Sẽ cần chỉnh sửa code nếu có verify OTP)

    logStep('Đăng nhập với người dùng mới');
    const userLoginRes = await axios.post(`${BASE_URL}/auth/login`, {
        email: NEW_USER_CREDENTIALS.email,
        password: NEW_USER_CREDENTIALS.password,
    });
    userToken = userLoginRes.data.accessToken;
    newUserId = userLoginRes.data.user.id;
    logSuccess(`Đăng nhập người dùng mới thành công. Token: ${userToken.substring(0, 15)}...`);
    await delay(500);

    // === BƯỚC 3: MODULE DỰ ĐOÁN (VỚI NGƯỜI DÙNG MỚI) ===
    logStep('Thực hiện dự đoán giống chó');
    const form = new FormData();
    form.append('image', fs.createReadStream(IMAGE_PATH));
    const predictRes = await axios.post(`${BASE_URL}/predictions/dog-breed`, form, {
        headers: {
            ...form.getHeaders(),
            Authorization: `Bearer ${userToken}`,
        },
    });
    logSuccess('Thực hiện dự đoán thành công.');
    if (predictRes.data.data.results && predictRes.data.data.results.length > 0) {
        const topPrediction = predictRes.data.data.results[0];
        logSuccess(`Kết quả cao nhất: ${topPrediction.label} (${(topPrediction.confidence * 100).toFixed(2)}%)`);
    }

    logStep('Kiểm tra lịch sử dự đoán');
    const historyRes = await axios.get(`${BASE_URL}/predictions/history`, {
        headers: { Authorization: `Bearer ${userToken}` },
    });
    if (historyRes.data.data.length > 0) {
        logSuccess(`Lấy lịch sử thành công. Có ${historyRes.data.data.length} bản ghi.`);
    } else {
        throw new Error('Lịch sử dự đoán trống!');
    }
    await delay(500);


    // === BƯỚC 4: QUẢN LÝ TÀI KHOẢN (VỚI NGƯỜI DÙNG MỚI) ===
    logStep('Lấy thông tin cá nhân (/me)');
    await axios.get(`${BASE_URL}/users/me`, {
        headers: { Authorization: `Bearer ${userToken}` },
    });
    logSuccess('Lấy thông tin cá nhân thành công.');

    logStep('Cập nhật thông tin cá nhân');
    const newUsername = `updated_${NEW_USER_CREDENTIALS.username}`;
    await axios.put(`${BASE_URL}/users/me`, { username: newUsername }, {
        headers: { Authorization: `Bearer ${userToken}` },
    });
    const updatedUserRes = await axios.get(`${BASE_URL}/users/me`, {
        headers: { Authorization: `Bearer ${userToken}` },
    });
    if (updatedUserRes.data.username === newUsername) {
        logSuccess('Cập nhật thông tin thành công.');
    } else {
        throw new Error('Cập nhật thông tin thất bại!');
    }
    await delay(500);

    // === BƯỚC 5: DỌN DẸP (VỚI TÀI KHOẢN ADMIN) ===
    logStep('Admin xóa người dùng vừa tạo');
    await axios.delete(`${BASE_URL}/users/${newUserId}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
    });
    logSuccess(`Xóa người dùng ID ${newUserId} thành công.`);

    logStep('Admin vô hiệu hóa Model');
    await axios.patch(`${BASE_URL}/ai-models/${modelId}`, { status: 'INACTIVE' }, {
        headers: { Authorization: `Bearer ${adminToken}` },
    });
    logSuccess(`Vô hiệu hóa Model ID ${modelId} thành công.`);

    // === BƯỚC 6: ĐĂNG XUẤT ===
    logStep('Đăng xuất người dùng');
    const userLogoutData = userLoginRes.data; // Lấy dữ liệu từ lúc đăng nhập
    await axios.post(`${BASE_URL}/auth/logout`, { refreshToken: userLogoutData.refreshToken });
    logSuccess('Đăng xuất thành công.');

    console.log('\n\x1b[32m====================================\x1b[0m');
    console.log('\x1b[32m    TẤT CẢ CÁC BƯỚC ĐÃ THÀNH CÔNG!    \x1b[0m');
    console.log('\x1b[32m====================================\x1b[0m');
}

// Chạy script và bắt lỗi
runTests().catch(error => {
    logError('Một bước trong chuỗi test đã thất bại:');
    if (error.response) {
        // Lỗi từ server (ví dụ: 400, 401, 500)
        console.error('Status:', error.response.status);
        console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
        // Request được gửi nhưng không nhận được response (server không chạy?)
        console.error('Error:', error.message);
    } else {
        // Lỗi xảy ra khi thiết lập request
        console.error('Error:', error.message);
    }
    process.exit(1);
});