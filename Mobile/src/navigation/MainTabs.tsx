import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ScanStack from './ScanStack';
import HistoryStack from './HistoryStack';
import AllBreedStack from './AllBreedStack';
import FeedStack from './FeedStack';
import ProfileStack from './ProfileStack';

const Tab = createBottomTabNavigator();

// Định nghĩa màu sắc riêng cho từng tab (active: text color + bg color)
const tabColors = {
  ScanStack: {
    activeText: '#007AFF', // Xanh dương
    activeBg: '#E3F2FD', // Nền xanh nhạt
    inactiveText: 'gray',
  },
  HistoryStack: {
    activeText: '#28A745', // Xanh lá
    activeBg: '#D4EDDA', // Nền xanh lá nhạt
    inactiveText: 'gray',
  },
  AllBreedStack: {
    activeText: '#FD7E14', // Cam
    activeBg: '#FFF3CD', // Nền cam nhạt
    inactiveText: 'gray',
  },
  FeedStack: {
    activeText: '#6F42C1', // Tím
    activeBg: '#E2D9F3', // Nền tím nhạt
    inactiveText: 'gray',
  },
  ProfileStack: {
    activeText: '#DC3545', // Đỏ
    activeBg: '#F8D7DA', // Nền đỏ nhạt
    inactiveText: 'gray',
  },
};

// Icon names tương ứng với từng route
const iconMap = {
  ScanStack: 'scan-outline',
  HistoryStack: 'time-outline',
  AllBreedStack: 'list-outline',
  FeedStack: 'heart-outline',
  ProfileStack: 'person-outline',
};

// Custom Tab Bar Component
const CustomTabBar = ({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) => {
  return (
    <View style={styles.tabBar}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.title || route.name.replace('Stack', ''); // Lấy title hoặc rút gọn name
        const isFocused = state.index === index;
        const colors = tabColors[route.name as keyof typeof tabColors];
        const iconName = iconMap[route.name as keyof typeof iconMap];

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
          <TouchableOpacity
            key={index}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            // testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={[
              styles.tabItem,
              isFocused && { backgroundColor: colors.activeBg },
            ]}
          >
            <View style={styles.tabContent}>
              {/* Icon luôn hiển thị */}
              <Ionicons
                name={iconName}
                size={24}
                color={isFocused ? colors.activeText : colors.inactiveText}
              />

              {/* Label chỉ hiển thị khi active, bên phải icon */}
              {isFocused && (
                <Text style={[styles.tabLabel, { color: colors.activeText }]}>
                  {label}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' }, // Ẩn tab bar mặc định
      }}
      tabBar={props => <CustomTabBar {...props} />} // 👈 để ở đây mới đúng
    >
      <Tab.Screen
        name="ScanStack"
        component={ScanStack}
        options={{ title: 'Scan' }}
      />
      <Tab.Screen
        name="HistoryStack"
        component={HistoryStack}
        options={{ title: 'History' }}
      />
      <Tab.Screen
        name="AllBreedStack"
        component={AllBreedStack}
        options={{ title: 'AllBreed' }}
      />
      <Tab.Screen
        name="FeedStack"
        component={FeedStack}
        options={{ title: 'Feed' }}
      />
      <Tab.Screen
        name="ProfileStack"
        component={ProfileStack}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    height: 60,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingBottom: 5, // Để tránh bị che bởi safe area
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25, // Bo tròn nhẹ cho active tab
    marginHorizontal: 4,
    marginVertical: 8,
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6, // Khoảng cách giữa icon và label
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 2, // Để label sát bên phải icon
  },
});
