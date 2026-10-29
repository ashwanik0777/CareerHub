// ────────────────────────────────────────────────────────────────────────────
// Benchmark CLI — Run Benchmarks from the Command Line
// ────────────────────────────────────────────────────────────────────────────
// Usage: node dist/benchmarking/run-benchmarks.js
// ────────────────────────────────────────────────────────────────────────────

import { BenchmarkRunner } from './index';

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

function formatMs(value: number): string {
  return `${value.toFixed(2)}ms`;
}

function printSeparator(char = '─', length = 72): void {
  console.log(char.repeat(length));
}

function printHeader(title: string): void {
  console.log();
  printSeparator('═');
  console.log(`  ${title}`);
  printSeparator('═');
}

function main(): void {
  printHeader('🧠 Semantic Field Engine — Benchmark Report');
  console.log();

  const runner = new BenchmarkRunner();

  // ── Overall Benchmark ──
  console.log('Running full benchmark suite...\n');
  const overall = runner.run();

  console.log('  📊 Overall Results:');
  printSeparator();
  console.log(`  Dataset Size:      ${overall.datasetSize} test cases`);
  console.log(`  Strategy:          ${overall.strategy}`);
  console.log(`  Accuracy:          ${formatPercent(overall.accuracy)}`);
  console.log(`  Precision:         ${formatPercent(overall.precision)}`);
  console.log(`  Recall:            ${formatPercent(overall.recall)}`);
  console.log(`  F1 Score:          ${formatPercent(overall.f1Score)}`);
  console.log(`  Avg Inference:     ${formatMs(overall.avgInferenceTimeMs)}`);
  printSeparator();

  // ── Per-Field Details ──
  console.log('\n  📋 Per-Field Results:');
  printSeparator();
  console.log(
    '  ' +
      'ID'.padEnd(10) +
      'Expected'.padEnd(30) +
      'Predicted'.padEnd(30) +
      'Conf'.padEnd(8) +
      'Result',
  );
  printSeparator();

  for (const detail of overall.detailedResults) {
    const resultIcon = detail.correct ? '✅' : '❌';
    console.log(
      '  ' +
        detail.fieldId.padEnd(10) +
        detail.expectedAttributeId.padEnd(30) +
        detail.predictedAttributeId.padEnd(30) +
        formatPercent(detail.confidence).padEnd(8) +
        resultIcon,
    );
  }

  // ── Per-Platform Breakdown ──
  printHeader('📊 Per-Platform Breakdown');
  const platformResults = runner.runByPlatform();

  for (const [platform, result] of platformResults.entries()) {
    console.log(`\n  🏢 ${platform.toUpperCase()} (${result.datasetSize} cases)`);
    printSeparator('─', 50);
    console.log(`    Accuracy:    ${formatPercent(result.accuracy)}`);
    console.log(`    Precision:   ${formatPercent(result.precision)}`);
    console.log(`    Recall:      ${formatPercent(result.recall)}`);
    console.log(`    F1 Score:    ${formatPercent(result.f1Score)}`);
    console.log(`    Avg Time:    ${formatMs(result.avgInferenceTimeMs)}`);
  }

  // ── Summary ──
  printHeader('✅ Benchmark Complete');
  console.log(`\n  Total test cases: ${overall.datasetSize}`);
  console.log(`  Correct: ${overall.detailedResults.filter(d => d.correct).length}`);
  console.log(`  Incorrect: ${overall.detailedResults.filter(d => !d.correct).length}`);
  console.log();
}

main();
