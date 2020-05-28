import React, { createContext, useReducer } from 'react';
import {
  userReducer,
  UserActions
} from './reducers/userReducer';
import {IUserState} from './reducers/userReducer'

type InitialStateType = {
  user: IUserState;
}

const initialState: InitialStateType = {
  user: {
    username: 'chris',
    password: 'chris1234',
    loggedIn: false
  }
}

const AppContext = createContext<{
  state: InitialStateType;
  dispatch: React.Dispatch<any>;
}>({
  state: initialState,
  dispatch: () => null
});

const mainReducer = (
  { user }: InitialStateType,
  action: UserActions
) => ({
  user: userReducer(user, action),
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