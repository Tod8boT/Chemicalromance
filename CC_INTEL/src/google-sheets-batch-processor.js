/**
 * Google Sheets Batch Processor
 * Project: CC_INTEL - Facebook Data Architecture
 * Purpose: Handle batch writes to Google Sheets with API rate limiting
 *
 * API Limits:
 * - Read: 100 requests / 100 seconds / user
 * - Write: 100 requests / 100 seconds / user
 * - Total: 300 requests / 100 seconds / project
 */

// ===== CONFIGURATION =====

const CONFIG = {
  // API rate limiting
  MAX_READS_PER_100S: 90,        // Leave 10% buffer
  MAX_WRITES_PER_100S: 90,       // Leave 10% buffer
  BATCH_SIZE: 100,                // Rows per write operation
  DELAY_BETWEEN_BATCHES: 1200,    // 1.2 seconds (safety margin)

  // Retry configuration
  MAX_RETRIES: 3,
  BACKOFF_MULTIPLIER: 2,
  INITIAL_BACKOFF: 1000,          // 1 second

  // Data validation
  MAX_ROW_SIZE: 50000,            // Max characters per row
  MAX_CELL_SIZE: 50000,           // Max characters per cell

  // Performance
  ENABLE_CACHE: true,
  CACHE_TTL_SECONDS: 300,         // 5 minutes
};

// ===== UTILITY FUNCTIONS =====

/**
 * Sleep utility for rate limiting
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Chunk array into batches
 */
function chunkArray(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Retry function with exponential backoff
 */
async function retryWithBackoff(fn, maxRetries = CONFIG.MAX_RETRIES) {
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry on certain errors
      if (error.code === 400 || error.code === 404) {
        throw error;
      }

      if (attempt < maxRetries) {
        const backoffTime = CONFIG.INITIAL_BACKOFF * Math.pow(CONFIG.BACKOFF_MULTIPLIER, attempt);
        console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${backoffTime}ms`);
        await sleep(backoffTime);
      }
    }
  }

  throw lastError;
}

/**
 * Ensure Thai text is properly encoded
 */
function ensureThaiTextSafe(text) {
  if (!text) return '';
  if (typeof text !== 'string') return String(text);

  // Ensure UTF-8 encoding
  const encoded = Buffer.from(text, 'utf8').toString('utf8');

  // Remove control characters
  const cleaned = encoded
    .replace(/[\u0000-\u001F]/g, '')  // Control characters
    .replace(/[\uFFFD]/g, '');         // Replacement character

  return cleaned;
}

/**
 * Validate row data before writing
 */
function validateRow(row, rowIndex) {
  const errors = [];

  // Check row is array
  if (!Array.isArray(row)) {
    errors.push(`Row ${rowIndex}: Must be an array`);
    return errors;
  }

  // Check cell count
  if (row.length > 100) {
    errors.push(`Row ${rowIndex}: Too many columns (max 100)`);
  }

  // Check cell sizes
  row.forEach((cell, cellIndex) => {
    const cellStr = String(cell);
    if (cellStr.length > CONFIG.MAX_CELL_SIZE) {
      errors.push(`Row ${rowIndex}, Cell ${cellIndex}: Exceeds max size`);
    }
  });

  return errors;
}

// ===== MAIN BATCH PROCESSOR =====

/**
 * Write data to Google Sheets in batches
 *
 * @param {Array<Array>} data - 2D array of data to write
 * @param {Object} sheets - Google Sheets API client
 * @param {string} spreadsheetId - Sheet ID
 * @param {string} sheetName - Sheet name/tab
 * @param {Object} options - Additional options
 * @returns {Object} Result summary
 */
async function writeBatchData(data, sheets, spreadsheetId, sheetName, options = {}) {
  const {
    startRow = 2,                    // Default: skip header row
    validateData = true,
    removeDuplicates = false,
    duplicateKeyColumn = 0,
    onProgress = null,
  } = options;

  console.log(`\n📊 Batch Write Starting...`);
  console.log(`   Sheet: ${sheetName}`);
  console.log(`   Total rows: ${data.length}`);
  console.log(`   Batch size: ${CONFIG.BATCH_SIZE}`);

  // === Step 1: Data Validation ===
  if (validateData) {
    console.log(`\n🔍 Validating data...`);
    const allErrors = [];

    data.forEach((row, index) => {
      const errors = validateRow(row, index);
      if (errors.length > 0) {
        allErrors.push(...errors);
      }
    });

    if (allErrors.length > 0) {
      console.error(`❌ Validation failed:`);
      allErrors.slice(0, 10).forEach(err => console.error(`   - ${err}`));
      if (allErrors.length > 10) {
        console.error(`   ... and ${allErrors.length - 10} more errors`);
      }
      throw new Error(`Data validation failed with ${allErrors.length} errors`);
    }

    console.log(`   ✓ All rows valid`);
  }

  // === Step 2: Clean Thai text ===
  console.log(`\n🌏 Cleaning Thai text...`);
  const cleanedData = data.map(row =>
    row.map(cell =>
      typeof cell === 'string' ? ensureThaiTextSafe(cell) : cell
    )
  );
  console.log(`   ✓ Text cleaned`);

  // === Step 3: Remove duplicates ===
  let processedData = cleanedData;

  if (removeDuplicates) {
    console.log(`\n🔄 Checking for duplicates...`);
    const seen = new Set();
    processedData = cleanedData.filter(row => {
      const key = row[duplicateKeyColumn];
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });

    const duplicateCount = cleanedData.length - processedData.length;
    console.log(`   ✓ Removed ${duplicateCount} duplicates`);
  }

  // === Step 4: Batch processing ===
  const batches = chunkArray(processedData, CONFIG.BATCH_SIZE);
  console.log(`\n📦 Processing ${batches.length} batches...`);

  const results = {
    totalRows: processedData.length,
    batchCount: batches.length,
    successfulBatches: 0,
    failedBatches: 0,
    errors: [],
    startTime: Date.now(),
    endTime: null,
  };

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    const batchStartRow = startRow + (i * CONFIG.BATCH_SIZE);
    const batchEndRow = batchStartRow + batch.length - 1;
    const range = `${sheetName}!A${batchStartRow}:Z${batchEndRow}`;

    console.log(`\n   Batch ${i + 1}/${batches.length}`);
    console.log(`   Range: ${range}`);
    console.log(`   Rows: ${batch.length}`);

    try {
      // Write batch with retry logic
      await retryWithBackoff(async () => {
        await sheets.spreadsheets.values.append({
          spreadsheetId,
          range,
          valueInputOption: 'RAW',
          insertDataOption: 'INSERT_ROWS',
          resource: { values: batch }
        });
      });

      results.successfulBatches++;
      console.log(`   ✅ Success`);

      // Progress callback
      if (onProgress) {
        onProgress({
          batch: i + 1,
          totalBatches: batches.length,
          rowsProcessed: (i + 1) * CONFIG.BATCH_SIZE,
          totalRows: processedData.length
        });
      }

      // Rate limiting delay (except last batch)
      if (i < batches.length - 1) {
        console.log(`   ⏳ Waiting ${CONFIG.DELAY_BETWEEN_BATCHES}ms...`);
        await sleep(CONFIG.DELAY_BETWEEN_BATCHES);
      }

    } catch (error) {
      results.failedBatches++;
      results.errors.push({
        batch: i + 1,
        range,
        error: error.message,
        code: error.code
      });

      console.error(`   ❌ Failed: ${error.message}`);

      // Continue with next batch or throw?
      // For now, continue to save partial data
    }
  }

  results.endTime = Date.now();
  results.durationMs = results.endTime - results.startTime;

  // === Summary ===
  console.log(`\n\n📈 Batch Write Complete`);
  console.log(`   ✓ Successful: ${results.successfulBatches}/${results.batchCount}`);
  console.log(`   ✗ Failed: ${results.failedBatches}/${results.batchCount}`);
  console.log(`   📊 Rows written: ${results.successfulBatches * CONFIG.BATCH_SIZE}`);
  console.log(`   ⏱️  Duration: ${(results.durationMs / 1000).toFixed(2)}s`);

  if (results.errors.length > 0) {
    console.log(`\n   ⚠️  Errors:`);
    results.errors.forEach(err => {
      console.log(`      Batch ${err.batch}: ${err.error}`);
    });
  }

  return results;
}

// ===== READ OPERATIONS =====

/**
 * Read data from Google Sheets with batching
 *
 * @param {Object} sheets - Google Sheets API client
 * @param {string} spreadsheetId - Sheet ID
 * @param {string} sheetName - Sheet name/tab
 * @param {Object} options - Read options
 * @returns {Array<Array>} 2D array of data
 */
async function readBatchData(sheets, spreadsheetId, sheetName, options = {}) {
  const {
    startRow = 1,
    endRow = null,
    columns = 'A:Z',
    includeHeader = true,
  } = options;

  console.log(`\n📖 Reading data from ${sheetName}...`);

  const rangeEnd = endRow ? endRow : '';
  const range = `${sheetName}!${columns}${startRow}:${rangeEnd}`;

  try {
    const response = await retryWithBackoff(async () => {
      return await sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
      });
    });

    const data = response.data.values || [];
    console.log(`   ✓ Read ${data.length} rows`);

    return data;

  } catch (error) {
    console.error(`   ❌ Read failed: ${error.message}`);
    throw error;
  }
}

/**
 * Check for duplicate IDs before writing
 *
 * @param {Array<Array>} newData - New data to write
 * @param {Object} sheets - Google Sheets API client
 * @param {string} spreadsheetId - Sheet ID
 * @param {string} sheetName - Sheet name
 * @param {number} keyColumn - Column index for key (0-based)
 * @returns {Array<Array>} Filtered data without duplicates
 */
async function filterDuplicates(newData, sheets, spreadsheetId, sheetName, keyColumn = 0) {
  console.log(`\n🔍 Checking for existing duplicates...`);

  // Read existing keys
  const keyColumnLetter = String.fromCharCode(65 + keyColumn); // A=65
  const existingData = await readBatchData(sheets, spreadsheetId, sheetName, {
    columns: `${keyColumnLetter}:${keyColumnLetter}`,
    startRow: 2 // Skip header
  });

  const existingKeys = new Set(existingData.map(row => row[0]));
  console.log(`   Found ${existingKeys.size} existing records`);

  // Filter new data
  const uniqueData = newData.filter(row => {
    const key = row[keyColumn];
    return !existingKeys.has(key);
  });

  const duplicateCount = newData.length - uniqueData.length;
  console.log(`   ✓ Filtered out ${duplicateCount} duplicates`);
  console.log(`   ✓ ${uniqueData.length} new records to write`);

  return uniqueData;
}

// ===== ARCHIVAL FUNCTIONS =====

/**
 * Archive old data to separate sheet
 *
 * @param {Object} sheets - Google Sheets API client
 * @param {string} spreadsheetId - Sheet ID
 * @param {string} sourceSheet - Source sheet name
 * @param {string} archiveSheet - Archive sheet name
 * @param {Date} cutoffDate - Archive data older than this
 * @returns {Object} Archive summary
 */
async function archiveOldData(sheets, spreadsheetId, sourceSheet, archiveSheet, cutoffDate) {
  console.log(`\n📦 Starting archival process...`);
  console.log(`   Source: ${sourceSheet}`);
  console.log(`   Archive: ${archiveSheet}`);
  console.log(`   Cutoff: ${cutoffDate.toISOString()}`);

  // Step 1: Read all data from source
  const allData = await readBatchData(sheets, spreadsheetId, sourceSheet);

  if (allData.length === 0) {
    console.log(`   ⚠️  No data to archive`);
    return { archivedRows: 0 };
  }

  const header = allData[0];
  const rows = allData.slice(1);

  // Step 2: Filter old data (assuming timestamp in column 0)
  const oldRows = rows.filter(row => {
    const timestamp = new Date(row[0]);
    return timestamp < cutoffDate;
  });

  console.log(`   Found ${oldRows.length} rows to archive`);

  if (oldRows.length === 0) {
    console.log(`   ⚠️  No old data to archive`);
    return { archivedRows: 0 };
  }

  // Step 3: Create archive sheet if not exists
  await createSheetIfNotExists(sheets, spreadsheetId, archiveSheet);

  // Step 4: Write to archive sheet
  const dataToArchive = [header, ...oldRows];
  await writeBatchData(dataToArchive, sheets, spreadsheetId, archiveSheet, {
    startRow: 1, // Include header
  });

  // Step 5: Remove archived rows from source
  // Note: In practice, you might want to keep data and mark as archived
  console.log(`   ✓ Archived ${oldRows.length} rows`);

  return {
    archivedRows: oldRows.length,
    archiveSheet: archiveSheet,
    cutoffDate: cutoffDate.toISOString(),
  };
}

/**
 * Create sheet if it doesn't exist
 */
async function createSheetIfNotExists(sheets, spreadsheetId, sheetName) {
  try {
    // Check if sheet exists
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
    const sheetExists = spreadsheet.data.sheets.some(
      sheet => sheet.properties.title === sheetName
    );

    if (sheetExists) {
      console.log(`   ℹ️  Sheet "${sheetName}" already exists`);
      return;
    }

    // Create new sheet
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      resource: {
        requests: [{
          addSheet: {
            properties: {
              title: sheetName
            }
          }
        }]
      }
    });

    console.log(`   ✓ Created sheet "${sheetName}"`);

  } catch (error) {
    console.error(`   ❌ Failed to create sheet: ${error.message}`);
    throw error;
  }
}

// ===== EXPORTS =====

module.exports = {
  CONFIG,
  writeBatchData,
  readBatchData,
  filterDuplicates,
  archiveOldData,
  createSheetIfNotExists,
  ensureThaiTextSafe,
  retryWithBackoff,
  sleep,
  chunkArray,
};

// ===== N8N CODE NODE EXAMPLE =====

/**
 * Example usage in n8n Code Node
 *
 * This code can be adapted for n8n's Code node
 */

/*
// n8n Code Node Example
// Assumes Google Sheets node connection available

// Get data from previous node
const inputData = $input.all();

// Prepare data for sheets (2D array)
const rowsToWrite = inputData.map(item => [
  item.json.timestamp,
  item.json.page_id,
  item.json.page_name,
  item.json.followers,
  item.json.engagement,
  // ... more columns
]);

// Configuration
const SHEET_ID = 'YOUR_SPREADSHEET_ID';
const SHEET_NAME = 'Facebook_Raw_Data';
const BATCH_SIZE = 100;
const DELAY_MS = 1200;

// Batch processing logic (simplified for n8n)
const batches = [];
for (let i = 0; i < rowsToWrite.length; i += BATCH_SIZE) {
  batches.push(rowsToWrite.slice(i, i + BATCH_SIZE));
}

// Return batches for subsequent Google Sheets nodes
return batches.map((batch, index) => ({
  json: {
    batch_number: index + 1,
    total_batches: batches.length,
    rows: batch,
    sheet_id: SHEET_ID,
    sheet_name: SHEET_NAME,
    range: `${SHEET_NAME}!A${2 + index * BATCH_SIZE}:Z`,
  }
}));
*/
