import { useState } from "react";
import { ScrollView, Text, View, TouchableOpacity, LayoutAnimation, Platform, UIManager } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

// Enable layout animation for Android
if (Platform.OS === "android") {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

export default function TabTwo() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "What is UpNexT?",
      answer:
        "UpNexT is your personal productivity companion. It helps you organize your goals, manage your tasks, and stay focused throughout the day.",
    },
    {
      question: "Do I need an internet connection?",
      answer:
        "Most features work offline. You can view and manage your tasks without an internet connection.",
    },
    {
      question: "Can I get reminders for my tasks?",
      answer:
        "Yes! You can set timers and notifications to remind you when it’s time to complete a task.",
    },
    {
      question: "Is my data private?",
      answer:
        "Absolutely. Your information is safely stored and only accessible to you. We prioritize your privacy.",
    },
  ];

  const handleToggle = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <LinearGradient
      colors={["#0f172a", "#1e3a8a", "#3b82f6"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="flex-1"
    >
      <ScrollView className="flex-1 p-6">
        {/* About Section */}
        <View className="py-10 items-center">
          <Text className="text-4xl font-bold text-white mb-2">UpNexT ✨</Text>
          <Text className="text-blue-100 text-center text-base leading-6 px-2">
            We believe productivity should be simple, beautiful, and motivating.
            UpNexT helps you stay on track with your goals, boost focus, and make every day count.
          </Text>
        </View>

        {/* FAQ Section */}
        <View className="mt-8">
          <Text className="text-2xl font-semibold text-white mb-4 text-center">Frequently Asked Questions 💭</Text>

          {faqs.map((faq, index) => (
            <View
              key={index}
              className="mb-3 bg-white/10 border border-white/20 rounded-2xl p-4 shadow-lg"
            >
              <TouchableOpacity
                onPress={() => handleToggle(index)}
                className="flex-row justify-between items-center"
              >
                <Text className="text-white font-medium text-base flex-1 mr-2">{faq.question}</Text>
                <Ionicons
                  name={expandedIndex === index ? "chevron-up" : "chevron-down"}
                  size={20}
                  color="#93c5fd"
                />
              </TouchableOpacity>

              {expandedIndex === index && (
                <View className="mt-3">
                  <Text className="text-blue-100 text-sm leading-5">{faq.answer}</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Contact Section */}
        <View className="mt-10 mb-12 items-center">
          <Text className="text-xl font-semibold text-white mb-2">Get in Touch 📬</Text>
          <Text className="text-blue-100 text-center">
            Have more questions? Reach out at{" "}
            <Text className="font-semibold text-white">support@upnext.app</Text>
          </Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}
