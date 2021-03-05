import { LoginForm } from "@patternfly/react-core";
import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { Types } from "../../../context/actions/types";
import { AppContext } from "../../../context/context";
import { handleLogin } from "../../../services/login";

const LoginFormComponent = () => {
  const history = useHistory();
  const [showHelperText] = useState(false);
  const [usernameValue, setUsernameValue] = useState('chris');
  const [isValidUsername] = useState(true);
  const [passwordValue, setPasswordValue] = useState('chris1234');
  const [RememberMeClick, setRememberMeClick] = useState(true);

  const { dispatch } = React.useContext(AppContext);

  const handleSubmit = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    handleLogin(usernameValue, passwordValue)
    .then(res => {
      if (res) {
        dispatch({
          type: Types.Login_update,
          payload: {
            username: usernameValue,
          }
        });
        history.push('/');
        return;
      } else {
        console.log('login failed')
      }
    })
    event.preventDefault();
  }

  return (
    <LoginForm
      showHelperText={showHelperText}
      helperText="Invalid login credentials."
      usernameLabel="Username"
      usernameValue={usernameValue}
      onChangeUsername={(val) => setUsernameValue(val)}
      isValidUsername={isValidUsername}
      passwordLabel="Password"
      passwordValue={passwordValue}
      onChangePassword={(val) => setPasswordValue(val)}
      isValidPassword={true}
      rememberMeLabel="Keep me logged in for 30 days."
      isRememberMeChecked={RememberMeClick}
      onChangeRememberMe={() => setRememberMeClick(!RememberMeClick)}
      onLoginButtonClick={handleSubmit}
    />
  );
}

export default LoginFormComponent;
