import { ActionMap, Types } from "../actions/types";

export type IUserState = {
  id?: number;
  username: string;
  email: string;
  loggedIn?: boolean;
}

export let initialIUserState = {
  username: '',
  email: '',
  loggedIn: false
}

type UserPayload = {
  [Types.LOGIN_UPDATE]: IUserState,
  [Types.LOGOUT_UPDATE]: null
}

export type UserActions = ActionMap<UserPayload>[
  keyof ActionMap<UserPayload>
]

export const userReducer = (
  state: IUserState,
  action: UserActions
) => {
  switch (action.type) {
    // case Types.
    case Types.LOGIN_UPDATE:
      return {
        ...action.payload,
        loggedIn: true
      }
    case Types.LOGOUT_UPDATE:
      return {
        username: '',
        email: '',
        loggedIn: false
      }
    default:
      return state;
  }
}