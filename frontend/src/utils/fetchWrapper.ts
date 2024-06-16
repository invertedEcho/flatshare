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
    // @ts-expect-error Implement type safe environment variables
    const url = `${process.env.EXPO_PUBLIC_API_URL}/api/${endpoint}`;
    console.log({ url });
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
    return response;
  };
}
