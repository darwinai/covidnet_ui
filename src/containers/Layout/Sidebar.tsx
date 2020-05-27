import * as React from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import { ApplicationState } from "../../store/root/applicationState";
import { IUiState } from "../../store/ui/types";
import { IUserState } from "../../store/user/types";
import {
    PageSidebar,
    Nav,
    NavItem,
    NavList,
    NavVariants
} from "@patternfly/react-core";


type AllProps = IUiState & IUserState;

class Sidebar extends React.Component<AllProps> {

    render() {
        const { sidebarActiveItem } = this.props;

        return (
            <Nav aria-label="Nav">
            <NavList variant={NavVariants.horizontal}>
              <NavItem itemId={0} isActive={sidebarActiveItem === "dashboard"}>
                <Link to={`/`}> Dashboard</Link>
              </NavItem>
              <NavItem itemId={1} isActive={sidebarActiveItem === "tab2"}>
                <Link to={`/`}> Dashboard</Link>
              </NavItem>
            </NavList>
          </Nav>
        );
    }
}

const mapStateToProps = ({ ui }: ApplicationState) => ({
    isSidebarOpen: ui.isSidebarOpen,
    sidebarActiveItem: ui.sidebarActiveItem,
    sidebarActiveGroup: ui.sidebarActiveGroup,
});

export default connect(
    mapStateToProps
)(Sidebar);
