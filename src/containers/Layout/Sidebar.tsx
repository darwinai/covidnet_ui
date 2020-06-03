import { Nav, NavItem, NavList, NavVariants } from "@patternfly/react-core";
import React, { useState } from "react";
import { Link } from "react-router-dom";



const TopBar = () => {
    const [sidebarActiveItem] = useState("dashboard");

    return (
        <Nav aria-label="Nav">
        <NavList variant={NavVariants.horizontal}>
            <NavItem itemId={0} isActive={sidebarActiveItem === "dashboard"}>
            <Link to={`/`}> Dashboard</Link>
            </NavItem>
            <NavItem itemId={1} isActive={sidebarActiveItem === "tab2"}>
            <Link to={`/`}> Dashboard</Link>
            </NavItem>
            <NavItem itemId={1} isActive={sidebarActiveItem === "tab3"}>
            <Link to={`/`}> Dashboard</Link>
            </NavItem>
        </NavList>
        </Nav>
    );
}

export default TopBar;
