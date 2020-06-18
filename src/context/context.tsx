import React, { createContext, useReducer } from 'react';
import { analysesReducer, initialIPrevAnalysesState, IPrevAnalysesState } from './reducers/analyseReducer';
import { createAnalysisReducer, ICreateAnalysisState, initialICreateAnalysisState } from './reducers/createAnalysisReducer';
import { dicomImagesReducer, IDcmImagesState, initialIDcmImagesState } from './reducers/dicomImagesReducer';
import { initialIUserState, IUserState, userReducer } from './reducers/userReducer';

type InitialStateType = {
  user: IUserState;
  prevAnalyses: IPrevAnalysesState;
  createAnalysis: ICreateAnalysisState;
  dcmImages: IDcmImagesState
}

const initialState: InitialStateType = {
  user: initialIUserState,
  prevAnalyses: initialIPrevAnalysesState,
  createAnalysis: initialICreateAnalysisState,
  dcmImages: initialIDcmImagesState
}

const AppContext = createContext<{
  state: InitialStateType;
  dispatch: React.Dispatch<any>;
}>({
  state: initialState,
  dispatch: () => null
});

const mainReducer = (
  { user, prevAnalyses, createAnalysis, dcmImages}: InitialStateType,
  action: any, // or UserActions | AnalysisActions
) => ({
  user: userReducer(user, action),
  prevAnalyses: analysesReducer(prevAnalyses, action),
  createAnalysis: createAnalysisReducer(createAnalysis, action),
  dcmImages: dicomImagesReducer(dcmImages, action)
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

