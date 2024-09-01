export function extractTokenFromAuthHeader(
  authHeader?: string,
  expectedType = 'Bearer',
): string | undefined {
  const [type, token] = authHeader?.split(' ') ?? [];
  return type === expectedType ? token : undefined;
}
