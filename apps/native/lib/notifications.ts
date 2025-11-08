import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import type { Id } from "@my-better-t-app/backend/convex/_generated/dataModel";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const STORAGE_KEY = "@todo-notification-records";
export const ONE_HOUR_MS = 60 * 60 * 1000;

export type TodoSummary = {
  _id: Id<"todos">;
  text: string;
  dueDate?: string;
  completed: boolean;
  details?: string;
};

type NotificationRecord = {
  dueDate: string;
  notificationIds: string[];
};

type NotificationState = Record<string, NotificationRecord>;

type AndroidTimeIntervalTriggerInput = Notifications.TimeIntervalTriggerInput & {
  channelId: string;
};

const DEFAULT_CHANNEL_ID = "todo-reminders";

const createTimeTrigger = (
  fireAt: number,
): Notifications.NotificationTriggerInput | null => {
  const msUntil = fireAt - Date.now();
  if (msUntil <= 0) return null;

  const trigger: Notifications.TimeIntervalTriggerInput = {
    type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
    seconds: Math.ceil(msUntil / 1000),
  };

  if (Platform.OS === "android") {
    return {
      ...trigger,
      channelId: DEFAULT_CHANNEL_ID,
    } as AndroidTimeIntervalTriggerInput;
  }

  return trigger;
};

const loadState = async (): Promise<NotificationState> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as NotificationState;
  } catch {
    return {};
  }
};

const saveState = async (state: NotificationState) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore persistence errors
  }
};

const cancelNotificationIds = async (ids: string[]) => {
  if (!ids.length) return;
  await Promise.all(ids.map((id) => Notifications.cancelScheduledNotificationAsync(id)));
};

const scheduleNotificationsForTodo = async (
  todo: TodoSummary,
): Promise<NotificationRecord | null> => {
  if (!todo.dueDate) return null;

  const due = new Date(todo.dueDate);
  if (Number.isNaN(due.getTime())) return null;

  const dueTime = due.getTime();
  const notifications: string[] = [];

  const hourBeforeTrigger = createTimeTrigger(dueTime - ONE_HOUR_MS);
  if (hourBeforeTrigger) {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: "1 hour remaining",
        body: `"${todo.text}" is due in one hour.`,
        sound: true,
      },
      trigger: hourBeforeTrigger,
    });
    notifications.push(id);
  }

  const dueTimeTrigger = createTimeTrigger(dueTime);
  if (dueTimeTrigger) {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Task due",
        body: `"${todo.text}" has reached its due time.`,
        sound: true,
      },
      trigger: dueTimeTrigger,
    });
    notifications.push(id);
  }

  return {
    dueDate: todo.dueDate,
    notificationIds: notifications,
  };
};

export const initializeNotifications = async () => {
  const current = await Notifications.getPermissionsAsync();
  if (!current.granted) {
    const requested = await Notifications.requestPermissionsAsync();
    if (!requested.granted) return false;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(DEFAULT_CHANNEL_ID, {
      name: "Task reminders",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [250, 250, 250],
    });
  }

  return true;
};

export const syncTodoNotifications = async (todos: TodoSummary[]) => {
  const state = await loadState();
  const updated: NotificationState = {};
  const activeKeys = new Set(todos.map((todo) => String(todo._id)));

  for (const todo of todos) {
    const key = String(todo._id);
    const existing = state[key];

    if (!todo.dueDate || todo.completed) {
      if (existing) {
        await cancelNotificationIds(existing.notificationIds);
      }
      continue;
    }

    if (existing && existing.dueDate === todo.dueDate) {
      updated[key] = existing;
      continue;
    }

    if (existing) {
      await cancelNotificationIds(existing.notificationIds);
    }

    const record = await scheduleNotificationsForTodo(todo);
    if (record) {
      updated[key] = record;
    }
  }

  for (const [key, record] of Object.entries(state)) {
    if (activeKeys.has(key)) continue;
    await cancelNotificationIds(record.notificationIds);
  }

  await saveState(updated);
};
