import * as React from "react";

export const AuthContext = React.createContext<{
  user: { userId: number; groupId: number | null } | undefined;
  setUser: React.Dispatch<
    React.SetStateAction<
      | {
          userId: number;
          groupId: number | null;
        }
      | undefined
    >
  >;
}>({
  user: undefined,
  setUser: () => {},
});

export default function AuthContextProvider({
  children,
  user,
  setUser,
}: {
  children: React.ReactNode;
  user: { userId: number; groupId: number | null } | undefined;
  setUser: React.Dispatch<
    React.SetStateAction<
      | {
          userId: number;
          groupId: number | null;
        }
      | undefined
    >
  >;
}) {
  const contextValue = React.useMemo(() => {
    return { user, setUser };
  }, [user]);

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}
