/**
 * Freezes the given options object to prevent modifications.
 * If the options object is null or undefined, it returns an empty frozen object.
 */
export function freezeOptions<T>(options: T): Readonly<T> {
  return options
    ? Object.freeze({ ...options })
    : (Object.freeze({}) as Readonly<T>);
}
