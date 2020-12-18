import { History } from 'history';
import * as React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from "./context/context";
import Routes from './routes';

interface AllProps {
  history: History;
}

const Main = (props: AllProps) => {

  return (
    <AppProvider>
      <BrowserRouter>
        <Routes />
      </BrowserRouter>
    </AppProvider>
  );
}

export default Main;
