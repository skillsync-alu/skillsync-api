// This function lets you run an async function on each item in an array, one after the other
export function forEachPromise<T>(
  items: T[],
  fn: (value: T, index?: number, array?: T[]) => void
) {
  // We use reduce to chain promises so each fn runs after the previous one
  return items.reduce(function (promise, item, index, array) {
    return promise.then(function () {
      return fn(item, index, array);
    });
  }, Promise.resolve());
}

/**
 * This function is like Array.reduce, but works with async callbacks.
 * It goes through each item, waits for the callback, and passes the result to the next.
 */
export async function asyncReduce<T, Y>(
  items: T[],
  callback: (accumulator: Y, item: T) => Promise<Y>,
  initialValue: Y
) {
  let accumulator = initialValue;

  for (const item of items) {
    // Wait for the callback to finish before moving to the next
    accumulator = await callback(accumulator, item);
  }

  return accumulator;
}
