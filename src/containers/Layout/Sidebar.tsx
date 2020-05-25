import * as React from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import { ApplicationState } from "../../store/root/applicationState";
import { IUiState } from "../../store/ui/types";
import { IUserState } from "../../store/user/types";
import {
    PageSidebar,
    Nav,
    NavExpandable,
    NavItem,
    NavList,
    NavGroup
} from "@patternfly/react-core";


type AllProps = IUiState & IUserState;

class Sidebar extends React.Component<AllProps> {

    render() {
        const { isSidebarOpen, sidebarActiveItem, sidebarActiveGroup } = this.props;

        const PageNav = (
            <Nav aria-label="Navigation" theme="dark">
                <NavList>
                    <NavGroup title="Navigation">
                        <NavExpandable title="My Feeds" groupId="feeds_grp" isActive={sidebarActiveGroup === "feeds_grp"} isExpanded >
                            <NavItem groupId="feeds_grp" itemId="dashboard" isActive={sidebarActiveItem === "dashboard"}>
                                <Link to={`/`}>Dashboard</Link>
                            </NavItem>
                        </NavExpandable>
                    </NavGroup>
                </NavList>
            </Nav>
        );
        return (
            <PageSidebar nav={PageNav} isNavOpen={isSidebarOpen} theme="dark" />
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
