import StorageWrapper from "./StorageWrapper";

export const fetchWrapper = {
  get: getAuthorizedFetcher("GET"),
  post: getAuthorizedFetcher("POST"),
  delete: getAuthorizedFetcher("DELETE"),
  put: getAuthorizedFetcher("PUT"),
  patch: getAuthorizedFetcher("PATCH"),
};

function getAuthorizedFetcher(
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
) {
  return async (endpoint: string, data?: any, options?: RequestInit) => {
    const jwtToken = await StorageWrapper.getItem("jwt-token");
    console.debug({ data });
    return fetch(`${process.env.EXPO_PUBLIC_API_URL}/${endpoint}`, {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
        "Content-Type": "application/json",
        ...options?.headers,
      },
      method,
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    }).then(async (res) => {
      if (!res.ok) {
        throw new Error(await res.json());
      }
      // Maybe returning the json here is to explicit, could change in future
      return res;
    });
  };
}
