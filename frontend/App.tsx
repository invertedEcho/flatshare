import Ionicons from "@expo/vector-icons/Ionicons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";
import "./public/tailwind.css";
import StorageWrapper from "./src/utils/StorageWrapper";
import { fetchWrapper } from "./src/utils/fetchWrapper";
import { LoginScreen } from "./src/screens/login";
import { AuthContext } from "./src/auth-context";
import { Pressable } from "react-native";
import { RegisterScreen } from "./src/screens/register";
import * as Linking from "expo-linking";

export type RootStackParamList = {
  Home: undefined;
  AssignTask: undefined;
  CreateTask: undefined;
  Register: undefined;
  Login: undefined;
  MyAssignments: undefined;
  AllTasks: undefined;
  CreateTaskGroup: undefined;
};

import { AssigmentsScreen } from "./src/screens/assignments";
import { CreateTaskScreen } from "./src/screens/create-task";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./public/tailwind.css";
import Toast from "react-native-toast-message";
import AllTasksScreen from "./src/screens/all-tasks";
import { NavigationContainer } from "@react-navigation/native";
import { CreateTaskGroupScreen } from "./src/screens/create-task-group";
import { SafeAreaProvider } from "react-native-safe-area-context";

const BottomTabNavigator = createBottomTabNavigator<RootStackParamList>();

type IconGlyph = keyof typeof Ionicons.glyphMap;

function getIconName(
  routeName: string,
  focused: boolean,
): IconGlyph | undefined {
  switch (routeName) {
    case "MyAssignments":
      return focused ? "home" : "home-outline";
    case "AllTasks":
      return focused ? "list" : "list-outline";
    case "Login":
      return focused ? "log-in" : "log-in-outline";
    case "Register":
      return focused ? "create" : "create-outline";
    case "CreateTask":
      return focused ? "add" : "add-outline";
    default:
      return undefined;
  }
}

const prefix = Linking.createURL("/");

const queryClient = new QueryClient();

export default function App() {
  const [isAuthorized, setIsAuthorized] = React.useState(false);
  const [userId, setUserId] = React.useState<number>();

  const linking = {
    prefixes: [prefix],
  };

  // TODO: We should investigate on how to properly auth in react native
  React.useEffect(() => {
    (async () => {
      const jwtMaybe = await StorageWrapper.getItem("jwt-token");
      if (!jwtMaybe) {
        setIsAuthorized(false);
      } else {
        try {
          const res = await fetchWrapper.get("profile");
          const user = await res.json();
          setUserId(user.userId);
          setIsAuthorized(true);
        } catch {
          setIsAuthorized(false);
        }
      }
    })();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthorized, setIsAuthorized, userId }}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <NavigationContainer linking={linking}>
            <BottomTabNavigator.Navigator
              initialRouteName="CreateTaskGroup"
              screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                  const iconName = getIconName(route.name, focused);
                  return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: "tomato",
                tabBarInactiveTintColor: "gray",
                headerRight: () => (
                  <>
                    {isAuthorized && (
                      <LogoutButton
                        onClick={() => {
                          StorageWrapper.deleteItem("jwt-token");
                          setIsAuthorized(false);
                        }}
                      />
                    )}
                  </>
                ),
                headerRightContainerStyle: { marginRight: 20 },
              })}
            >
              {!isAuthorized && (
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
              {isAuthorized && (
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
              )}
            </BottomTabNavigator.Navigator>
            <Toast />
          </NavigationContainer>
        </SafeAreaProvider>
      </QueryClientProvider>
    </AuthContext.Provider>
  );
}

function LogoutButton({ onClick }: { onClick(): void }) {
  return (
    <Pressable onPress={onClick}>
      <Ionicons name="log-out-outline" size={25} />
    </Pressable>
  );
}
