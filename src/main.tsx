import { History } from 'history';
import * as React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from "./context/context";
import RouterWrapper from "./RouterWrapper";
import Routes from './routes';

interface AllProps {
  history: History;
}

const Main = (props: AllProps) => {

  return (
    <AppProvider>
      <BrowserRouter>
        <RouterWrapper>
          <Routes />
        </RouterWrapper>
      </BrowserRouter>
    </AppProvider>
  );
}

export default Main;
