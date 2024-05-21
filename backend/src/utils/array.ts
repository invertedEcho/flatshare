/**
 * Returns a random value from an array of data.
 *
 * @param array - An array of data from which to select a random value.
 * @returns A random value from the array.
 */
export function randomFromArray<TItem>(array: readonly TItem[]) {
  const randomIndex = Math.floor(Math.random() * array.length);
  const randomValue = array[randomIndex];
  return randomValue;
}
