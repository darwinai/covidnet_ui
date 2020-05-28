import { Types } from "../actions/types";

export type IUserState = {
  username: string;
  password: string;
  loggedIn?: boolean;
}


type ActionMap<M extends { [index: string]: any }> = {
  [Key in keyof M]: M[Key] extends undefined
  ? {
    type: Key;
  }
  : {
    type: Key;
    payload: M[Key];
  }
};

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