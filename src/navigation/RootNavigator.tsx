import { MaterialIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSession } from '@/hooks/useFinance';
import { AccountsScreen } from '@/screens/AccountsScreen';
import { ActivityScreen } from '@/screens/ActivityScreen';
import { AddTransactionScreen } from '@/screens/AddTransactionScreen';
import { AskScreen } from '@/screens/AskScreen';
import { GoalsScreen } from '@/screens/GoalsScreen';
import { HomeScreen } from '@/screens/HomeScreen';
import { NotificationsScreen } from '@/screens/NotificationsScreen';
import { PlanScreen } from '@/screens/PlanScreen';
import { ProfileScreen } from '@/screens/ProfileScreen';
import { WelcomeScreen } from '@/screens/WelcomeScreen';
import { colors } from '@/theme/colors';
import type { RootStackParamList, TabParamList } from '@/navigation/types';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const tabs: {
  name: keyof TabParamList;
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
}[] = [
  { name: 'Home', label: 'Home', icon: 'cottage' },
  { name: 'Activity', label: 'Activity', icon: 'receipt-long' },
  { name: 'Plan', label: 'Plan', icon: 'calendar-month' },
  { name: 'Goals', label: 'Goals', icon: 'flag' },
  { name: 'Ask', label: 'Ask', icon: 'auto-awesome' },
];

function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View className="border-t border-hairline bg-white" style={{ paddingBottom: insets.bottom }}>
      <View className="h-16 flex-row items-center justify-around">
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const item = tabs.find((tab) => tab.name === route.name) ?? tabs[0];
          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              className="min-w-[56px] items-center justify-center"
              onPress={() => {
                Haptics.selectionAsync().catch(() => undefined);
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
              }}>
              <MaterialIcons
                color={focused ? colors.primary : colors.moss}
                name={item.icon}
                size={22}
              />
              <Text className={`mt-0.5 text-[11px] ${focused ? 'text-primary' : 'text-moss'}`}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }} tabBar={(props) => <TabBar {...props} />}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Activity" component={ActivityScreen} />
      <Tab.Screen name="Plan" component={PlanScreen} />
      <Tab.Screen name="Goals" component={GoalsScreen} />
      <Tab.Screen name="Ask" component={AskScreen} />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const session = useSession();
  if (session.isLoading || session.data === undefined) return null;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {session.data ? (
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen
            name="AddTransaction"
            component={AddTransactionScreen}
            options={{ presentation: 'modal' }}
          />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="Accounts" component={AccountsScreen} />
        </>
      ) : (
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
      )}
    </Stack.Navigator>
  );
}
