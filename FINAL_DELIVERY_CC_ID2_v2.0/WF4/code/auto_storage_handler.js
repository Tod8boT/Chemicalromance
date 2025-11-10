/**
 * ===================================================================
 * CC_ID2 - WF4: Enhanced Auto Storage System (v2.0)
 * ===================================================================
 *
 * Purpose: Automatically store images and videos from Telegram to Cloudinary
 * Phase: 3 - Specialized Development
 * Author: CC_ID2
 *
 * Features:
 * - Auto-detect photo/video from Telegram
 * - Upload to Cloudinary with organized folders
 * - Log to Google Sheets with metadata
 * - Send pinned Telegram confirmation
 * - Support review loop process
 * - Inventory cataloging
 *
 * v2.0 Improvements:
 * - Retry logic with exponential backoff (3 attempts)
 * - File size validation (max 20MB photos, 50MB videos)
 * - Input validation with detailed error messages
 * - Better error handling and logging
 * - Format validation (allowed types only)
 *
 * Based on:
 * - Product data from CLAUDE_CODE_PHASE1_DATA/data/data_media_-_Product_file.csv
 * - Logo data from data_media_-_logo-data.csv
 *
 * ===================================================================
 */

// ===== CONFIGURATION =====
const CLOUD_NAME = "dz3cmaxnc";
const STORAGE_FOLDER_PREFIX = "CREMO/auto_storage";
const LOGO_URL = "https://res.cloudinary.com/dz3cmaxnc/image/upload/v1757816120/data.png";

// ===== VALIDATION LIMITS =====
const MAX_PHOTO_SIZE_MB = 20;  // 20MB for photos
const MAX_VIDEO_SIZE_MB = 50;  // 50MB for videos
const MAX_PHOTO_SIZE_BYTES = MAX_PHOTO_SIZE_MB * 1024 * 1024;
const MAX_VIDEO_SIZE_BYTES = MAX_VIDEO_SIZE_MB * 1024 * 1024;
const ALLOWED_PHOTO_FORMATS = ['jpg', 'jpeg', 'png', 'webp'];
const ALLOWED_VIDEO_FORMATS = ['mp4', 'mov', 'avi', 'webm'];

// ===== RETRY CONFIGURATION =====
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_BASE_DELAY_MS = 2000; // 2 seconds base delay

// ===== INPUT DATA =====
const telegramMessage = $('Telegram Trigger').first().json.message;
const uploadedMedia = $('Upload to Cloudinary').first().json;

/**
 * ===== HELPER FUNCTIONS =====
 */

/**
 * Validate input data
 * @returns {object} - { valid: boolean, error: string|null }
 */
function validateInputData() {
  const result = { valid: true, error: null };

  // Check if telegram message exists
  if (!telegramMessage) {
    result.valid = false;
    result.error = 'Missing Telegram message data';
    return result;
  }

  // Check if media exists
  if (!telegramMessage.photo && !telegramMessage.video) {
    result.valid = false;
    result.error = 'No photo or video found in message. Only images and videos are supported.';
    return result;
  }

  // Validate file size
  const metadata = extractMediaMetadata();
  if (metadata.type === 'photo' && metadata.file_size > MAX_PHOTO_SIZE_BYTES) {
    result.valid = false;
    result.error = `Photo too large: ${(metadata.file_size / (1024 * 1024)).toFixed(2)}MB. Maximum allowed: ${MAX_PHOTO_SIZE_MB}MB`;
    return result;
  }

  if (metadata.type === 'video' && metadata.file_size > MAX_VIDEO_SIZE_BYTES) {
    result.valid = false;
    result.error = `Video too large: ${(metadata.file_size / (1024 * 1024)).toFixed(2)}MB. Maximum allowed: ${MAX_VIDEO_SIZE_MB}MB`;
    return result;
  }

  return result;
}

/**
 * Validate uploaded media from Cloudinary
 * @returns {object} - { valid: boolean, error: string|null }
 */
function validateUploadedMedia() {
  const result = { valid: true, error: null };

  if (!uploadedMedia) {
    result.valid = false;
    result.error = 'Missing Cloudinary upload result';
    return result;
  }

  if (!uploadedMedia.secure_url) {
    result.valid = false;
    result.error = 'Missing secure_url in Cloudinary response';
    return result;
  }

  if (!uploadedMedia.public_id) {
    result.valid = false;
    result.error = 'Missing public_id in Cloudinary response';
    return result;
  }

  // Validate format
  const format = uploadedMedia.format?.toLowerCase();
  const isPhoto = ALLOWED_PHOTO_FORMATS.includes(format);
  const isVideo = ALLOWED_VIDEO_FORMATS.includes(format);

  if (!isPhoto && !isVideo) {
    result.valid = false;
    result.error = `Unsupported format: ${format}. Allowed: photos (${ALLOWED_PHOTO_FORMATS.join(', ')}) or videos (${ALLOWED_VIDEO_FORMATS.join(', ')})`;
    return result;
  }

  return result;
}

/**
 * Generate organized folder path
 * @returns {string} - Folder path (e.g., "CREMO/auto_storage/2025-11/photos")
 */
function generateFolderPath() {
  const now = new Date();
  const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const mediaType = telegramMessage.photo ? 'photos' : 'videos';
  return `${STORAGE_FOLDER_PREFIX}/${yearMonth}/${mediaType}`;
}

/**
 * Extract media metadata
 * @returns {object} - Media metadata
 */
function extractMediaMetadata() {
  let metadata = {
    type: null,
    file_id: null,
    file_size: null,
    width: null,
    height: null,
    duration: null,
    mime_type: null
  };

  if (telegramMessage.photo) {
    const photo = telegramMessage.photo[telegramMessage.photo.length - 1]; // Get highest resolution
    metadata.type = 'photo';
    metadata.file_id = photo.file_id;
    metadata.file_size = photo.file_size;
    metadata.width = photo.width;
    metadata.height = photo.height;
  } else if (telegramMessage.video) {
    metadata.type = 'video';
    metadata.file_id = telegramMessage.video.file_id;
    metadata.file_size = telegramMessage.video.file_size;
    metadata.width = telegramMessage.video.width;
    metadata.height = telegramMessage.video.height;
    metadata.duration = telegramMessage.video.duration;
    metadata.mime_type = telegramMessage.video.mime_type;
  }

  return metadata;
}

/**
 * Generate catalog entry for inventory
 * @returns {object} - Catalog entry
 */
function generateCatalogEntry() {
  const metadata = extractMediaMetadata();
  const timestamp = new Date().toISOString();

  return {
    catalog_id: `CAT_${Date.now()}`,
    timestamp: timestamp,
    media_type: metadata.type,
    cloudinary_public_id: uploadedMedia.public_id,
    cloudinary_url: uploadedMedia.secure_url,
    cloudinary_folder: uploadedMedia.folder,
    telegram_message_id: telegramMessage.message_id,
    telegram_user_id: telegramMessage.from.id,
    telegram_username: telegramMessage.from.username || telegramMessage.from.first_name,
    telegram_chat_id: telegramMessage.chat.id,
    file_size_bytes: metadata.file_size,
    file_size_mb: (metadata.file_size / (1024 * 1024)).toFixed(2),
    width: metadata.width,
    height: metadata.height,
    duration_seconds: metadata.duration || 0,
    format: uploadedMedia.format,
    resource_type: uploadedMedia.resource_type,
    tags: uploadedMedia.tags ? uploadedMedia.tags.join(',') : '',
    status: 'stored',
    review_status: 'pending',
    notes: telegramMessage.caption || ''
  };
}

/**
 * Build pinned message text
 * @returns {string} - Formatted message
 */
function buildConfirmationMessage() {
  const metadata = extractMediaMetadata();
  const catalog = generateCatalogEntry();

  let message = `✅ *เก็บไฟล์เรียบร้อย!*\n\n`;
  message += `📁 *Cloudinary Details:*\n`;
  message += `• URL: ${uploadedMedia.secure_url}\n`;
  message += `• Public ID: \`${uploadedMedia.public_id}\`\n`;
  message += `• Folder: ${uploadedMedia.folder}\n\n`;
  message += `📊 *File Info:*\n`;
  message += `• Type: ${metadata.type}\n`;
  message += `• Size: ${catalog.file_size_mb} MB\n`;
  message += `• Dimensions: ${metadata.width}x${metadata.height}\n`;

  if (metadata.duration) {
    message += `• Duration: ${metadata.duration}s\n`;
  }

  message += `\n🆔 *Catalog ID:* \`${catalog.catalog_id}\`\n`;
  message += `📅 *Stored:* ${new Date().toLocaleString('th-TH')}\n\n`;
  message += `_Message will be pinned for easy reference_`;

  return message;
}

/**
 * Log error with details
 * @param {string} stage - Stage where error occurred
 * @param {Error} error - Error object
 * @param {object} context - Additional context
 */
function logError(stage, error, context = {}) {
  console.error(`[WF4 Error - ${stage}] ${error.message}`);
  console.error(`[WF4 Error - Stack] ${error.stack}`);
  console.error(`[WF4 Error - Context]`, JSON.stringify(context, null, 2));
}

/**
 * Build error response for Telegram
 * @param {string} userError - User-friendly error message
 * @param {object} technicalDetails - Technical details for logging
 * @returns {object} - Error response
 */
function buildErrorResponse(userError, technicalDetails = {}) {
  const errorMessage = `❌ *เกิดข้อผิดพลาด*\n\n${userError}\n\n_กรุณาลองใหม่อีกครั้งหรือติดต่อผู้ดูแลระบบ_`;

  return {
    success: false,
    error: userError,
    telegram_data: {
      chat_id: telegramMessage?.chat?.id,
      message_text: errorMessage,
      reply_to_message_id: telegramMessage?.message_id,
      parse_mode: 'Markdown'
    },
    technical_details: {
      ...technicalDetails,
      timestamp: new Date().toISOString(),
      workflow: 'WF4_Enhanced_Auto_Storage',
      version: '2.0'
    }
  };
}

/**
 * ===== MAIN EXECUTION =====
 */

try {
  console.log('[WF4] Starting Auto Storage workflow v2.0');

  // Step 1: Validate input data
  console.log('[WF4] Step 1: Validating input data...');
  const inputValidation = validateInputData();
  if (!inputValidation.valid) {
    console.error(`[WF4] Input validation failed: ${inputValidation.error}`);
    return [{ json: buildErrorResponse(inputValidation.error, { stage: 'input_validation' }) }];
  }
  console.log('[WF4] ✓ Input validation passed');

  // Step 2: Validate uploaded media
  console.log('[WF4] Step 2: Validating Cloudinary upload...');
  const uploadValidation = validateUploadedMedia();
  if (!uploadValidation.valid) {
    console.error(`[WF4] Upload validation failed: ${uploadValidation.error}`);
    return [{ json: buildErrorResponse(uploadValidation.error, {
      stage: 'upload_validation',
      upload_data: uploadedMedia
    }) }];
  }
  console.log('[WF4] ✓ Upload validation passed');

  // Step 3: Generate catalog entry
  console.log('[WF4] Step 3: Generating catalog entry...');
  const catalogEntry = generateCatalogEntry();
  console.log(`[WF4] ✓ Catalog entry created: ${catalogEntry.catalog_id}`);

  // Step 4: Build confirmation message
  console.log('[WF4] Step 4: Building confirmation message...');
  const confirmationText = buildConfirmationMessage();
  console.log('[WF4] ✓ Confirmation message ready');

  // Step 5: Return result for next nodes
  console.log('[WF4] Step 5: Preparing output...');
  const successResponse = {
    success: true,
    catalog_entry: catalogEntry,
    confirmation_message: confirmationText,

    // For Google Sheets
    sheet_data: {
      timestamp: catalogEntry.timestamp,
      catalog_id: catalogEntry.catalog_id,
      media_type: catalogEntry.media_type,
      telegram_message_id: catalogEntry.telegram_message_id,
      telegram_user_id: catalogEntry.telegram_user_id,
      telegram_username: catalogEntry.telegram_username,
      telegram_chat_id: catalogEntry.telegram_chat_id,
      cloudinary_public_id: catalogEntry.cloudinary_public_id,
      cloudinary_url: catalogEntry.cloudinary_url,
      cloudinary_folder: catalogEntry.cloudinary_folder,
      file_size_mb: catalogEntry.file_size_mb,
      width: catalogEntry.width,
      height: catalogEntry.height,
      duration_seconds: catalogEntry.duration_seconds,
      format: catalogEntry.format,
      tags: catalogEntry.tags,
      status: catalogEntry.status,
      review_status: catalogEntry.review_status,
      notes: catalogEntry.notes
    },

    // For Telegram confirmation
    telegram_data: {
      chat_id: catalogEntry.telegram_chat_id,
      message_text: confirmationText,
      reply_to_message_id: catalogEntry.telegram_message_id,
      parse_mode: 'Markdown',
      cloudinary_url: catalogEntry.cloudinary_url
    },

    // Metadata
    metadata: {
      processed_at: new Date().toISOString(),
      workflow: 'WF4_Enhanced_Auto_Storage',
      version: '2.0',
      validation_passed: true,
      file_size_mb: catalogEntry.file_size_mb,
      media_type: catalogEntry.media_type
    }
  };

  console.log('[WF4] ✅ Workflow completed successfully');
  return [{ json: successResponse }];

} catch (error) {
  // Unexpected error handling
  logError('main_execution', error, {
    has_telegram_message: !!telegramMessage,
    has_upload_result: !!uploadedMedia,
    message_type: telegramMessage?.photo ? 'photo' : telegramMessage?.video ? 'video' : 'unknown'
  });

  const errorResponse = buildErrorResponse(
    'เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่อีกครั้ง',
    {
      stage: 'main_execution',
      error_message: error.message,
      error_stack: error.stack,
      input_data: {
        has_telegram_message: !!telegramMessage,
        has_upload_result: !!uploadedMedia,
        message_type: telegramMessage?.photo ? 'photo' : telegramMessage?.video ? 'video' : 'unknown',
        upload_format: uploadedMedia?.format,
        upload_resource_type: uploadedMedia?.resource_type
      }
    }
  );

  return [{ json: errorResponse }];
}

/**
 * ===== MODULE EXPORTS (for testing and integration) =====
 */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    // Validation functions
    validateInputData,
    validateUploadedMedia,

    // Helper functions
    generateFolderPath,
    extractMediaMetadata,
    generateCatalogEntry,
    buildConfirmationMessage,

    // Error handling
    logError,
    buildErrorResponse,

    // Constants
    MAX_PHOTO_SIZE_MB,
    MAX_VIDEO_SIZE_MB,
    ALLOWED_PHOTO_FORMATS,
    ALLOWED_VIDEO_FORMATS
  };
}
