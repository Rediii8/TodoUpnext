import React from "react";
import { LinearGradient } from "expo-linear-gradient";
import { View, Text, TouchableOpacity } from "react-native";
import { Link, useRouter } from "expo-router";
import { SignUp as SignUpForm } from "@/components/sign-up";

export default function SignUpScreen() {
  const router = useRouter();

  const handleSignUpSuccess = () => {
    router.replace("/(auth)/sign-in"); // Go back to sign in after signup
  };

  return (
    <LinearGradient colors={["#0a1931", "#102542", "#1b3358"]} className="flex-1 justify-center">
      <View className="px-6">
        <Text className="text-3xl font-bold text-white text-center mb-4">Create Your Account ✨</Text>
        <Text className="text-white/70 text-center mb-6">Start organizing your goals today</Text>

        <View className="bg-white/10 p-4 rounded-2xl">
          <SignUpForm onSuccess={handleSignUpSuccess} />
        </View>

        <Link href="/(auth)/sign-in" asChild>
          <TouchableOpacity className="mt-4">
            <Text className="text-blue-200 text-center">
              Already have an account? <Text className="font-semibold text-white">Sign In</Text>
            </Text>
          </TouchableOpacity>
        </Link>
      </View>
    </LinearGradient>
  );
}
