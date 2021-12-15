import Client from "@fnndsc/chrisapi";
import { AUTH_TOKEN_KEY } from "../api/chrisapiclient"

// Returns true if login succeeds and false otherwise
export const handleLogin = async (username: string, password: string): Promise<boolean> => {
  try {
    const authURL = process.env.REACT_APP_CHRIS_UI_AUTH_URL || "/api/v1/auth-token/";

    const res: string = await Client.getAuthToken(authURL, username, password);
    window.sessionStorage.setItem(AUTH_TOKEN_KEY, res);
    return true
  } catch (error) {
    return false
  }
}
