import React, { createContext, useReducer } from 'react';
import { analysesReducer, initialIPrevAnalysesState, IPrevAnalysesState } from './reducers/analyseReducer';
import { generatePredictionReducer, IGeneratePredictionState, initialIGeneratePredictionState } from './reducers/generatePredictionReducer';
import { dicomImagesReducer, IDcmImagesState, initialIDcmImagesState } from './reducers/dicomImagesReducer';
import { IimgViewerState, imgViewerReducer, initialIimgViewer } from './reducers/imgViewerReducer';
import { initialNotificationsState, notificationsReducer, NotificationState } from './reducers/notificationReducer';
import { initialIUserState, IUserState, userReducer } from './reducers/userReducer';
import { initialModelSelectionState, ModelSelection, updatingModelSelectionReducer } from './reducers/modelSelectionReducer';

type InitialStateType = {
  user: IUserState;
  prevAnalyses: IPrevAnalysesState;
  generatePrediction: IGeneratePredictionState;
  dcmImages: IDcmImagesState;
  imgViewer: IimgViewerState;
  notifications: NotificationState;
  models: ModelSelection;
}

const initialState: InitialStateType = {
  user: initialIUserState,
  prevAnalyses: initialIPrevAnalysesState,
  generatePrediction: initialIGeneratePredictionState,
  dcmImages: initialIDcmImagesState,
  imgViewer: initialIimgViewer,
  notifications: initialNotificationsState,
  models: initialModelSelectionState
}

const AppContext = createContext<{
  state: InitialStateType;
  dispatch: React.Dispatch<any>;
}>({
  state: initialState,
  dispatch: () => null
});

const mainReducer = (
  { user, prevAnalyses, generatePrediction, dcmImages, imgViewer, notifications, models }: InitialStateType,
  action: any, // or UserActions | AnalysisActions
) => ({
  user: userReducer(user, action),
  prevAnalyses: analysesReducer(prevAnalyses, action),
  generatePrediction: generatePredictionReducer(generatePrediction, action),
  dcmImages: dicomImagesReducer(dcmImages, action),
  imgViewer: imgViewerReducer(imgViewer, action),
  notifications: notificationsReducer(notifications, action),
  models: updatingModelSelectionReducer(models, action)
});

// a function component for Provider
const AppProvider: React.FC = ({ children }) => {
  const [state, dispatch] = useReducer(mainReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

export { AppContext, AppProvider };

