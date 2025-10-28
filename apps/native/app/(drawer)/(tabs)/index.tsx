import { Container } from "@/components/container";
import {
	View,
	Text,
	Image,
	ScrollView,
	Pressable,
	Linking,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";

export default function TabOne() {
	return (
		<LinearGradient
			colors={[
				"#0f172a",
				"#1e3a8a",
				"#3b82f6",
				"#9333ea",
				
				
			]}
			start={{ x: 0, y: 0 }}
			end={{ x: 1, y: 1 }}
			className="flex-1"
		>
			<ScrollView
				contentContainerStyle={{
					padding: 24,
					paddingBottom: 80,
				}}
				showsVerticalScrollIndicator={false}
			>
				{/* App Logo and Title */}
				<View className="items-center mt-16 mb-8">
					<Image
						source={{
							uri: "https://cdn-icons-png.flaticon.com/512/6195/6195699.png",
						}}
						className="w-28 h-28 mb-4"
						style={{ shadowColor: "#fff", shadowOpacity: 0.4, shadowRadius: 10 }}
					/>
					<Text className="text-5xl font-extrabold text-white text-center mb-2">
						UpNexT
					</Text>
					<Text className="text-white/90 text-center text-lg">
						The Future of Simple Productivity
					</Text>
				</View>

				{/* Floating Blur Card */}
				<BlurView
					intensity={60}
					tint="dark"
					className="rounded-3xl p-5 mb-6 bg-white/10 border border-white/20"
				>
					<Text className="text-2xl font-semibold text-white mb-3">
						Who We Are
					</Text>
					<Text className="text-white/80 leading-6 text-base">
						UpNexT was crafted to help dreamers, students, and creators stay
						on top of what matters most. Our goal? To transform daily
						productivity into something delightful, not draining.
					</Text>
				</BlurView>

				{/* Features */}
				<BlurView
					intensity={60}
					tint="dark"
					className="rounded-3xl p-5 mb-6 bg-white/10 border border-white/20"
				>
					<Text className="text-2xl font-semibold text-white mb-3">
						What You Can Do
					</Text>
					<View className="gap-2">
						<Text className="text-white/90">• Add, edit & delete tasks easily</Text>
						<Text className="text-white/90">• Organize goals with categories</Text>
						<Text className="text-white/90">• Track your progress visually</Text>
						<Text className="text-white/90">• Enjoy a clean and modern UI</Text>
					</View>
				</BlurView>

				{/* Inspirational Quote */}
				<LinearGradient
					colors={["#38bdf8", "#6366f1", "#8b5cf6"]}
					start={{ x: 0, y: 0 }}
					end={{ x: 1, y: 1 }}
					className="rounded-3xl p-5 mb-8 shadow-md shadow-indigo-500/40"
				>
					<Text className="text-white italic text-center text-lg">
						“Productivity is never an accident — it’s the result of commitment
						to excellence, planning, and focused effort.”
					</Text>
				</LinearGradient>

				{/* Developer Card */}
				<BlurView
					intensity={60}
					tint="dark"
					className="rounded-3xl p-5 items-center bg-white/10 border border-white/20"
				>
					<Text className="text-white/80 text-base mb-2">
						Built with ❤️ by
					</Text>
					<Text className="text-2xl font-bold text-white mb-4">
						Redeat Ephrem
					</Text>
					{/* <Pressable
						onPress={() => Linking.openURL("https://github.com/yourusername")}
						className="bg-white/20 px-6 py-2 rounded-full"
					>
						<Text className="text-white font-semibold text-sm">
							View My Projects
						</Text>
					</Pressable> */}
				</BlurView>

				{/* Footer */}
				<View className="mt-10 items-center">
					<Text className="text-white/60 text-xs">
						© {new Date().getFullYear()} UpNexT • All Rights Reserved
					</Text>
				</View>
			</ScrollView>
		</LinearGradient>
	);
}
