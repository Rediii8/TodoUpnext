import { ConvexReactClient } from "convex/react";
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { authClient } from "@/lib/auth-client";
import { Stack } from "expo-router";
import { DarkTheme, DefaultTheme, ThemeProvider, type Theme } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import "../global.css";
import { NAV_THEME } from "@/lib/constants";
import React, { useRef, useState, useEffect } from "react";
import { useColorScheme } from "@/lib/use-color-scheme";
import { setAndroidNavigationBar } from "@/lib/android-navigation-bar";

const LIGHT_THEME: Theme = { ...DefaultTheme, colors: NAV_THEME.light };
const DARK_THEME: Theme = { ...DarkTheme, colors: NAV_THEME.dark };

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!, {
  expectAuth: true,
  unsavedChangesWarning: false,
});

const useIsomorphicLayoutEffect =
  Platform.OS === "web" && typeof window === "undefined"
    ? React.useEffect
    : React.useLayoutEffect;

export default function RootLayout() {
  const hasMounted = useRef(false);
  const { colorScheme, isDarkColorScheme } = useColorScheme();
  const [isReady, setIsReady] = useState(false);
  const [initialRoute, setInitialRoute] = useState<string | null>(null);

  // Set color scheme & android navbar
  useIsomorphicLayoutEffect(() => {
    if (hasMounted.current) return;
    if (Platform.OS === "web") document.documentElement.classList.add("bg-background");
    setAndroidNavigationBar(colorScheme);
    hasMounted.current = true;
  }, []);

  // Check auth session
  useEffect(() => {
    (async () => {
      const session = await authClient.getSession();
      setInitialRoute(session ? "(drawer)" : "(auth)/sign-in");
      setIsReady(true);
    })();
  }, []);

  if (!isReady || !initialRoute) return null;

  return (
    <ConvexBetterAuthProvider client={convex} authClient={authClient}>
      <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
        <StatusBar style={isDarkColorScheme ? "light" : "dark"} />
        <GestureHandlerRootView style={{ flex: 1 }}>
          <Stack initialRouteName={initialRoute}>
            {/* Auth Screens */}
            <Stack.Screen name="(auth)/sign-in" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)/sign-up" options={{ headerShown: false }} />

            {/* Drawer Screens */}
            <Stack.Screen name="(drawer)" options={{ headerShown: false }} />

            {/* Modals */}
            <Stack.Screen name="modal" options={{ presentation: "modal" }} />
          </Stack>
        </GestureHandlerRootView>
      </ThemeProvider>
    </ConvexBetterAuthProvider>
  );
}
