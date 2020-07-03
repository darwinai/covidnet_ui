import * as React from "react";

import { Page } from "@patternfly/react-core";
import Header from "./Header";
import "./layout.scss";
import { AppContext } from "../../context/context";
import { Types } from "../../context/actions/types";

interface WrapperProps {
  children: React.ReactNode
}

const Wrapper = (props: WrapperProps) => {
  
  const { dispatch } = React.useContext(AppContext);


  React.useEffect(()=>{
    const token = window.sessionStorage.getItem('AUTH_TOKEN')
    if (!!token) {
      dispatch({
        type: Types.Login_update,
        payload: {
          username: 'chris',
          password: 'chris1234'
        }
      });
    }
  },[dispatch])

  const { children } = props

  return (
    <Page
      className="pf-background"
      header={<Header />}
    >
      {children}
    </Page>
  );

}

export default Wrapper;
