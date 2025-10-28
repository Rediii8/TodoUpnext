import { useLayoutEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { Container } from "@/components/container";
import { Text, View, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const tips = [
  "Break your tasks into small, manageable steps.",
  "Take short breaks every hour to stay focused.",
  "Prioritize your tasks using the 80/20 rule.",
  "Remove distractions: silence notifications while working.",
  "Write down 3 things you're grateful for each morning.",
  "Use the Pomodoro technique: 25 min work, 5 min break.",
];

export default function ProductivityTips() {
  const navigation = useNavigation();
  const [currentTip, setCurrentTip] = useState(0);

  // Set custom header title
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "Productivity Tips 💡",
    });
  }, [navigation]);

  const handleNextTip = () => setCurrentTip((prev) => (prev + 1) % tips.length);
  const handlePrevTip = () =>
    setCurrentTip((prev) => (prev - 1 + tips.length) % tips.length);

  return (
    <Container>
      <View className="flex-1 justify-start items-center px-6 pt-20">
        <LinearGradient
          colors={["#3b82f6", "#0f172a"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="rounded-2xl p-6 shadow-lg w-full max-w-md"
        >
          <Text className="text-white text-lg text-center mb-6">
            {tips[currentTip]}
          </Text>

          <View className="flex-row justify-between">
            <TouchableOpacity onPress={handlePrevTip} className="p-3">
              <Ionicons name="arrow-back-circle-outline" size={32} color="white" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleNextTip} className="p-3">
              <Ionicons
                name="arrow-forward-circle-outline"
                size={32}
                color="white"
              />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    </Container>
  );
}
