import { predictField } from '../src/predict/predict';
import { predictFieldBatch } from '../src/predict/batchPredict';
import { modelLoader } from '../src/loader/modelLoader';
import { predictionCache } from '../src/cache/predictionCache';

async function main() {
  console.log('--- 🧪 MiniLM Inference Smoke Test ---');

  const testField = {
    visibleLabel: 'First Name',
    placeholder: 'Enter first name',
    fieldName: 'first_name',
    fieldType: 'text',
    ariaLabel: 'First Name',
    nearbyText: 'Required personal information',
    sectionHeading: 'Basic Details',
    pageTitle: 'Job Application Form',
    portalDomain: 'greenhouse.io',
  };

  const emailField = {
    ...testField,
    visibleLabel: 'Email Address',
    placeholder: 'you@example.com',
    fieldName: 'email',
    fieldType: 'email',
    ariaLabel: 'Email',
  };

  try {
    console.log('Executing prediction...');
    const result = await predictField(testField);
    console.log(`Prediction completed successfully in ${result.executionTimeMs}ms!`);
    console.log('Ranked Predictions:', JSON.stringify(result.predictions, null, 2));

    if (result.predictions.length === 0) {
      throw new Error('Smoke test failed: model returned 0 predictions.');
    }
    if (result.cached !== false) {
      throw new Error('Smoke test failed: first prediction should not be cached.');
    }

    // Cache path: identical input must be served from cache
    const repeat = await predictField(testField);
    if (repeat.cached !== true) {
      throw new Error('Smoke test failed: repeated prediction was not served from cache.');
    }
    console.log('Cache verified: repeated request served from prediction cache.');

    // Batch path: one cached field + one fresh field
    const batch = await predictFieldBatch([testField, emailField]);
    if (batch.length !== 2) {
      throw new Error(`Smoke test failed: batch returned ${batch.length} results, expected 2.`);
    }
    if (batch[0]!.cached !== true) {
      throw new Error('Smoke test failed: batch did not reuse the cached field.');
    }
    if (batch[1]!.cached !== false) {
      throw new Error('Smoke test failed: fresh batch field should not be cached.');
    }
    console.log('Batch verified: cache hits and fresh inference mixed correctly.');
    console.log('Cache stats:', JSON.stringify(predictionCache.getStats()));

    const health = modelLoader.getHealth();
    console.log('Model Health Status:', JSON.stringify(health, null, 2));
    console.log('Runtime Stats:', JSON.stringify(modelLoader.getStats()));

    console.log('✅ Smoke test PASSED successfully.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Smoke test FAILED:', error);
    process.exit(1);
  }
}

main();
