import * as React from "react";

type User = {
  userId: number;
  email: string;
  groupId: number | null;
};

export const AuthContext = React.createContext<{
  user: User | undefined;
  setUser: React.Dispatch<React.SetStateAction<User | undefined>>;
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
  user: User | undefined;
  setUser: React.Dispatch<React.SetStateAction<User | undefined>>;
}) {
  const contextValue = React.useMemo(() => {
    return { user, setUser };
  }, [user]);

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}
