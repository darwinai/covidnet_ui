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
  [Types.Login_update]: IUserState,
  [Types.Logout_update]: null
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
    case Types.Login_update:
      return {
        ...action.payload,
        loggedIn: true
      }
    case Types.Logout_update:
      return {
        username: '',
        email: '',
        loggedIn: false
      }
    default:
      return state;
  }
}