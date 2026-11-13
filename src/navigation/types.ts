import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { CompositeNavigationProp, NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { TxKind } from '@/data/types';

export type TabParamList = {
  Home: undefined;
  Activity: undefined;
  Plan: undefined;
  Goals: undefined;
  Ask: { prompt?: string } | undefined;
};

export type RootStackParamList = {
  Welcome: undefined;
  Main: NavigatorScreenParams<TabParamList> | undefined;
  AddTransaction: { kind?: TxKind; amount?: string; note?: string } | undefined;
  Notifications: undefined;
  Profile: undefined;
  Accounts: undefined;
};

export type AppNav = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList>,
  NativeStackNavigationProp<RootStackParamList>
>;
