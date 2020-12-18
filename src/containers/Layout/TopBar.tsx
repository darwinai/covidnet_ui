import { Nav, NavItem, NavList } from "@patternfly/react-core";
import React from "react";
import { Link } from "react-router-dom";
import { useLocation } from 'react-router-dom'

const TopBar = () => {
    let location = useLocation();

    return (
        <Nav aria-label="Nav" theme="light" variant="horizontal">
        <NavList>
            <NavItem itemId={0} isActive={location.pathname === "/"}>
            <Link to={`/`}> Dashboard</Link>
            </NavItem>
            <NavItem itemId={1} isActive={location.pathname === "/createAnalysis"}>
            <Link to={`/createAnalysis`}> Create Analysis</Link>
            </NavItem>
        </NavList>
        </Nav>
    );
}

export default TopBar;
