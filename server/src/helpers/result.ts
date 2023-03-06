/** Positive Result type
 * 
 * Implies operation success
 */
export const Ok = <const T>(data: T) => ({ok: true, data}) as const;
/** Negative Result type
 * 
 * Implies operation failure
 */
export const Err = <const T, const E>(message: T, cause?: E) => ({ok: false, message, cause}) as const;