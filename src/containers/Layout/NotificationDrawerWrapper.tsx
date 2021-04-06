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
import TimesIcon from '@patternfly/react-icons/dist/js/icons/times-icon';
import { NotificationActionTypes } from '../../context/actions/types';

interface NotificationDrawerWrapperProps {
  onClose: () => void;
}

const NotificationDrawerWrapper: React.FC<NotificationDrawerWrapperProps> = ({ onClose }) => {
  const [disabled, setDisabled] = useState(true);
  const { state: { notifications }, dispatch } = useContext(AppContext);

  useEffect(() => {
    setDisabled(notifications.length === 0)
  }, [notifications.length]);

  return (
    <NotificationDrawer>
      <NotificationDrawerHeader count={notifications.length}>
        <Button variant="tertiary" aria-label={"Clear All"} isDisabled={disabled} onClick={() => {
          dispatch({
            type: NotificationActionTypes.CLEAR
          });
        }}>Clear All</Button>
        <Button variant={ButtonVariant.plain} aria-label={"Close"} onClick={onClose}>
          {/* <TimesIcon aria-hidden="true" className="times-logo"/> */}
        </Button>
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
              <TimesIcon aria-hidden="true" />
            </NotificationDrawerListItem>))}
        </NotificationDrawerList>
      </NotificationDrawerBody>
    </NotificationDrawer>)
};

export default NotificationDrawerWrapper;