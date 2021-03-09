import Client from "@fnndsc/chrisapi";

// Returns true if login succeeds and false otherwise
export const handleLogin = async (username: string, password: string): Promise<boolean> => {
  try {
    const authURL = `${process.env.REACT_APP_CHRIS_UI_AUTH_URL}`;

    const res: string = await Client.getAuthToken(authURL, username, password);
    window.sessionStorage.setItem("AUTH_TOKEN", res);
    return true
  } catch (error) {
    return false
  }
}
