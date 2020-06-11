import React, { createContext, useReducer } from 'react';
import {
  analysesReducer, initialIPrevAnalysesState,
  IPrevAnalysesState
} from './reducers/analyseReducer';
import { initialIUserState, IUserState, userReducer } from './reducers/userReducer';
import { ICreateAnalysisState, initialICreateAnalysisState, createAnalysisReducer } from './reducers/createAnalysisReducer';

type InitialStateType = {
  user: IUserState;
  prevAnalyses: IPrevAnalysesState;
  createAnalysis: ICreateAnalysisState;
}

const initialState: InitialStateType = {
  user: initialIUserState,
  prevAnalyses: initialIPrevAnalysesState,
  createAnalysis: initialICreateAnalysisState
}

const AppContext = createContext<{
  state: InitialStateType;
  dispatch: React.Dispatch<any>;
}>({
  state: initialState,
  dispatch: () => null
});

const mainReducer = (
  { user, prevAnalyses, createAnalysis}: InitialStateType,
  action: any, // or UserActions | AnalysisActions
) => ({
  user: userReducer(user, action),
  prevAnalyses: analysesReducer(prevAnalyses, action),
  createAnalysis: createAnalysisReducer(createAnalysis, action)
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
