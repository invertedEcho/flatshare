import { NavigationContainer } from "@react-navigation/native";
import { CreateTaskScreen } from "./src/screens/AssignTask";
import { HomeScreen } from "./src/screens/Home";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "@expo/vector-icons/Ionicons";

export type RootStackParamList = {
  Home: undefined;
  AssignTask: undefined;
};
const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="Home"
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap = "home";

            if (route.name === "Home") {
              iconName = focused ? "home" : "home-outline";
            } else if (route.name === "AssignTask") {
              iconName = focused ? "list" : "list-outline";
            }

            // You can return any component that you like here!
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: "tomato",
          tabBarInactiveTintColor: "gray",
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen
          name="AssignTask"
          options={{ title: "Assign task" }}
          component={CreateTaskScreen}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
