import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "@expo/vector-icons/Ionicons";
import { AssigmentsScreen } from "./src/screens/assignments";
import { CreateTaskScreen } from "./src/screens/create-task";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./public/tailwind.css";
import Toast from "react-native-toast-message";
import AllTasksScreen from "./src/screens/all-tasks";

const BottomTabNavigator = createBottomTabNavigator();

type IconGlyph = keyof typeof Ionicons.glyphMap;

type Screen = { name: string; title: string; component(): React.JSX.Element };

const SCREENS = [
  {
    name: "MyAssignments",
    title: "My Assignments",
    component: AssigmentsScreen,
  },
  {
    name: "CreateTask",
    title: "Create a task",
    component: CreateTaskScreen,
  },
  { name: "AllTasks", title: "All tasks", component: AllTasksScreen },
] satisfies Screen[];

function getIconName(
  routeName: string,
  focused: boolean,
): IconGlyph | undefined {
  switch (routeName) {
    case "MyAssignments":
      return focused ? "home" : "home-outline";
    case "AllTasks":
      return focused ? "list" : "list-outline";
    case "CreateTask":
      return focused ? "add" : "add-outline";
    default:
      return undefined;
  }
}

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <BottomTabNavigator.Navigator
          initialRouteName="AllTasks"
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              const iconName = getIconName(route.name, focused);
              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: "tomato",
            tabBarInactiveTintColor: "gray",
          })}
        >
          {SCREENS.map((screen) => {
            return (
              <BottomTabNavigator.Screen
                name={screen.name}
                options={{ title: screen.title }}
                component={screen.component}
                key={screen.name}
              />
            );
          })}
        </BottomTabNavigator.Navigator>
        <Toast />
      </NavigationContainer>
    </QueryClientProvider>
  );
}
