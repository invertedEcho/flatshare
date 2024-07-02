import StorageWrapper from './StorageWrapper';

export const fetchWrapper = {
  get: getAuthorizedFetcher('GET'),
  post: getAuthorizedFetcher('POST'),
  delete: getAuthorizedFetcher('DELETE'),
  put: getAuthorizedFetcher('PUT'),
  patch: getAuthorizedFetcher('PATCH'),
};

function getAuthorizedFetcher(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
) {
  return async (endpoint: string, options?: RequestInit) => {
    const jwtToken = await StorageWrapper.getItem('jwt-token');
    const url = `${process.env.EXPO_PUBLIC_API_URL}/api/${endpoint}`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      method,
      ...options,
    });
    return response;
  };
}
