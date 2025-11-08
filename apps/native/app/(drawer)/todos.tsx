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
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "@my-better-t-app/backend/convex/_generated/api";
import type { Id } from "@my-better-t-app/backend/convex/_generated/dataModel";
import { router } from "expo-router";
import { authClient } from "@/lib/auth-client";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Platform, ToastAndroid } from "react-native";
import {
  initializeNotifications,
  syncTodoNotifications,
  type TodoSummary,
} from "@/lib/notifications";

const showToast = (message: string) => {
  if (Platform.OS === "android") {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  }
};

const formatDateLabel = (date: Date | null, fallback: string) =>
  date
    ? date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : fallback;

const formatTimeLabel = (date: Date | null, fallback: string) =>
  date
    ? date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : fallback;

const formatDueDateDisplay = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "";

export default function TodosScreen() {
  const [newTodoText, setNewTodoText] = useState("");
  const [editingId, setEditingId] = useState<Id<"todos"> | null>(null);
  const [editingText, setEditingText] = useState("");
  const [addDueDate, setAddDueDate] = useState<Date | null>(null);
  const [editDueDate, setEditDueDate] = useState<Date | null>(null);
  const [notificationsReady, setNotificationsReady] = useState(false);
  type PickerMode = "date" | "time";
  type PickerTarget = "add" | Id<"todos">;
  type ActivePicker = { target: PickerTarget; mode: PickerMode } | null;

  const [activePicker, setActivePicker] = useState<ActivePicker>(null);

  const openPicker = (target: PickerTarget, mode: PickerMode) => {
    setActivePicker({ target, mode });
  };

  const handlePickerChange = (
    picker: NonNullable<ActivePicker>,
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    if (event.type === "dismissed") {
      setActivePicker(null);
      return;
    }

    const timestamp = event?.nativeEvent?.timestamp;
    const picked = selectedDate ?? (typeof timestamp === "number" ? new Date(timestamp) : undefined);
    if (!picked) {
      setActivePicker(null);
      return;
    }

    const isAddTarget = picker.target === "add";
    const current = isAddTarget ? addDueDate : editDueDate;
    const next = current ? new Date(current) : new Date();

    if (picker.mode === "date") {
      next.setFullYear(picked.getFullYear(), picked.getMonth(), picked.getDate());
    } else {
      next.setHours(picked.getHours(), picked.getMinutes(), 0, 0);
    }

    if (isAddTarget) {
      setAddDueDate(next);
    } else {
      setEditDueDate(next);
    }

    if (Platform.OS !== "ios") {
      setActivePicker(null);
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      const session = await authClient.getSession();
      if (!session) {
        router.replace("/(auth)/sign-in");
      }
    };
    checkSession();
  }, []);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const granted = await initializeNotifications();
      if (isMounted) setNotificationsReady(granted);
    })().catch(() => {
      if (isMounted) setNotificationsReady(false);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const { isAuthenticated, isLoading } = useConvexAuth();
  const todos = useQuery(api.todos.getAll, isAuthenticated ? undefined : "skip");

  useEffect(() => {
    if (!notificationsReady || !Array.isArray(todos)) return;
    const summaries: TodoSummary[] = todos.map((todo) => ({
      _id: todo._id,
      text: todo.text,
      dueDate: todo.dueDate ?? undefined,
      completed: todo.completed,
      details: todo.details ?? undefined,
    }));
    void syncTodoNotifications(summaries);
  }, [notificationsReady, todos]);

  const createTodoMutation = useMutation(api.todos.create);
  const toggleTodoMutation = useMutation(api.todos.toggle);
  const deleteTodoMutation = useMutation(api.todos.deleteTodo);
  const updateTodoMutation = useMutation(api.todos.updateTodo);

  const handleAddTodo = async () => {
    if (!isAuthenticated) return;
    const text = newTodoText.trim();
    if (!text) return;
    await createTodoMutation({ text, dueDate: addDueDate?.toISOString() });
    setNewTodoText("");
    setAddDueDate(null);
    showToast("Todo added");
  };

  const handleToggleTodo = (id: Id<"todos">, currentCompleted: boolean) => {
    if (!isAuthenticated) return;
    toggleTodoMutation({ id, completed: !currentCompleted });
  };

  const handleDeleteTodo = (id: Id<"todos">) => {
    if (!isAuthenticated) return;
    Alert.alert("Delete Todo", "Are you sure you want to delete this todo?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteTodoMutation({ id }),
      },
    ]);
  };

  const handleEditTodo = (id: Id<"todos">, text: string, dueDate?: string) => {
    setEditingId(id);
    setEditingText(text);
    setEditDueDate(dueDate ? new Date(dueDate) : null);
  };

  const handleSaveEdit = async (id: Id<"todos">) => {
    if (!editingText.trim()) return;
    await updateTodoMutation({
      id,
      text: editingText.trim(),
      dueDate: editDueDate ? editDueDate.toISOString() : "",
    });
    setEditingId(null);
    setEditingText("");
    setEditDueDate(null);
    showToast("Todo updated");
  };

  const handleOpenDetails = (id: Id<"todos">) => {
    // Cast is needed until Expo Router regenerates typed route helpers.
    router.push(
      { pathname: "/(drawer)/todo/[id]", params: { id: id as string } } as never,
    );
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
          <Text className="text-white text-3xl font-bold mb-2">Your To-do list</Text>
          <Text className="text-blue-100 mb-6">
            Plan your day and stay productive 🚀
          </Text>

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

          <View className="flex-row flex-wrap items-center gap-2 mb-4">
            <TouchableOpacity
              onPress={() => openPicker("add", "date")}
              className="bg-blue-500/60 px-4 py-2 rounded-lg"
            >
              <Text className="text-white">
                {formatDateLabel(addDueDate, "Set date")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => openPicker("add", "time")}
              className="bg-blue-500/40 px-4 py-2 rounded-lg"
            >
              <Text className="text-white">
                {formatTimeLabel(addDueDate, "Set time")}
              </Text>
            </TouchableOpacity>
            {addDueDate && (
              <TouchableOpacity
                onPress={() => {
                  setAddDueDate(null);
                  showToast("Due date cleared");
                }}
                className="bg-white/15 px-4 py-2 rounded-lg"
              >
                <Text className="text-white">Clear</Text>
              </TouchableOpacity>
            )}
          </View>

          {todos === undefined ? (
            <View className="flex justify-center py-8">
              <ActivityIndicator size="large" color="#93c5fd" />
            </View>
          ) : todos.length === 0 ? (
            <Text className="py-8 text-center text-blue-100">
              No todos yet. Add one above!
            </Text>
          ) : (
            <View style={{ gap: 12 }}>
              {todos.map((todo) => (
                <View
                  key={todo._id}
                  className="flex-row items-center justify-between bg-white/10 border border-white/20 p-4 rounded-xl"
                >
                  <View className="flex-row items-center flex-1">
                    <TouchableOpacity
                      onPress={() => handleToggleTodo(todo._id, todo.completed)}
                      className="mr-3"
                    >
                      <Ionicons
                        name={todo.completed ? "checkbox" : "square-outline"}
                        size={24}
                        color={todo.completed ? "#22c55e" : "#cbd5e1"}
                      />
                    </TouchableOpacity>

                    <View className="flex-1">
                      {editingId === todo._id ? (
                        <View className="flex-1">
                          <TextInput
                            value={editingText}
                            onChangeText={setEditingText}
                            className="bg-white/20 text-white px-3 py-1 rounded mb-2"
                            autoFocus
                            onSubmitEditing={() => handleSaveEdit(todo._id)}
                          />

                          <View className="flex-row flex-wrap items-center gap-2">
                            <TouchableOpacity
                              onPress={() => openPicker(todo._id, "date")}
                              className="bg-blue-500/60 px-3 py-2 rounded-lg"
                            >
                              <Text className="text-white text-sm">
                                {formatDateLabel(editDueDate, "Set date")}
                              </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={() => openPicker(todo._id, "time")}
                              className="bg-blue-500/40 px-3 py-2 rounded-lg"
                            >
                              <Text className="text-white text-sm">
                                {formatTimeLabel(editDueDate, "Set time")}
                              </Text>
                            </TouchableOpacity>
                            {editDueDate && (
                              <TouchableOpacity
                                onPress={() => {
                                  setEditDueDate(null);
                                  showToast("Due date cleared");
                                }}
                                className="bg-white/15 px-3 py-2 rounded-lg"
                              >
                                <Text className="text-white text-sm">Clear</Text>
                              </TouchableOpacity>
                            )}
                          </View>
                        </View>
                      ) : (
                        <TouchableOpacity
                          activeOpacity={0.8}
                          onPress={() => handleOpenDetails(todo._id)}
                          className="flex-1"
                        >
                          <Text
                            className={
                              todo.completed
                                ? "line-through text-blue-200"
                                : "text-white"
                            }
                          >
                            {todo.text}
                          </Text>
                          {todo.dueDate && (
                            <Text
                              className={
                                new Date(todo.dueDate) < new Date() && !todo.completed
                                  ? "text-sm mt-1 text-red-400"
                                  : "text-sm mt-1 text-blue-200"
                              }
                            >
                              Due: {formatDueDateDisplay(todo.dueDate)}
                            </Text>
                          )}
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>

                  {editingId === todo._id ? (
                    <TouchableOpacity
                      onPress={() => handleSaveEdit(todo._id)}
                      className="ml-2 p-1"
                    >
                      <Ionicons name="checkmark-outline" size={22} color="#22c55e" />
                    </TouchableOpacity>
                  ) : (
                    <>
                      <TouchableOpacity
                        onPress={() => handleEditTodo(todo._id, todo.text, todo.dueDate)}
                        className="ml-2 p-1"
                      >
                        <Ionicons name="create-outline" size={20} color="#fbbf24" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDeleteTodo(todo._id)}
                        className="ml-2 p-1"
                      >
                        <Ionicons name="trash-outline" size={20} color="#fca5a5" />
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {activePicker && (
        <View className="px-4 pb-6">
          {Platform.OS === "ios" && (
            <View className="flex-row justify-end mb-2">
              <TouchableOpacity
                onPress={() => setActivePicker(null)}
                className="px-4 py-2 bg-white/15 rounded-lg"
              >
                <Text className="text-white">Done</Text>
              </TouchableOpacity>
            </View>
          )}
          <DateTimePicker
            value={
              activePicker.target === "add"
                ? addDueDate ?? new Date()
                : editDueDate ?? new Date()
            }
            mode={activePicker.mode}
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(event, date) =>
              handlePickerChange(activePicker, event, date)
            }
          />
        </View>
      )}
    </LinearGradient>
  );
}
