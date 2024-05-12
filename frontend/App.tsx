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

export type RootStackParamList = {
  Home: undefined;
  AssignTask: undefined;
};
const Tab = createBottomTabNavigator();

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
          })}
        >
          {!isAuthorized && <Tab.Screen name="Login" component={LoginScreen} />}
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
  );
}
