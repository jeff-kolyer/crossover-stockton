const fs = require('fs');
const path = require('path');
const Ajv = require('ajv/dist/2020');
const addFormats = require('ajv-formats');

const schemaPath = path.join(__dirname, '../public/schema/crossover.resources.schema.json');
const dataPath = path.join(__dirname, '../public/api/v1/resources.json');

const schemaData = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
const resourceData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

const validate = ajv.compile(schemaData);
const valid = validate(resourceData);

if (!valid) {
    console.log(`❌ Validation Failed! Found ${validate.errors.length} errors.`);
    // Group errors by resource ID for better readability
    const errorsByResource = {};

    validate.errors.forEach(err => {
        // e.g., /resources/1/compatibility
        const match = err.instancePath.match(/^\/resources\/(\d+)/);
        let resourceId = 'Unknown';
        if (match && match[1]) {
            const index = parseInt(match[1], 10);
            if (resourceData.resources && resourceData.resources[index]) {
                resourceId = resourceData.resources[index].id || `Index ${index}`;
            }
        }

        if (!errorsByResource[resourceId]) {
            errorsByResource[resourceId] = [];
        }
        errorsByResource[resourceId].push(`${err.instancePath} ${err.message}`);
    });

    for (const [id, errs] of Object.entries(errorsByResource)) {
        console.log(`\n🔴 Resource: ${id}`);
        errs.forEach(e => console.log(`   - ${e}`));
    }

    process.exit(1);
} else {
    console.log("✅ Validation Passed! 0 Schema Errors.");
    process.exit(0);
}
