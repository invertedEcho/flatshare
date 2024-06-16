import StorageWrapper from "./StorageWrapper";

export const fetchWrapper = {
  get: getAuthorizedFetcher("GET"),
  post: getAuthorizedFetcher("POST"),
  delete: getAuthorizedFetcher("DELETE"),
  put: getAuthorizedFetcher("PUT"),
  patch: getAuthorizedFetcher("PATCH"),
};

function getAuthorizedFetcher(
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
) {
  return async (endpoint: string, data?: any, options?: RequestInit) => {
    const jwtToken = await StorageWrapper.getItem("jwt-token");
    const url = `http://192.168.178.53:3000/api/${endpoint}`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
        "Content-Type": "application/json",
        ...options?.headers,
      },
      method,
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
    if (!response.ok) {
      throw new Error(
        `Request failed: ${response.status} ${await response.text()}`,
      );
    }

    return response;
  };
}
