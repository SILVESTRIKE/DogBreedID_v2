import { Router } from "express";
import {
  MediaController,
  DirectoryController,
} from "../controllers/medias.controller";
import { validateData } from "../middlewares/validateBody.middleware";
import {
  UpdateMediaInfoZodSchema,
  CreateDirectoryZodSchema,
  GetByIdParamsSchema,
  GetMediasQuerySchema,
} from "../types/zod/medias.zod";
import { uploadSingle, uploadMultiple } from "../middlewares/upload.middleware";
// import { authMiddleware } from "../middlewares/auth.middleware";
import { roleMiddleware } from "../middlewares/role.middleware";

const router = Router();


// =================================================================
// I. MEDIA UPLOAD ROUTES
// =================================================================

// 1.1. Upload một file duy nhất, trả về đầy đủ metadata.
router.post(
  "/api/medias/upload/single",
  // checkAllowedRolesMiddleware(['HR_ADMIN', 'EDITOR']),
  uploadSingle,
  MediaController.uploadSingle
);

// 1.2. Upload nhiều file, mỗi file có metadata riêng, trả về mảng metadata.
router.post(
  "/api/medias/upload/multiple",
  // checkAllowedRolesMiddleware(['HR_ADMIN', 'EDITOR']),
  uploadMultiple,
  MediaController.uploadMultiple
);

// 1.3. Upload một file, chỉ trả về URL (dùng cho editor).
router.post(
  "/api/medias/upload-url",
  // checkAllowedRolesMiddleware(['HR_ADMIN', 'EDITOR']),
  uploadSingle,
  MediaController.uploadAndGetUrl
);

// =================================================================
// II. MEDIA ACCESS & MANAGEMENT ROUTES
// =================================================================

// 2.1. Lấy danh sách media với đầy đủ bộ lọc (theo thuộc tính, thư mục logic, thời gian).
router.get(
  "/api/medias",
  // checkAllowedRolesMiddleware(['HR_ADMIN', 'EDITOR', 'VIEWER']),
  validateData(GetMediasQuerySchema, "query"),
  MediaController.getMedias
);

// 2.2. Lấy thông tin chi tiết của một media bằng ID.
router.get(
  "/api/medias/:id",
  // checkAllowedRolesMiddleware(['HR_ADMIN', 'EDITOR', 'VIEWER']),
  validateData(GetByIdParamsSchema, "params"),
  MediaController.getMediaById
);
router.get("/api/medias/stream/:folder(processed-videos|processed-images)/:filename", MediaController.streamMedia);

// 2.3. Cập nhật thông tin (name, description) của một media.
router.post(
  "/api/medias/:id",
  // checkAllowedRolesMiddleware(['HR_ADMIN', 'EDITOR']),
  validateData(GetByIdParamsSchema, "params"),
  validateData(UpdateMediaInfoZodSchema, "body"),
  MediaController.updateMediaInfo
);

// 2.4. Xóa mềm một media.
router.delete(
  "/api/medias/:id",
  // checkAllowedRolesMiddleware(['HR_ADMIN']),
  validateData(GetByIdParamsSchema, "params"),
  MediaController.deleteMedia
);

// =================================================================
// III. DIRECTORY (LOGICAL FOLDERS) MANAGEMENT ROUTES
// =================================================================

// 3.1. Tạo một thư mục logic mới.
router.post(
  "/api/directories",
  // checkAllowedRolesMiddleware(['HR_ADMIN', 'EDITOR']),
  validateData(CreateDirectoryZodSchema, "body"),
  DirectoryController.create
);

// 3.2. Lấy nội dung của thư mục gốc (root).
router.get(
  "/api/directories/content",
  // checkAllowedRolesMiddleware(['HR_ADMIN', 'EDITOR', 'VIEWER']),
  DirectoryController.getContent
);

// 3.3. Lấy nội dung của một thư mục logic cụ thể bằng ID.
router.get(
  "/api/directories/content/:id",
  // checkAllowedRolesMiddleware(['HR_ADMIN', 'EDITOR', 'VIEWER']),
  validateData(GetByIdParamsSchema, "params"),
  DirectoryController.getContent
);

// 3.4. Lấy đường dẫn "breadcrumb" cho một thư mục.
router.get(
  "/api/directories/:id/breadcrumb",
  // checkAllowedRolesMiddleware(['HR_ADMIN', 'EDITOR', 'VIEWER']),
  validateData(GetByIdParamsSchema, "params"),
  DirectoryController.getBreadcrumb
);

// 3.5. Xóa mềm một thư mục và toàn bộ nội dung bên trong nó (đệ quy).
router.delete(
  "/api/directories/:id",
  // checkAllowedRolesMiddleware(['HR_ADMIN']),
  validateData(GetByIdParamsSchema, "params"),
  DirectoryController.softDelete
);

// =================================================================
// IV. PHYSICAL FOLDER BROWSING ROUTES (ADMIN ONLY)
// =================================================================
//4.1.1. Lấy danh sách các thư mục loại file (file types).
router.get(
  "/api/admin/media-folders",
  // checkAllowedRolesMiddleware(['HR_ADMIN', 'EDITOR']),
  MediaController.getFileTypeFolders
);
// 4.1. [Admin] Lấy danh sách các thư mục năm có chứa media.
router.get(
  "/api/admin/media-folders/:fileType",
  // checkAllowedRolesMiddleware(['HR_ADMIN', 'EDITOR']),
  MediaController.getYearFolders
);

// 4.2. [Admin] Lấy danh sách các thư mục tháng trong một năm.
router.get(
  "/api/admin/media-folders/:fileType/:year",
  // checkAllowedRolesMiddleware(['HR_ADMIN', 'EDITOR']),
  MediaController.getMonthFolders
);

// 4.3. [Admin] Lấy danh sách media trong một thư mục tháng/năm cụ thể.
router.get(
  "/api/admin/media-folders/:fileType/:year/:month",
  // checkAllowedRolesMiddleware(['HR_ADMIN', 'EDITOR']),
  MediaController.getMediaByPhysicalPath
);
router.get(
  "/api/admin/media-folders/:fileType/:year/:month",
  MediaController.getMediaByPhysicalPath
);

export { router as mediasRouter };
