import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Assigments } from "./src/screens/assignments";
import { CreateTaskScreen } from "./src/screens/create-task";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./public/tailwind.css";
import Toast from "react-native-toast-message";

export type RootStackParamList = {
  Home: undefined;
  AssignTask: undefined;
};
const Tab = createBottomTabNavigator();

type IconGlyph = keyof typeof Ionicons.glyphMap;

function getIconName(
  routeName: string,
  focused: boolean,
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
        </Tab.Navigator>
        <Toast />
      </NavigationContainer>
    </QueryClientProvider>
  );
}
