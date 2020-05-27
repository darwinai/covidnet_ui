import React, { useState } from "react";
import { LoginForm } from "@patternfly/react-core";

const LoginFormComponent = () => {
  const [showHelperText] = useState(false)
  const [usernameValue, setUsernameValue] = useState('chris')
  const [isValidUsername] = useState(true)
  const [passwordValue, setPasswordValue] = useState('chris1234')
  const [RememberMeClick, setRememberMeClick] = useState(true)

  const handleSubmit = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>)=>{
    event.preventDefault();
  }

  return (
    <LoginForm
      showHelperText={showHelperText}
      helperText= "Invalid login credentials."
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
      rememberMeAriaLabel="Remember me Checkbox"
      onLoginButtonClick={handleSubmit}
    />
  );
}
    
export default LoginFormComponent;
