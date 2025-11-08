import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { Drawer } from "expo-router/drawer";

import { HeaderButton } from "@/components/header-button";

const DrawerLayout = () => {
	return (
    <Drawer initialRouteName="todos">
      <Drawer.Screen
        name="todos"
        options={{
          headerTitle: "My Plans",
          drawerLabel: "Todos",
          drawerIcon: ({ size, color }) => (
            <Ionicons name="checkbox-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="index"
        options={{
          headerTitle: "Is this Goodbye? 👋",
          drawerLabel: "Log Out",
          drawerIcon: ({ size, color }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="(tabs)"
        options={{
          headerTitle: "Want some tips    ->",
          drawerLabel: "Look into us",
          drawerIcon: ({ size, color }) => (
            <MaterialIcons name="border-bottom" size={size} color={color} />
          ),
          headerRight: () => (
            <Link href="/modal" asChild>
              <HeaderButton />
            </Link>
          ),
        }}
      />
      <Drawer.Screen
        name="todo/[id]"
        options={{
          headerTitle: "Task details",
          drawerItemStyle: { display: "none" },
          drawerLabel: () => null,
          drawerIcon: () => null,
        }}
      />
    </Drawer>

	);
};

export default DrawerLayout;
