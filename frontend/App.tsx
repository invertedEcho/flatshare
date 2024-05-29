import Ionicons from "@expo/vector-icons/Ionicons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";
import "./public/tailwind.css";
import StorageWrapper from "./src/utils/StorageWrapper";
import { fetchWrapper } from "./src/utils/fetchWrapper";
import { LoginScreen } from "./src/screens/login";
import AuthContextProvider from "./src/auth-context";
import { View } from "react-native";
import { RegisterScreen } from "./src/screens/register";
import * as Linking from "expo-linking";
import { FontAwesome6 } from "@expo/vector-icons";

export type RootStackParamList = {
  Home: undefined;
  AssignTask: undefined;
  CreateTask: undefined;
  Register: undefined;
  Login: undefined;
  MyAssignments: undefined;
  AllTasks: undefined;
  CreateTaskGroup: undefined;
  Group: undefined;
};

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./public/tailwind.css";
import Toast from "react-native-toast-message";
import { DefaultTheme, NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AssigmentsScreen } from "./src/screens/assignments";
import { CreateTaskScreen } from "./src/screens/create-task";
import AllTasksScreen from "./src/screens/all-tasks";
import { CreateTaskGroupScreen } from "./src/screens/create-task-group";
import { z } from "zod";
import { Menu } from "react-native-material-menu";
import { LogoutButton } from "./src/components/log-out-button";
import { MenuAnchor } from "./src/components/burger-menu-content";
import { GroupInviteScreen } from "./src/screens/group-invite-screen";
import { getIconNameForRouteName } from "./src/utils/routes";

const BottomTabNavigator = createBottomTabNavigator<RootStackParamList>();

const profileSchema = z.object({
  userId: z.number(),
  groupId: z.number().nullable(),
});

const prefix = Linking.createURL("/");

const queryClient = new QueryClient();

export default function App() {
  const [user, setUser] = React.useState<
    { userId: number; groupId: number | null } | undefined
  >();
  const [menuVisible, setMenuVisible] = React.useState(false);

  const linking = {
    prefixes: [prefix],
  };

  // TODO: I dont like this useEffect
  React.useEffect(() => {
    (async () => {
      const jwtMaybe = await StorageWrapper.getItem("jwt-token");
      if (jwtMaybe) {
        try {
          const res = await fetchWrapper.get("profile");
          const body = await res.json();
          const parsed = profileSchema.parse(body);
          setUser(parsed);
        } catch (error) {
          console.error({ loc: "Failed to get profile" }, error);
        }
      }
    })();
  }, []);

  return (
    <AuthContextProvider setUser={setUser} user={user}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <NavigationContainer
            theme={{
              ...DefaultTheme,
              colors: { ...DefaultTheme.colors, background: "#0F172A" },
            }}
            linking={linking}
          >
            <BottomTabNavigator.Navigator
              initialRouteName="MyAssignments"
              screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                  const iconName = getIconNameForRouteName(route.name, focused);
                  if (route.name === "Group") {
                    return (
                      <FontAwesome6 name="user-group" size={24} color="black" />
                    );
                  }
                  return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: "#3aaaef",
                tabBarInactiveTintColor: "gray",
                headerRight: () => (
                  <>
                    {user !== undefined && (
                      <Menu
                        visible={menuVisible}
                        anchor={
                          <MenuAnchor
                            onPress={() => setMenuVisible(!menuVisible)}
                          />
                        }
                        onRequestClose={() => setMenuVisible(false)}
                      >
                        <View
                          style={{
                            justifyContent: "center",
                          }}
                        >
                          <LogoutButton
                            onClick={() => {
                              StorageWrapper.deleteItem("jwt-token");
                              setUser(undefined);
                            }}
                          />
                        </View>
                      </Menu>
                    )}
                  </>
                ),
                headerRightContainerStyle: { marginRight: 25 },
                // This causes layout shift on android, but the screen transition animation depends on it
                // unmountOnBlur: true,
              })}
            >
              {user === undefined && (
                <>
                  <BottomTabNavigator.Screen
                    name="Login"
                    component={LoginScreen}
                  />
                  <BottomTabNavigator.Screen
                    name="Register"
                    component={RegisterScreen}
                  />
                </>
              )}
              {user !== undefined && user.groupId === null && (
                <BottomTabNavigator.Screen
                  name="Group"
                  options={{ title: "Group" }}
                >
                  {() => (
                    <GroupInviteScreen groupId={user.groupId ?? undefined} />
                  )}
                </BottomTabNavigator.Screen>
              )}
              {user !== undefined && user.groupId !== null ? (
                <>
                  <BottomTabNavigator.Screen
                    name="MyAssignments"
                    options={{ title: "My Assignments" }}
                    component={AssigmentsScreen}
                  />
                  <BottomTabNavigator.Screen
                    name="CreateTask"
                    options={{ title: "Create a task" }}
                    component={CreateTaskScreen}
                  />
                  <BottomTabNavigator.Screen
                    name="AllTasks"
                    component={AllTasksScreen}
                    options={{ title: "All Tasks" }}
                  />
                  <BottomTabNavigator.Screen
                    name="CreateTaskGroup"
                    component={CreateTaskGroupScreen}
                    options={{ title: "Create a Task Group" }}
                  />
                </>
              ) : (
                <></>
              )}
            </BottomTabNavigator.Navigator>
          </NavigationContainer>
          <Toast />
        </SafeAreaProvider>
      </QueryClientProvider>
    </AuthContextProvider>
  );
}
