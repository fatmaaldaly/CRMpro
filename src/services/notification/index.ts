import {
  createNotification,
  listNotifications,
  markNotificationRead,
} from "./service";

export const NotificationService = {
  create: createNotification,
  list: listNotifications,
  markRead: markNotificationRead,
} as const;