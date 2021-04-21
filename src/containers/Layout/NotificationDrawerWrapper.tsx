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
import React, { useContext, useEffect, useState } from "react";
import { AppContext } from '../../context/context';
import { TimesIcon, TimesCircleIcon } from "@patternfly/react-icons";
import { NotificationActionTypes } from "../../context/actions/types";
import ChrisIntegration from "../../services/chris_integration";
import { useHistory } from "react-router-dom";
import { AnalysisTypes } from "../../context/actions/types";

interface NotificationDrawerWrapperProps {
  onClose: () => void;
}

const NotificationDrawerWrapper: React.FC<NotificationDrawerWrapperProps> = ({ onClose }) => {
  const history = useHistory();
  const [disabledClearAll, setDisabledClearAll] = useState(true);
  const { state: { notifications }, dispatch } = useContext(AppContext);

  const onNotificationRemoval = (index: number) => {
    dispatch({
      type: NotificationActionTypes.REMOVE,
      payload: {
        index
      }
    });
  }

  const onNotificationClear = () => {
    dispatch({
      type: NotificationActionTypes.CLEAR
    });
  }

  useEffect(() => {
    setDisabledClearAll(notifications.length === 0)
  }, [notifications.length]);

  const viewImg = async (index: number, id?: number) => {
    if (id) {
      const plugin = await ChrisIntegration.fetchPluginInstanceFromId(id);
      if (plugin?.data?.title) {
        const series = await ChrisIntegration.fetchResults(plugin);
        const dcmImage = await ChrisIntegration.getDcmImageDetailByFilePathName(plugin?.data?.title);
        dispatch({
          type: AnalysisTypes.Update_selected_image,
          payload: {
            selectedImage: {
              dcmImage,
              series
            }
          }
        });
  
        onNotificationRemoval(index);
  
        history.push('/viewImage');
      }
    }
  }

  return (
    <NotificationDrawer>
      <NotificationDrawerHeader count={notifications.length}>
        <Button variant={ButtonVariant.tertiary} aria-label="Clear All Notifications" isDisabled={disabledClearAll} onClick={onNotificationClear}>Clear All</Button>
        <Button variant={ButtonVariant.plain} aria-label="Close Notification Drawer" onClick={onClose} className="times-logo">
          <TimesIcon aria-hidden="true" />
        </Button>
      </NotificationDrawerHeader>
      <NotificationDrawerBody>
        <NotificationDrawerList>
          {notifications.map((item, index) => (
            <NotificationDrawerListItem key={index} variant={item.variant} onClick={() => { viewImg(index, item?.pluginId) }}>
              <NotificationDrawerListItemHeader variant={item.variant} title={item.title}>
              </NotificationDrawerListItemHeader>
              <NotificationDrawerListItemBody timestamp={item.timestamp.calendar()}>
                {item.message}
              </NotificationDrawerListItemBody>
              <Button variant={ButtonVariant.plain} aria-label="Remove Notification" onClick={() => onNotificationRemoval(index)} className="times-logo notification-remove-btn">
                <TimesCircleIcon aria-hidden="true" />
              </Button>
            </NotificationDrawerListItem>
          ))}
        </NotificationDrawerList>
      </NotificationDrawerBody>
    </NotificationDrawer>)
};

export default NotificationDrawerWrapper;
