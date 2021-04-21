import { Moment } from "moment";
import { ActionMap, NotificationActionTypes } from "../actions/types";

export enum NotificationItemVariant {
  SUCCESS = 'success',
  DANGER = 'danger',
  WARNING = 'warning',
  INFO = 'info',
  DEFAULT = 'default'
}

export interface NotificationItem {
  variant: 'success' | 'danger' | 'warning' | 'info' | 'default';
  title: string;
  message: string;
  timestamp: Moment; // TODO: Migrate to Luxon, since Moment is now deprecated
  pluginId?: number;
}

export type NotificationState = NotificationItem[];

export const initialNotificationsState: NotificationState = [];
interface NotificationPayload {
  [NotificationActionTypes.SEND]: {
    notifications: NotificationItem[]
  },
  [NotificationActionTypes.CLEAR]: {},
  [NotificationActionTypes.REMOVE]: {
    index: number
  }
}

export type NotificationActions = ActionMap<NotificationPayload>[
  keyof ActionMap<NotificationPayload>
]

export const notificationsReducer = (
  state: NotificationState,
  action: NotificationActions
) => {
  switch (action.type) {
    case NotificationActionTypes.SEND:
      return [...state, ...action.payload.notifications].sort((a, b) => b.timestamp.diff(a.timestamp)); // chronological order for notifications

    case NotificationActionTypes.CLEAR:  // clear all notifications currently being stored
      return [];

    case NotificationActionTypes.REMOVE:  // update notifications to not include removed notification
      return [
        ...state.slice(0, action.payload.index),
        ...state.slice(action.payload.index + 1)
      ];

    default:
      return state
  }
}
