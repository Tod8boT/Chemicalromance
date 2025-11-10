// ===== TEST: CC_ID2 with CC_ID1 Vertical Format Data =====
// Test buildCloudinaryURLFromVertical() with sample data from CC_ID1

const { buildCloudinaryURLFromVertical, DEFAULTS } = require('./code/cloudinary_url_builder.js');

console.log('🧪 Testing CC_ID2 with CC_ID1 Sample Data\n');
console.log('=' .repeat(80));

// === SAMPLE DATA FROM CC_ID1 ===
// Example 1: User 123 - 3 text sets (complete)
const sampleData1 = [
  { user_id: '123', text_set: '1', setting_type: 'text', value: 'ลด 70% วันนี้!', updated_at: '2025-11-09T12:00:00Z' },
  { user_id: '123', text_set: '1', setting_type: 'fontsize', value: '90', updated_at: '2025-11-09T12:00:00Z' },
  { user_id: '123', text_set: '1', setting_type: 'position', value: 'north', updated_at: '2025-11-09T12:00:00Z' },
  { user_id: '123', text_set: '1', setting_type: 'color', value: 'FF0000', updated_at: '2025-11-09T12:00:00Z' },
  { user_id: '123', text_set: '1', setting_type: 'stroke', value: '8', updated_at: '2025-11-09T12:00:00Z' },
  { user_id: '123', text_set: '1', setting_type: 'strokecolor', value: 'FFD700', updated_at: '2025-11-09T12:00:00Z' },
  { user_id: '123', text_set: '1', setting_type: 'arc', value: '-15', updated_at: '2025-11-09T12:00:00Z' },
  { user_id: '123', text_set: '2', setting_type: 'text', value: 'CREMO ICE CREAM', updated_at: '2025-11-09T12:05:00Z' },
  { user_id: '123', text_set: '2', setting_type: 'fontsize', value: '70', updated_at: '2025-11-09T12:05:00Z' },
  { user_id: '123', text_set: '2', setting_type: 'position', value: 'center', updated_at: '2025-11-09T12:05:00Z' },
  { user_id: '123', text_set: '2', setting_type: 'color', value: 'FFFFFF', updated_at: '2025-11-09T12:05:00Z' },
  { user_id: '123', text_set: '2', setting_type: 'stroke', value: '5', updated_at: '2025-11-09T12:05:00Z' },
  { user_id: '123', text_set: '2', setting_type: 'strokecolor', value: '000000', updated_at: '2025-11-09T12:05:00Z' },
  { user_id: '123', text_set: '2', setting_type: 'arc', value: '30', updated_at: '2025-11-09T12:05:00Z' },
  { user_id: '123', text_set: '3', setting_type: 'text', value: 'สั่งเลย!', updated_at: '2025-11-09T12:10:00Z' },
  { user_id: '123', text_set: '3', setting_type: 'fontsize', value: '60', updated_at: '2025-11-09T12:10:00Z' },
  { user_id: '123', text_set: '3', setting_type: 'position', value: 'south', updated_at: '2025-11-09T12:10:00Z' },
  { user_id: '123', text_set: '3', setting_type: 'color', value: 'FFDD17', updated_at: '2025-11-09T12:10:00Z' }
];

// Example 2: User 456 - only text set 1 (minimal settings)
const sampleData2 = [
  { user_id: '456', text_set: '1', setting_type: 'text', value: 'FLASH SALE', updated_at: '2025-11-09T13:00:00Z' },
  { user_id: '456', text_set: '1', setting_type: 'fontsize', value: '100', updated_at: '2025-11-09T13:00:00Z' },
  { user_id: '456', text_set: '1', setting_type: 'position', value: 'center', updated_at: '2025-11-09T13:00:00Z' },
  { user_id: '456', text_set: '1', setting_type: 'color', value: 'FF0000', updated_at: '2025-11-09T13:00:00Z' }
];

// Example 3: User 789 - text set 1 and 3 (skip text set 2)
const sampleData3 = [
  { user_id: '789', text_set: '1', setting_type: 'text', value: 'Success Story', updated_at: '2025-11-09T14:00:00Z' },
  { user_id: '789', text_set: '1', setting_type: 'fontsize', value: '80', updated_at: '2025-11-09T14:00:00Z' },
  { user_id: '789', text_set: '1', setting_type: 'position', value: 'north', updated_at: '2025-11-09T14:00:00Z' },
  { user_id: '789', text_set: '1', setting_type: 'color', value: 'FFFFFF', updated_at: '2025-11-09T14:00:00Z' },
  { user_id: '789', text_set: '1', setting_type: 'stroke', value: '5', updated_at: '2025-11-09T14:00:00Z' },
  { user_id: '789', text_set: '1', setting_type: 'arc', value: '30', updated_at: '2025-11-09T14:00:00Z' },
  { user_id: '789', text_set: '3', setting_type: 'text', value: 'Learn More →', updated_at: '2025-11-09T14:05:00Z' },
  { user_id: '789', text_set: '3', setting_type: 'fontsize', value: '50', updated_at: '2025-11-09T14:05:00Z' },
  { user_id: '789', text_set: '3', setting_type: 'position', value: 'south_east', updated_at: '2025-11-09T14:05:00Z' },
  { user_id: '789', text_set: '3', setting_type: 'color', value: '17539F', updated_at: '2025-11-09T14:05:00Z' }
];

// === TEST CASES ===

console.log('\n📋 TEST 1: User 123 - Complete (3 text sets)');
console.log('-'.repeat(80));
try {
  const result1 = buildCloudinaryURLFromVertical(sampleData1, '123');
  console.log('✅ SUCCESS');
  console.log('\n📊 Result:');
  console.log('  Layer count:', result1.layer_count);
  console.log('  URL length:', result1.url_template.length);
  console.log('\n🔗 URL Template:');
  console.log('  ', result1.url_template);
  console.log('\n🎨 Transformation String:');
  console.log('  ', result1.transformation_string);
  console.log('\n📝 Breakdown:');
  console.log('  ', JSON.stringify(result1.breakdown, null, 2));
} catch (error) {
  console.log('❌ FAILED:', error.message);
}

console.log('\n' + '='.repeat(80));
console.log('\n📋 TEST 2: User 456 - Minimal (1 text set, missing settings)');
console.log('-'.repeat(80));
try {
  const result2 = buildCloudinaryURLFromVertical(sampleData2, '456');
  console.log('✅ SUCCESS');
  console.log('\n📊 Result:');
  console.log('  Layer count:', result2.layer_count);
  console.log('  URL length:', result2.url_template.length);
  console.log('\n🔗 URL Template:');
  console.log('  ', result2.url_template);
  console.log('\n✅ Defaults Applied:');
  console.log('  - stroke: 0 (no stroke)');
  console.log('  - strokecolor: 000000');
  console.log('  - arc: 0 (flat)');
  console.log('  - font: Mitr');
  console.log('  - weight: bold');
  console.log('  - align: center');
} catch (error) {
  console.log('❌ FAILED:', error.message);
}

console.log('\n' + '='.repeat(80));
console.log('\n📋 TEST 3: User 789 - Skip Text Set (1 and 3, no 2)');
console.log('-'.repeat(80));
try {
  const result3 = buildCloudinaryURLFromVertical(sampleData3, '789');
  console.log('✅ SUCCESS');
  console.log('\n📊 Result:');
  console.log('  Layer count:', result3.layer_count);
  console.log('  Text set 2 skipped: OK');
  console.log('\n🔗 URL Template:');
  console.log('  ', result3.url_template);
  console.log('\n📝 Breakdown:');
  console.log('  layer1:', result3.breakdown.layer1);
  console.log('  layer2:', result3.breakdown.layer2);
  console.log('  layer3:', result3.breakdown.layer3);
} catch (error) {
  console.log('❌ FAILED:', error.message);
}

console.log('\n' + '='.repeat(80));
console.log('\n📊 DEFAULTS Verification');
console.log('-'.repeat(80));
console.log(JSON.stringify(DEFAULTS, null, 2));

console.log('\n' + '='.repeat(80));
console.log('\n✅ All tests completed!\n');
