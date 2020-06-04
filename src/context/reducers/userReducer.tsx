import { Types, ActionMap } from "../actions/types";

export type IUserState = {
  username: string;
  password: string;
  loggedIn?: boolean;
}

export let initialIUserState = {
  username: '',
  password: '',
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
        username: action.payload.username,
        password: action.payload.password,
        loggedIn: true
      }
    case Types.Logout_update:
      return {
        username: '',
        password: '',
        loggedIn: false
      }
    default:
      return state;
  }
}