import { LoginPage } from "@patternfly/react-core";
import * as React from "react";
import { RouteComponentProps } from "react-router-dom";
import brandImg from "../../assets/images/logo.gif";
import LoginFormComponent from "./components/LoginForm";
import Footer from "../../containers/Layout/Footer";
import "./login.scss";
type AllProps = RouteComponentProps;

class LogInPage extends React.Component<AllProps> {
  componentDidMount() {
    document.title = "Log in into your ChRIS Account";
  }

  render() {
    return (
      <LoginPage
        className="login pf-background"
        style={{"background":"black"}} // not sure why the background image wouldn't show
        //footerListVariants="inline"
        brandImgSrc={brandImg}
        brandImgAlt="PatternFly logo"
        textContent=""
        loginTitle="Log in to your account"
      >
          <LoginFormComponent />
          <Footer />
      </LoginPage>
    );
  }
}

export default LogInPage;
