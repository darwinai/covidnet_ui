import React, { createContext, useReducer } from 'react';
import { analysesReducer, initialIPrevAnalysesState, IPrevAnalysesState } from './reducers/analyseReducer';
import { createAnalysisReducer, ICreateAnalysisState, initialICreateAnalysisState } from './reducers/createAnalysisReducer';
import { dicomImagesReducer, IDcmImagesState, initialIDcmImagesState } from './reducers/dicomImagesReducer';
import { initialIUserState, IUserState, userReducer } from './reducers/userReducer';
import { IStagingDcmImgs, initialIStagingDcmImgsState, stagingDcmImgsReducer } from './reducers/stagingDcmImgsReducer';
import { IimgViewerState, initialIimgViewer, imgViewerReducer } from './reducers/imgViewerReducer';

type InitialStateType = {
  user: IUserState;
  prevAnalyses: IPrevAnalysesState;
  createAnalysis: ICreateAnalysisState;
  dcmImages: IDcmImagesState;
  stagingDcmImages: IStagingDcmImgs;
  imgViewer: IimgViewerState;
}

const initialState: InitialStateType = {
  user: initialIUserState,
  prevAnalyses: initialIPrevAnalysesState,
  createAnalysis: initialICreateAnalysisState,
  dcmImages: initialIDcmImagesState,
  stagingDcmImages: initialIStagingDcmImgsState,
  imgViewer: initialIimgViewer
}

const AppContext = createContext<{
  state: InitialStateType;
  dispatch: React.Dispatch<any>;
}>({
  state: initialState,
  dispatch: () => null
});

const mainReducer = (
  { user, prevAnalyses, createAnalysis, dcmImages, stagingDcmImages, imgViewer}: InitialStateType,
  action: any, // or UserActions | AnalysisActions
) => ({
  user: userReducer(user, action),
  prevAnalyses: analysesReducer(prevAnalyses, action),
  createAnalysis: createAnalysisReducer(createAnalysis, action),
  dcmImages: dicomImagesReducer(dcmImages, action),
  stagingDcmImages: stagingDcmImgsReducer(stagingDcmImages, action),
  imgViewer: imgViewerReducer(imgViewer, action)
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

