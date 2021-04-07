import {
  Button,
  NotificationDrawer,
  NotificationDrawerBody,
  NotificationDrawerHeader,
  NotificationDrawerList,
  NotificationDrawerListItem,
  NotificationDrawerListItemBody,
  NotificationDrawerListItemHeader,
  ButtonVariant
} from '@patternfly/react-core';
import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/context';
import { TimesIcon, TimesCircleIcon } from '@patternfly/react-icons';
import { NotificationActionTypes } from '../../context/actions/types';
import { NotificationItem } from '../../context/reducers/notificationReducer';

interface NotificationDrawerWrapperProps {
  onClose: () => void;
}

const NotificationDrawerWrapper: React.FC<NotificationDrawerWrapperProps> = ({ onClose }) => {
  const [disabled, setDisabled] = useState(true);
  const { state: { notifications }, dispatch } = useContext(AppContext);

  const onNotificationClose = (index: number) => {
    let newNotifications: NotificationItem[] = notifications.slice(0);
    newNotifications.splice(index, 1);

    dispatch({
      type: NotificationActionTypes.REMOVE,
      payload: {
        notifications: newNotifications
      }
    });
  }

  useEffect(() => {
    setDisabled(notifications.length === 0)
  }, [notifications.length]);

  return (
    <NotificationDrawer>
      <NotificationDrawerHeader count={notifications.length}>
        <Button variant="tertiary" aria-label="Clear All" isDisabled={disabled} onClick={() => {
          dispatch({
            type: NotificationActionTypes.CLEAR
          });
        }}>Clear All</Button>
        <Button variant={ButtonVariant.plain} aria-label="Close Notification Drawer" onClick={onClose} className="times-logo">
          <TimesIcon aria-hidden="true" />
        </Button>
      </NotificationDrawerHeader>
      <NotificationDrawerBody>
        <NotificationDrawerList>
          {notifications.map((item, index) => (
            <NotificationDrawerListItem key={index} variant={item.variant}>
              <NotificationDrawerListItemHeader variant={item.variant} title={item.title}>
              </NotificationDrawerListItemHeader>
              <NotificationDrawerListItemBody timestamp={item.timestamp.calendar()}>
                {item.message}
              </NotificationDrawerListItemBody>
              <Button variant={ButtonVariant.plain} aria-label="Close Notification" onClick={() => onNotificationClose(index)} className="times-logo notification-close">
                <TimesCircleIcon aria-hidden="true"/>
              </Button>
            </NotificationDrawerListItem>))}
        </NotificationDrawerList>
      </NotificationDrawerBody>
    </NotificationDrawer>)
};

export default NotificationDrawerWrapper;