import { registerRootComponent } from "expo";
import { SafeAreaView, Text } from "react-native";



function App() {
  return (
    <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 20 }}>Hello from My Better T App 👋</Text>
    </SafeAreaView>
  );
}

registerRootComponent(App);

export default App;
