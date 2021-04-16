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
  variant: 'success' | 'danger' | 'warning' | 'info' | 'default' //here
  title: string;
  message: string;
  timestamp: Moment; // TODO: Migrate to Luxon, since Moment is now deprecated
}

export type NotificationState = NotificationItem[];

export const initialNotificationsState: NotificationState = [];

// { 'variant': 'info', 'title': 'Unread info notification title', 'message': 'This is an info notification description', 'timestamp': moment().subtract(1, 'days') },
// { 'variant': 'warning', 'title': 'Unread warning notification title', 'message': 'This is a warning!!', 'timestamp': moment().subtract(5, 'minutes') },
// { 'variant': 'danger', 'title': 'Unread danger notification title', 'message': 'This is dangerous...', 'timestamp': moment().subtract(1, 'hour') },

interface NotificationPayload {
  [NotificationActionTypes.SEND]: {
    notifications: NotificationItem[]
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
    case NotificationActionTypes.SEND: {
      return state.concat(action.payload.notifications).sort((a, b) => b.timestamp.diff(a.timestamp)) // earliest at the front
    }
    default:
      return state
  }
}