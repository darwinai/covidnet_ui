import Client from "@fnndsc/chrisapi";
import { IUserState } from '../context/reducers/userReducer';

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
    window.sessionStorage.setItem("AUTH_TOKEN", res);
    window.sessionStorage.setItem("USERNAME", username);
    return true
  } catch (error) {
    return false
  }
}
