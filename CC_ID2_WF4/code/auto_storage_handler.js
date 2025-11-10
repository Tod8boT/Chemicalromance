/**
 * ===================================================================
 * CC_ID2 - WF4: Enhanced Auto Storage System
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

// ===== INPUT DATA =====
const telegramMessage = $('Telegram Trigger').first().json.message;
const uploadedMedia = $('Upload to Cloudinary').first().json;

/**
 * ===== HELPER FUNCTIONS =====
 */

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
 * ===== MAIN EXECUTION =====
 */

try {
  // 1. Generate catalog entry
  const catalogEntry = generateCatalogEntry();

  // 2. Build confirmation message
  const confirmationText = buildConfirmationMessage();

  // 3. Return result for next nodes
  return [{
    json: {
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
        version: '1.0'
      }
    }
  }];

} catch (error) {
  // Error handling
  return [{
    json: {
      success: false,
      error: error.message,
      error_stack: error.stack,
      input_data: {
        has_telegram_message: !!telegramMessage,
        has_upload_result: !!uploadedMedia,
        message_type: telegramMessage?.photo ? 'photo' : telegramMessage?.video ? 'video' : 'unknown'
      }
    }
  }];
}
