import Ionicons from '@expo/vector-icons/Ionicons';
type IconGlyph = keyof typeof Ionicons.glyphMap;

export function getIconNameForRouteName(
  routeName: string,
  focused: boolean,
): IconGlyph | undefined {
  switch (routeName) {
    case 'MyAssignments':
      return focused ? 'home' : 'home-outline';
    case 'AllTasks':
      return focused ? 'list' : 'list-outline';
    case 'Login':
      return focused ? 'log-in' : 'log-in-outline';
    case 'Register':
      return focused ? 'create' : 'create-outline';
    case 'CreateTask':
      return focused ? 'add' : 'add-outline';
    default:
      return undefined;
  }
}
