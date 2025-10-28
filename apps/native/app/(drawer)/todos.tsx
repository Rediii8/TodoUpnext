import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useMutation, useQuery } from "convex/react";
import { api } from "@my-better-t-app/backend/convex/_generated/api";
import type { Id } from "@my-better-t-app/backend/convex/_generated/dataModel";
import { router } from "expo-router";
import { authClient } from "@/lib/auth-client";

export default function TodosScreen() {
  const [newTodoText, setNewTodoText] = useState("");

  // 🔒 Redirect to sign-in if not logged in
  useEffect(() => {
    const checkSession = async () => {
      const session = await authClient.getSession();
      if (!session) {
        router.replace("/(auth)/sign-in");
      }
    };
    checkSession();
  }, []);

  const todos = useQuery(api.todos.getAll);
  const createTodoMutation = useMutation(api.todos.create);
  const toggleTodoMutation = useMutation(api.todos.toggle);
  const deleteTodoMutation = useMutation(api.todos.deleteTodo);

  const handleAddTodo = async () => {
    const text = newTodoText.trim();
    if (!text) return;
    await createTodoMutation({ text });
    setNewTodoText("");
  };

  const handleToggleTodo = (id: Id<"todos">, currentCompleted: boolean) => {
    toggleTodoMutation({ id, completed: !currentCompleted });
  };

  const handleDeleteTodo = (id: Id<"todos">) => {
    Alert.alert("Delete Todo", "Are you sure you want to delete this todo?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteTodoMutation({ id }),
      },
    ]);
  };

  return (
    <LinearGradient
      colors={["#0f172a", "#1e3a8a", "#3b82f6"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="flex-1"
    >
      <ScrollView className="flex-1 p-4">
        <View className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mt-6 border border-white/20 shadow-xl">
          <Text className="text-white text-3xl font-bold mb-2">Your Todos</Text>
          <Text className="text-blue-100 mb-6">
            Plan your day and stay productive 🚀
          </Text>

          {/* Input */}
          <View className="flex-row items-center space-x-2 mb-6">
            <TextInput
              value={newTodoText}
              onChangeText={setNewTodoText}
              placeholder="Add a new task..."
              placeholderTextColor="#cbd5e1"
              className="flex-1 bg-white/15 text-white border border-white/30 rounded-xl px-4 py-3"
              onSubmitEditing={handleAddTodo}
              returnKeyType="done"
            />
            <TouchableOpacity
              onPress={handleAddTodo}
              disabled={!newTodoText.trim()}
              className={`px-5 py-3 rounded-xl ${
                !newTodoText.trim() ? "bg-blue-400/40" : "bg-blue-500"
              }`}
            >
              <Text className="text-white font-semibold">Add</Text>
            </TouchableOpacity>
          </View>

          {/* Todo List */}
          {todos === undefined ? (
            <View className="flex justify-center py-8">
              <ActivityIndicator size="large" color="#93c5fd" />
            </View>
          ) : todos.length === 0 ? (
            <Text className="py-8 text-center text-blue-100">
              No todos yet. Add one above!
            </Text>
          ) : (
            <View className="space-y-3">
              {todos.map((todo) => (
                <View
                  key={todo._id}
                  className="flex-row items-center justify-between bg-white/10 border border-white/20 p-4 rounded-xl"
                >
                  <View className="flex-row items-center flex-1">
                    <TouchableOpacity
                      onPress={() =>
                        handleToggleTodo(todo._id, todo.completed)
                      }
                      className="mr-3"
                    >
                      <Ionicons
                        name={todo.completed ? "checkbox" : "square-outline"}
                        size={24}
                        color={todo.completed ? "#22c55e" : "#cbd5e1"}
                      />
                    </TouchableOpacity>
                    <Text
                      className={`flex-1 ${
                        todo.completed
                          ? "line-through text-blue-200"
                          : "text-white"
                      }`}
                    >
                      {todo.text}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDeleteTodo(todo._id)}
                    className="ml-2 p-1"
                  >
                    <Ionicons name="trash-outline" size={20} color="#fca5a5" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}
