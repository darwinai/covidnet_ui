import { LoginPage, Page } from "@patternfly/react-core";
import React from "react";
import { RouteComponentProps } from "react-router-dom";
import brandImg from "../../assets/images/logo.gif";
import LoginFormComponent from "./components/LoginForm";
import Footer from "../../containers/Layout/Footer";
import "./login.scss";
type AllProps = RouteComponentProps;

class LogInPage extends React.Component<AllProps> {

  render() {
    return (
      <Page>
        <LoginPage
          className="login pf-background"
          style={{ "background": "black" }} // not sure why the background image wouldn't show
          //footerListVariants="inline"
          brandImgSrc={brandImg}
          brandImgAlt="DarwinAI logo"
          textContent=""
          loginTitle="Log in to your account"
        >
          <LoginFormComponent />
          <Footer isLogin />
        </LoginPage>
      </Page>

    );
  }
}

export default LogInPage;
