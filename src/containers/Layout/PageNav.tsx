import { Nav, NavItem, NavList } from "@patternfly/react-core";
import React from "react";
import { Link, useLocation } from 'react-router-dom';

const navMap = [
  { 'label': 'Generate Prediction', 'path': '/' },
  { 'label': 'Past Predictions', 'path': '/pastPredictions' }
];

const PageNav = () => {
  let location = useLocation();

  return (
    <Nav aria-label="Nav" theme="light" variant="horizontal">
      <NavList>
        {navMap.map((navItem, index) => (
          <NavItem
            key={index}
            itemId={index}
            isActive={location.pathname === navItem.path}
          >
            <Link to={navItem.path}> { navItem.label } </Link>
          </NavItem>
        ))}
      </NavList>
    </Nav>
  );
}

export default PageNav;
