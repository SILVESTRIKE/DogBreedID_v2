const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API PRODUCT MANAGEMENT',
            version: '1.0.0',
            description: 'Tài liệu API quản lý sản phẩm',
        },
        servers: [
            {
                url: 'http://localhost:3000',
            },
        ],
        // Dùng để thêm nút "Authorize" cho JWT
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                }
            }
        },
        schemas: {
            // --- Input DTOs ---
            ProductInput: { // Input DTO cho Product CREATE/UPDATE
                type: 'object',
                required: ['name', 'slug', 'quantity', 'price'],
                properties: {
                    name: { type: 'string', minLength: 3, maxLength: 100, example: "Laptop Pro" },
                    slug: { type: 'string', pattern: '^[a-z0-9-]+$', example: "laptop-pro" },
                    quantity: { type: 'number', minimum: 0, example: 50 },
                    price: { type: 'number', minimum: 0, example: 1200 },
                    description: { type: 'string', maxLength: 500, example: "A powerful laptop for professionals." }
                }
            },
            UserRegisterInput: { // Input DTO for Register
                type: 'object',
                required: ['username', 'email', 'password'],
                properties: {
                    username: { type: 'string', minLength: 3, maxLength: 50, example: "johndoe" },
                    email: { type: 'string', format: 'email', example: "john.doe@example.com" },
                    password: { type: 'string', format: 'password', minLength: 6, example: "aSecurePassword123" }
                }
            },
            LoginInput: { // Input DTO for Login
                type: 'object',
                required: ['email', 'password'],
                properties: {
                    email: { type: 'string', format: 'email', example: "john.doe@example.com" },
                    password: { type: 'string', format: 'password', minLength: 6, example: "aSecurePassword123" }
                }
            },
            SendOtpInput: { // Input DTO for Send OTP
                type: 'object',
                required: ['email'],
                properties: {
                    email: { type: 'string', format: 'email', example: "john.doe@example.com" }
                }
            },
            VerifyOtpInput: { // Input DTO for Verify OTP
                type: 'object',
                required: ['email', 'otp'],
                properties: {
                    email: { type: 'string', format: 'email', example: "john.doe@example.com" },
                    otp: { type: 'string', length: 6, pattern: '^[0-9]{6}$', example: "123456" }
                }
            },
            UpdateUserInput: { // Input DTO for Update User
                type: 'object',
                required: ['username'],
                properties: {
                    username: { type: 'string', minLength: 3, maxLength: 50, example: "john_doe_updated" }
                }
            },

            // --- Output DTOs ---
            UserResponse: { // Output DTO for User
                type: 'object',
                properties: {
                    _id: { type: 'string', example: "60d0fe4f5311236168a109ca" },
                    username: { type: 'string', example: "johndoe" },
                    email: { type: 'string', format: 'email', example: "john.doe@example.com" },
                    verify: { type: 'boolean', example: true },
                    role: { type: 'string', enum: ['user', 'admin'], example: "admin" }
                }
            },
            Product: { // Output DTO for Product
                type: 'object',
                properties: {
                    _id: { type: 'string', example: "60d0fe4f5311236168a109ca" },
                    name: { type: 'string', example: "Laptop Pro" },
                    slug: { type: 'string', example: "laptop-pro" },
                    quantity: { type: 'number', example: 50 },
                    price: { type: 'number', example: 1200 },
                    description: { type: 'string', example: "A powerful laptop for professionals." },
                    createdAt: { type: 'string', format: 'date-time', example: "2023-10-27T10:00:00.000Z" },
                    updatedAt: { type: 'string', format: 'date-time', example: "2023-10-27T10:00:00.000Z" }
                }
            },
            Error: {
                type: 'object',
                properties: {
                    message: { type: 'string' }
                }
            }
        },
        security: [{
            bearerAuth: []
        }]
    },
    // Chỗ này quan trọng: trỏ đến các file chứa route của bạn
    apis: ['./routes/*.js'], // Ví dụ: './src/routes/**/*.js'
};

const swaggerSpec = swaggerJSDoc(options);

function setupSwaggerDocs(app) {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
        swaggerOptions: {
            defaultModelsExpandDepth: -1,
            defaultModelRendering: "example",
            tryItOutEnabled: true // bật mặc định
        }
    }));
    console.log(`Swagger docs available at http://localhost:3000/api-docs`); // Thay port
}

module.exports = setupSwaggerDocs;