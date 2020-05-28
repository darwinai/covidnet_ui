import { IUserState } from '../context/reducers/userReducer';
import Client from "@fnndsc/chrisapi";

// returns true if login succeed and false otherwises
export const handleLogin = async (user: IUserState): Promise<boolean> => {
  try {
    const authURL = `${process.env.REACT_APP_CHRIS_UI_AUTH_URL}`;
    const username = user.username;
    const authObj = {
      password: user.password,
      username
    };
    const res: string = await Client.getAuthToken(authURL, authObj.username, authObj.password)
    // yield put(getAuthTokenSuccess(res));
    window.sessionStorage.setItem("AUTH_TOKEN", res);
    window.sessionStorage.setItem("USERNAME", username);
    return true
    // yield put(push("/"));
  } catch (error) {
    return false
  }
}
