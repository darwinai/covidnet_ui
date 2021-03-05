import Client from "@fnndsc/chrisapi";
import { IUserState } from '../context/reducers/userReducer';

// returns true if login succeed and false otherwises
export const handleLogin = async (username: string, password: string): Promise<boolean> => {
  try {
    const authURL = `${process.env.REACT_APP_CHRIS_UI_AUTH_URL}`;

    const res: string = await Client.getAuthToken(authURL, username, password)
    window.sessionStorage.setItem("AUTH_TOKEN", res);
    window.sessionStorage.setItem("USERNAME", username);
    return true
  } catch (error) {
    return false
  }
}
