export interface Ok<T> {
  readonly ok: true;
  readonly value: T;
}
/** Positive Result type
 * 
 * Implies operation success
 */
export const Ok = <const T>(value: T): Ok<T> => ({ok: true, value}) as const;

export interface Err<M, C> {
  readonly ok: false;
  readonly message: M;
  readonly cause?: C;
}
/** Negative Result type
 * 
 * Implies operation failure
 */
export const Err = <const M, const C>(message: M, cause?: C): Err<M, C> => ({ok: false, message, cause}) as const;