#!/usr/bin/env node

/**
 * n8n Workflow Validator
 *
 * Validates n8n workflow JSON files for:
 * - JSON syntax
 * - Required fields
 * - Node structure
 * - Connections
 * - Placeholders that need to be replaced
 *
 * Usage: node validate-workflow.js <workflow.json>
 */

const fs = require('fs');
const path = require('path');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function error(message) {
  log(`❌ ${message}`, 'red');
}

function success(message) {
  log(`✅ ${message}`, 'green');
}

function warning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function info(message) {
  log(`ℹ️  ${message}`, 'cyan');
}

// Validation functions
function validateJSON(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const workflow = JSON.parse(content);
    success('JSON syntax valid');
    return workflow;
  } catch (err) {
    error(`Invalid JSON: ${err.message}`);
    process.exit(1);
  }
}

function validateRequiredFields(workflow) {
  const required = ['name', 'nodes', 'connections', 'active', 'settings', 'versionId', 'id'];
  const missing = required.filter(field => !workflow[field]);

  if (missing.length > 0) {
    error(`Missing required fields: ${missing.join(', ')}`);
    return false;
  }

  success('All required fields present');
  return true;
}

function validateNodes(workflow) {
  const errors = [];
  const warnings = [];
  const nodeIds = new Set();
  const nodeNames = new Set();

  workflow.nodes.forEach((node, index) => {
    const nodeLabel = `Node ${index} (${node.name || 'unnamed'})`;

    // Check required fields
    if (!node.id) errors.push(`${nodeLabel}: missing 'id'`);
    if (!node.name) errors.push(`${nodeLabel}: missing 'name'`);
    if (!node.type) errors.push(`${nodeLabel}: missing 'type'`);
    if (!node.typeVersion) errors.push(`${nodeLabel}: missing 'typeVersion'`);
    if (!node.position) errors.push(`${nodeLabel}: missing 'position'`);

    // Check duplicate IDs
    if (node.id) {
      if (nodeIds.has(node.id)) {
        errors.push(`Duplicate node ID: ${node.id}`);
      }
      nodeIds.add(node.id);
    }

    // Check duplicate names
    if (node.name) {
      if (nodeNames.has(node.name)) {
        warnings.push(`Duplicate node name: ${node.name} (may cause connection issues)`);
      }
      nodeNames.add(node.name);
    }

    // Check for placeholder values in credentials
    if (node.credentials) {
      Object.keys(node.credentials).forEach(credType => {
        const cred = node.credentials[credType];
        if (cred.id && (
          cred.id.includes('YOUR_') ||
          cred.id.includes('PLACEHOLDER') ||
          cred.id === 'XXX'
        )) {
          warnings.push(`${nodeLabel}: Placeholder credential ID detected - "${cred.id}"`);
        }
      });
    }

    // Check for placeholder values in parameters
    if (node.parameters) {
      const paramStr = JSON.stringify(node.parameters);
      if (paramStr.includes('YOUR_') || paramStr.includes('PLACEHOLDER')) {
        warnings.push(`${nodeLabel}: Placeholder values detected in parameters`);
      }
    }
  });

  if (errors.length > 0) {
    errors.forEach(err => error(err));
    return false;
  }

  if (warnings.length > 0) {
    warnings.forEach(warn => warning(warn));
  }

  success(`All ${workflow.nodes.length} nodes structurally valid`);
  return true;
}

function validateConnections(workflow) {
  const errors = [];
  const nodeNames = new Set(workflow.nodes.map(n => n.name));

  Object.keys(workflow.connections).forEach(sourceName => {
    // Check source node exists
    if (!nodeNames.has(sourceName)) {
      errors.push(`Connection source not found: "${sourceName}"`);
      return;
    }

    const outputs = workflow.connections[sourceName];
    Object.keys(outputs).forEach(outputType => {
      if (!outputs[outputType]) return;

      outputs[outputType].forEach((connections, outputIndex) => {
        if (!connections) return;

        connections.forEach(conn => {
          // Check target node exists
          if (!nodeNames.has(conn.node)) {
            errors.push(`Connection target not found: "${sourceName}" -> "${conn.node}"`);
          }

          // Check connection structure
          if (typeof conn.type !== 'string') {
            errors.push(`Invalid connection type in "${sourceName}" -> "${conn.node}"`);
          }
          if (typeof conn.index !== 'number') {
            errors.push(`Invalid connection index in "${sourceName}" -> "${conn.node}"`);
          }
        });
      });
    });
  });

  if (errors.length > 0) {
    errors.forEach(err => error(err));
    return false;
  }

  success('All connections valid');
  return true;
}

function validateNodeTypes(workflow) {
  const warnings = [];

  // Common n8n node types (not exhaustive)
  const commonTypes = [
    'n8n-nodes-base.scheduleTrigger',
    'n8n-nodes-base.webhook',
    'n8n-nodes-base.googleSheets',
    'n8n-nodes-base.code',
    'n8n-nodes-base.merge',
    'n8n-nodes-base.if',
    'n8n-nodes-base.set',
    'n8n-nodes-base.httpRequest',
    'n8n-nodes-base.telegram',
    'n8n-nodes-base.splitInBatches',
    'n8n-nodes-base.splitOut',
    'n8n-nodes-base.wait',
    '@n8n/n8n-nodes-langchain.openAi',
    '@n8n/n8n-nodes-langchain.chatTrigger',
    '@apify/n8n-nodes-apify.apify'
  ];

  workflow.nodes.forEach(node => {
    if (!commonTypes.includes(node.type)) {
      warnings.push(`Uncommon node type: ${node.type} in "${node.name}" (may require custom installation)`);
    }
  });

  if (warnings.length > 0) {
    warnings.forEach(warn => warning(warn));
  }

  return true;
}

function generateReport(workflow, filePath) {
  info('\n📊 Workflow Summary:');
  console.log(`   Name: ${workflow.name}`);
  console.log(`   ID: ${workflow.id}`);
  console.log(`   Nodes: ${workflow.nodes.length}`);
  console.log(`   Active: ${workflow.active}`);

  // Count node types
  const typeCounts = {};
  workflow.nodes.forEach(node => {
    const baseType = node.type.split('.').pop();
    typeCounts[baseType] = (typeCounts[baseType] || 0) + 1;
  });

  info('\n📦 Node Types:');
  Object.entries(typeCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([type, count]) => {
      console.log(`   ${type}: ${count}`);
    });

  // Find placeholders
  const placeholders = [];
  workflow.nodes.forEach(node => {
    if (node.credentials) {
      Object.entries(node.credentials).forEach(([type, cred]) => {
        if (cred.id && cred.id.includes('YOUR_')) {
          placeholders.push(`${node.name}: ${type} (${cred.id})`);
        }
      });
    }
  });

  if (placeholders.length > 0) {
    warning('\n⚠️  Placeholders to Replace:');
    placeholders.forEach(p => console.log(`   ${p}`));
  }

  info('\n📝 Next Steps:');
  console.log('   1. Import workflow into n8n');
  console.log('   2. Replace placeholder credential IDs');
  console.log('   3. Configure required parameters');
  console.log('   4. Test individual nodes');
  console.log('   5. Execute full workflow');
}

// Main validation function
function validateWorkflow(filePath) {
  log(`\n🔍 Validating: ${path.basename(filePath)}\n`, 'cyan');

  const workflow = validateJSON(filePath);

  let valid = true;
  valid = validateRequiredFields(workflow) && valid;
  valid = validateNodes(workflow) && valid;
  valid = validateConnections(workflow) && valid;
  valid = validateNodeTypes(workflow) && valid;

  generateReport(workflow, filePath);

  if (valid) {
    success('\n✨ Workflow validation passed!');
    info('   Ready for import into n8n (after replacing placeholders)\n');
    process.exit(0);
  } else {
    error('\n❌ Workflow validation failed!');
    info('   Fix errors before importing into n8n\n');
    process.exit(1);
  }
}

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: node validate-workflow.js <workflow.json>');
    console.log('\nExample:');
    console.log('  node validate-workflow.js CC_INTEL_SESSION1/new_workflows/Human_Campaign_Input.json');
    process.exit(1);
  }

  const filePath = args[0];

  if (!fs.existsSync(filePath)) {
    error(`File not found: ${filePath}`);
    process.exit(1);
  }

  validateWorkflow(filePath);
}

module.exports = { validateWorkflow };
