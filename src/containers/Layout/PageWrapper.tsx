import * as React from "react";
import { connect } from "react-redux";
import { ApplicationState } from "../../store/root/applicationState";
import { IUiState } from "../../store/ui/types";
import { onSidebarToggle } from "../../store/ui/actions";
import { Page } from "@patternfly/react-core";
import Header from "./Header";
import Sidebar from "./Sidebar";
import "./layout.scss";

interface IOtherProps {
  children: any;
}
interface IPropsFromDispatch {
}
type AllProps = IUiState & IOtherProps & IPropsFromDispatch;

class Wrapper extends React.Component<AllProps> {
  // Description: toggles sidebar on pageresize
  onPageResize = (data: { mobileView: boolean; windowSize: number }) => {
    const { isSidebarOpen } = this.props;
    !data.mobileView && !isSidebarOpen && onSidebarToggle(!isSidebarOpen);
  };
  onToggle = () => {
    const { isSidebarOpen } = this.props;
    onSidebarToggle(!isSidebarOpen);
  };
  render() {
    const { children } = this.props;

    return (
      <Page
        className="pf-background"
        header={<Header onSidebarToggle={this.onToggle} />}
        onPageResize={this.onPageResize}
      >
        {children}
      </Page>
    );
  }
}

const mapStateToProps = ({ ui }: ApplicationState) => ({
  isSidebarOpen: ui.isSidebarOpen,
  loading: ui.loading,
});

export default connect(mapStateToProps)(Wrapper);
