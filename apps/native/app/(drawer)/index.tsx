import { useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Container } from "@/components/container";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@my-better-t-app/backend/convex/_generated/api";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "expo-router";

export default function Home() {
  const healthCheck = useQuery(api.healthCheck.get);
  const { isAuthenticated, isLoading } = useConvexAuth();
  const user = useQuery(api.auth.getCurrentUser, isAuthenticated ? {} : "skip");
  const router = useRouter();

  // ✅ Redirect after render, not during
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/(auth)/sign-in");
    }
  }, [isAuthenticated, isLoading]);

  // ✅ Avoid flashing blank screen while checking auth
  if (isLoading || !isAuthenticated) {
    return null;
  }

  return (
    <Container>
      <View className="px-4">
        <Text className="font-mono text-foreground text-3xl font-bold mb-4">
          UpNexT
        </Text>

        {user && (
          <View className="mb-6 p-4 bg-card rounded-lg border border-border">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-foreground text-base">
                Heyyy, <Text className="font-medium">{user.name}</Text>
              </Text>
            </View>
            <Text className="text-muted-foreground text-sm mb-4">
              {user.email}
            </Text>
            <TouchableOpacity
              className="bg-destructive py-2 px-4 rounded-md self-start"
              onPress={() => authClient.signOut()}
            >
              <Text className="text-white font-medium">Sign Out</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Container>
  );
}
