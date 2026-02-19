/**
 * Arbitrary factory function for object of shape `Shape`.
 */
export type Factory<Shape> = (object?: Partial<Shape>) => Shape;

/**
 * Recursive partial type for deep overrides, preserving Date instances.
 */
export type DeepPartial<T> = T extends Date
  ? T
  : T extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T extends object
      ? { [P in keyof T]?: DeepPartial<T[P]> }
      : T;
