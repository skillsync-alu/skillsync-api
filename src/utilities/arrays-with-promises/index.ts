export function forEachPromise<T>(
  items: T[],
  fn: (value: T, index?: number, array?: T[]) => void
) {
  return items.reduce(function (promise, item, index, array) {
    return promise.then(function () {
      return fn(item, index, array);
    });
  }, Promise.resolve());
}

export async function asyncReduce<T, Y>(
  items: T[],
  callback: (accumulator: Y, item: T) => Promise<Y>,
  initialValue: Y
) {
  let accumulator = initialValue;

  for (const item of items) {
    accumulator = await callback(accumulator, item);
  }

  return accumulator;
}
