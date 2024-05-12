import Ionicons from "@expo/vector-icons/Ionicons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import Toast from "react-native-toast-message";
import "./public/tailwind.css";
import { Assigments } from "./src/screens/assignments";
import { CreateTaskScreen } from "./src/screens/create-task";
import StorageWrapper from "./src/utils/StorageWrapper";
import { fetchWrapper } from "./src/utils/fetchWrapper";
import { LoginScreen } from "./src/screens/login";
import { AuthContext } from "./src/auth-context";
import { Pressable, Text, View } from "react-native";
import { RegisterScreen } from "./src/screens/register";

export type RootStackParamList = {
  Home: undefined;
  AssignTask: undefined;
  CreateTask: undefined;
  Register: undefined;
  Login: undefined;
  MyAssignments: undefined;
};

const Tab = createBottomTabNavigator<RootStackParamList>();

type IconGlyph = keyof typeof Ionicons.glyphMap;

function getIconName(
  routeName: string,
  focused: boolean
): IconGlyph | undefined {
  switch (routeName) {
    case "MyAssignments":
      return focused ? "home" : "home-outline";
    case "CreateTask":
      return focused ? "list" : "list-outline";
    case "Login":
      return focused ? "log-in" : "log-in-outline";
    case "Register":
      return focused ? "create" : "create-outline";
    default:
      return undefined;
  }
}

const queryClient = new QueryClient();

export default function App() {
  const [isAuthorized, setIsAuthorized] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      const jwtMaybe = await StorageWrapper.getItem("jwt-token");
      if (!jwtMaybe) {
        setIsAuthorized(false);
      } else {
        try {
          await fetchWrapper.get("profile");
          setIsAuthorized(true);
        } catch {
          setIsAuthorized(false);
        }
      }
    })();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthorized, setIsAuthorized }}>
      <QueryClientProvider client={queryClient}>
        <NavigationContainer>
          <Tab.Navigator
            initialRouteName="CreateTask"
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
                <Tab.Screen name="Login" component={LoginScreen} />
                <Tab.Screen name="Register" component={RegisterScreen} />
              </>
            )}
            {isAuthorized && (
              <>
                <Tab.Screen
                  name="MyAssignments"
                  options={{ title: "My Assignments" }}
                  component={Assigments}
                />
                <Tab.Screen
                  name="CreateTask"
                  options={{ title: "Create a task" }}
                  component={CreateTaskScreen}
                />
              </>
            )}
          </Tab.Navigator>
          <Toast />
        </NavigationContainer>
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
