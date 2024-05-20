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
    const response = await fetch(
      `${process.env.EXPO_PUBLIC_API_URL}/${endpoint}`,
      {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          "Content-Type": "application/json",
          ...options?.headers,
        },
        method,
        body: data ? JSON.stringify(data) : undefined,
        ...options,
      },
    );
    if (!response.ok) {
      throw new Error("response was not ok");
    }

    return response;
  };
}
