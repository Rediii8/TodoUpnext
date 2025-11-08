import { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  TextInput,
  Platform,
  ToastAndroid,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useMutation, useQuery } from "convex/react";
import { api } from "@my-better-t-app/backend/convex/_generated/api";
import type { Id } from "@my-better-t-app/backend/convex/_generated/dataModel";
import { Ionicons } from "@expo/vector-icons";
import { ONE_HOUR_MS } from "@/lib/notifications";

const showToast = (message: string) => {
  if (Platform.OS === "android") {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  }
};

const formatDateTime = (date: Date) =>
  date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

export default function TodoDetailsScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const todoId = params.id as string | undefined;
  const updateTodoMutation = useMutation(api.todos.updateTodo);
  const toggleTodoMutation = useMutation(api.todos.toggle);

  const todo = useQuery(
    api.todos.getById,
    todoId ? { id: todoId as Id<"todos"> } : "skip",
  );

  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [detailsDraft, setDetailsDraft] = useState("");

  useEffect(() => {
    if (todo && !isEditingDetails) {
      setDetailsDraft(todo.details ?? "");
    }
  }, [todo, isEditingDetails]);

  const handleToggleCompleted = async () => {
    if (!todo) return;
    await toggleTodoMutation({ id: todo._id, completed: !todo.completed });
    showToast(todo.completed ? "Marked as pending" : "Marked complete");
  };

  const handleSaveDetails = async () => {
    if (!todo) return;
    await updateTodoMutation({ id: todo._id, details: detailsDraft });
    setIsEditingDetails(false);
    showToast("Details saved");
  };

  const notificationTimes = useMemo(() => {
    if (!todo?.dueDate) return [] as Array<{ label: string; time: Date; status: string }>;
    const due = new Date(todo.dueDate);
    if (Number.isNaN(due.getTime())) return [];
    const now = new Date();

    const hourBefore = new Date(due.getTime() - ONE_HOUR_MS);

    return [
      {
        label: "1 hour before",
        time: hourBefore,
        status: hourBefore > now ? "Scheduled" : "Elapsed",
      },
      {
        label: "Due time",
        time: due,
        status: due > now ? "Scheduled" : "Elapsed",
      },
    ];
  }, [todo?.dueDate]);

  if (!todoId) {
    return (
      <LinearGradient
        colors={["#0f172a", "#1e3a8a", "#3b82f6"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="flex-1"
      >
        <View className="flex-1 justify-center items-center p-6">
          <Text className="text-white text-lg">Missing todo identifier.</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-4 px-4 py-2 bg-white/20 rounded-lg"
          >
            <Text className="text-white">Go back</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={["#0f172a", "#1e3a8a", "#3b82f6"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="flex-1"
    >
      <ScrollView className="flex-1 p-6" contentContainerStyle={{ paddingBottom: 32 }}>
        <TouchableOpacity onPress={() => router.back()} className="mb-4 flex-row items-center">
          <Ionicons name="arrow-back" size={20} color="#bfdbfe" />
          <Text className="text-blue-100 ml-2">Back to list</Text>
        </TouchableOpacity>

        {todo === undefined ? (
          <View className="flex-1 items-center justify-center py-16">
            <ActivityIndicator size="large" color="#93c5fd" />
          </View>
        ) : !todo ? (
          <View className="bg-white/10 border border-white/20 rounded-2xl p-6">
            <Text className="text-white text-lg font-semibold mb-2">Todo not found</Text>
            <Text className="text-blue-100">It may have been deleted.</Text>
          </View>
        ) : (
          <View className="bg-white/10 border border-white/20 rounded-2xl p-6" style={{ gap: 16 }}>
            <View style={{ gap: 12 }}>
              <View className="flex-row items-start justify-between">
                <Text className="text-white text-2xl font-semibold flex-1 pr-3">
                  {todo.text}
                </Text>
                <TouchableOpacity
                  onPress={handleToggleCompleted}
                  className={`px-3 py-2 rounded-lg ${
                    todo.completed ? "bg-green-500/20" : "bg-slate-500/30"
                  }`}
                >
                  <Text className="text-white text-sm">
                    {todo.completed ? "Mark pending" : "Mark complete"}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={{ gap: 6 }}>
                <Text className="text-blue-100 text-sm uppercase tracking-widest">
                  Due Date
                </Text>
                <Text className="text-white text-base">
                  {todo.dueDate ? formatDateTime(new Date(todo.dueDate)) : "Not set"}
                </Text>
              </View>
            </View>

            <View style={{ gap: 10 }}>
              <View className="flex-row items-center justify-between">
                <Text className="text-blue-100 text-sm uppercase tracking-widest">
                  Details
                </Text>
                {!isEditingDetails && (
                  <TouchableOpacity
                    onPress={() => setIsEditingDetails(true)}
                    className="px-3 py-1.5 bg-blue-500/50 rounded-lg"
                  >
                    <Text className="text-white text-sm">Edit details</Text>
                  </TouchableOpacity>
                )}
              </View>

              {isEditingDetails ? (
                <View style={{ gap: 12 }}>
                  <TextInput
                    value={detailsDraft}
                    onChangeText={setDetailsDraft}
                    multiline
                    textAlignVertical="top"
                    className="bg-white/15 text-white rounded-xl px-3 py-3"
                    placeholder="Add extra notes, links, or context..."
                    placeholderTextColor="#94a3b8"
                    style={{ minHeight: 120 }}
                  />
                  <View className="flex-row justify-end gap-3">
                    <TouchableOpacity
                      onPress={() => {
                        setIsEditingDetails(false);
                        setDetailsDraft(todo.details ?? "");
                      }}
                      className="px-4 py-2 bg-white/10 rounded-lg"
                    >
                      <Text className="text-white">Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleSaveDetails}
                      className="px-4 py-2 bg-blue-500 rounded-lg"
                    >
                      <Text className="text-white font-semibold">Save</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View className="bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                  <Text className="text-white leading-6">
                    {todo.details?.length ? todo.details : "No additional details yet."}
                  </Text>
                </View>
              )}
            </View>

            <View style={{ gap: 10 }}>
              <Text className="text-blue-100 text-sm uppercase tracking-widest">
                Notification times
              </Text>
              {todo.dueDate ? (
                notificationTimes.length ? (
                  <View style={{ gap: 8 }}>
                    {notificationTimes.map((item) => (
                      <View
                        key={item.label}
                        className="flex-row items-center justify-between bg-white/5 border border-white/10 px-4 py-3 rounded-lg"
                      >
                        <View>
                          <Text className="text-white font-medium">{item.label}</Text>
                          <Text className="text-blue-100 text-sm">{formatDateTime(item.time)}</Text>
                        </View>
                        <Text
                          className={
                            item.status === "Scheduled"
                              ? "text-emerald-300 text-sm"
                              : "text-red-300 text-sm"
                          }
                        >
                          {item.status}
                        </Text>
                      </View>
                    ))}
                    <Text className="text-blue-200 text-xs">
                      Reminders are dispatched only if the scheduled time is still in the future.
                    </Text>
                  </View>
                ) : (
                  <Text className="text-blue-100">
                    This due date is in the past, so no future reminders are scheduled.
                  </Text>
                )
              ) : (
                <Text className="text-blue-100">
                  Add a due date to schedule reminders one hour before and at the due time.
                </Text>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}
