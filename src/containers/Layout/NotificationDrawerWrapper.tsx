import {
  NotificationDrawer,
  NotificationDrawerBody,
  NotificationDrawerHeader,
  NotificationDrawerList,
  NotificationDrawerListItem,
  NotificationDrawerListItemBody,
  NotificationDrawerListItemHeader
} from '@patternfly/react-core';
import React, { useContext } from 'react';
import { AppContext } from '../../context/context';

interface NotificationDrawerWrapperProps {
  onClose: () => void;
}

const NotificationDrawerWrapper: React.FC<NotificationDrawerWrapperProps> = ({ onClose }) => {
  const { state: { notifications } } = useContext(AppContext);

  return (
    <NotificationDrawer>
      <NotificationDrawerHeader count={notifications.length} onClose={() => onClose()}>
      </NotificationDrawerHeader>
      <NotificationDrawerBody>
        <NotificationDrawerList>
          {notifications.map((item, index) => (
            <NotificationDrawerListItem key={index} variant={item.variant}>
              <NotificationDrawerListItemHeader
                variant={item.variant}
                title={item.title}
              >
              </NotificationDrawerListItemHeader>
              <NotificationDrawerListItemBody timestamp={item.timestamp.calendar()}>
                {item.message}
              </NotificationDrawerListItemBody>
            </NotificationDrawerListItem>))}
        </NotificationDrawerList>
      </NotificationDrawerBody>
    </NotificationDrawer>)
};

export default NotificationDrawerWrapper;