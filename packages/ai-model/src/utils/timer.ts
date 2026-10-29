/**
 * High-resolution execution timing helper.
 * Returns a callback that, when invoked, returns milliseconds elapsed.
 */
export function startTimer(): () => number {
  const start = performance.now();
  return () => {
    const elapsed = performance.now() - start;
    return parseFloat(elapsed.toFixed(2));
  };
}
