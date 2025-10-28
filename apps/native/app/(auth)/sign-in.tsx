import React from "react";
import { LinearGradient } from "expo-linear-gradient";
import { View, Text, TouchableOpacity } from "react-native";
import { Link, useRouter } from "expo-router";
import { SignIn as SignInForm } from "@/components/sign-in";

export default function SignInScreen() {
  const router = useRouter();

  const handleSignInSuccess = () => {
    router.replace("/(drawer)/todos"); // Redirect after sign in
  };

  return (
    <LinearGradient
      colors={["#0a1931", "#102542", "#1b3358"]}
      className="flex-1 justify-center"
    >
      <View className="px-6">
        <Text className="text-3xl font-bold text-white text-center mb-4">
          Welcome Back 👋
        </Text>
        <Text className="text-white/70 text-center mb-6">
          Sign in to continue your journey
        </Text>

        <View className="bg-white/10 p-4 rounded-2xl">
          <SignInForm onSuccess={handleSignInSuccess} />
        </View>

        <Link href="/(auth)/sign-up" asChild>
          <TouchableOpacity className="mt-4">
            <Text className="text-blue-200 text-center">
              Don’t have an account?{" "}
              <Text className="font-semibold text-white">Sign Up</Text>
            </Text>
          </TouchableOpacity>
        </Link>
      </View>
    </LinearGradient>
  );
}
