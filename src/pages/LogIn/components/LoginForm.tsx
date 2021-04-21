import { LoginForm } from "@patternfly/react-core";
import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { Types } from "../../../context/actions/types";
import { AppContext } from "../../../context/context";
import { handleLogin } from "../../../services/login";
import ChrisAPIClient from "../../../api/chrisapiclient";
import { IUserState } from "../../../context/reducers/userReducer";
import Client, { User } from "@fnndsc/chrisapi";

const LoginFormComponent = () => {
  const history = useHistory();
  const [usernameValue, setUsernameValue] = useState("");
  const [passwordValue, setPasswordValue] = useState("");
  const [isValidCredentials, setIsValidCredentials] = useState(true);

  const { dispatch } = React.useContext(AppContext);

  const handleSubmit = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();

    const isLoginSuccessful = await handleLogin(usernameValue, passwordValue);
    if (isLoginSuccessful) {
      setIsValidCredentials(true);
      const client: Client = ChrisAPIClient.getClient();
      const res: User = await client.getUser();
      const user: IUserState = res?.data;
      dispatch({
        type: Types.LOGIN_UPDATE,
        payload: user
      });
      history.push('/');
    } else {
      setIsValidCredentials(false);
    }
  }

  return (
    <LoginForm
      showHelperText={!isValidCredentials}
      helperText="Invalid username or password."
      usernameLabel="Username"
      usernameValue={usernameValue}
      onChangeUsername={(val) => setUsernameValue(val)}
      isValidUsername={isValidCredentials}
      passwordLabel="Password"
      passwordValue={passwordValue}
      onChangePassword={(val) => setPasswordValue(val)}
      isValidPassword={isValidCredentials}
      onLoginButtonClick={handleSubmit}
    />
  );
}

export default LoginFormComponent;
