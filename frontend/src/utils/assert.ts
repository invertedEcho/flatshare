export function getDefinedValueOrThrow<TValue>(
  value: TValue | undefined | null,
): TValue {
  if (value === undefined || value === null) {
    throw new Error('Expected value to be defined, got undefined | null.');
  }
  return value;
}
