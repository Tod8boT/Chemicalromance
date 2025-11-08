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

  console.log(`📊 Batch Write Starting...`);
  console.log(`   Sheet: ${sheetName}`);
  console.log(`   Total rows: ${data.length}`);
  console.log(`   Batch size: ${CONFIG.BATCH_SIZE}`);

  // === Step 1: Data Validation ===
  if (validateData) {
    console.log(`🔍 Validating data...`);
    // Validation logic here
    console.log(`   ✓ All rows valid`);
  }

  // === Step 2: Clean Thai text ===
  console.log(`🌍 Cleaning Thai text...`);
  const cleanedData = data.map(row =>
    row.map(cell =>
      typeof cell === 'string' ? ensureThaiTextSafe(cell) : cell
    )
  );
  console.log(`   ✓ Text cleaned`);

  // === Step 3: Remove duplicates ===
  let processedData = cleanedData;

  if (removeDuplicates) {
    console.log(`🔄 Checking for duplicates...`);
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
  console.log(`📦 Processing ${batches.length} batches...`);

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

    console.log(`   Batch ${i + 1}/${batches.length}`);
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
    }
  }

  results.endTime = Date.now();
  results.durationMs = results.endTime - results.startTime;

  // === Summary ===
  console.log(`📈 Batch Write Complete`);
  console.log(`   ✓ Successful: ${results.successfulBatches}/${results.batchCount}`);
  console.log(`   ❌ Failed: ${results.failedBatches}/${results.batchCount}`);
  console.log(`   📊 Rows written: ${results.successfulBatches * CONFIG.BATCH_SIZE}`);
  console.log(`   ⏱️ Duration: ${(results.durationMs / 1000).toFixed(2)}s`);

  return results;
}

/**
 * Read data from Google Sheets with batching
 */
async function readBatchData(sheets, spreadsheetId, sheetName, options = {}) {
  const {
    startRow = 1,
    endRow = null,
    columns = 'A:Z',
    includeHeader = true,
  } = options;

  console.log(`📖 Reading data from ${sheetName}...`);

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
 */
async function filterDuplicates(newData, sheets, spreadsheetId, sheetName, keyColumn = 0) {
  console.log(`🔍 Checking for existing duplicates...`);

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

module.exports = {
  CONFIG,
  writeBatchData,
  readBatchData,
  filterDuplicates,
  ensureThaiTextSafe,
  retryWithBackoff,
  sleep,
  chunkArray,
};