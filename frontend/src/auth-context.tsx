import React, { createContext } from "react";

export const AuthContext = createContext<{
  isAuthorized: boolean;
  setIsAuthorized: React.Dispatch<React.SetStateAction<boolean>>;
  userId?: number;
}>({
  isAuthorized: false,
  setIsAuthorized: () => {},
  userId: undefined,
});
