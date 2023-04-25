export interface Ok<V> {
  readonly ok: true;
  readonly value: V;
}

export const Ok = <const V>(value: V) => ({ ok: true, value } as Ok<V>);

export interface Err<M, C> {
  readonly ok: false;
  readonly message: M;
  readonly cause: C;
}

export const Err = <const M = "An error occured", const C = unknown>(message?: M, cause?: C) =>
  ({ ok: false, message: message ?? "An error occured", cause } as Err<M, C>);

