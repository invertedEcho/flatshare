import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Assigments } from "./src/screens/home";
import { CreateTaskScreen } from "./src/screens/assign-task";

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
    case "MyTasks":
      return focused ? "home" : "home-outline";
    case "AssignTask":
      return focused ? "list" : "list-outline";
    default:
      return undefined;
  }
}

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="MyTasks"
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            const iconName = getIconName(route.name, focused);
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: "tomato",
          tabBarInactiveTintColor: "gray",
        })}
      >
        <Tab.Screen name="MyTasks" component={Assigments} />
        <Tab.Screen
          name="AssignTask"
          options={{ title: "Assign task" }}
          component={CreateTaskScreen}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
