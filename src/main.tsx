import * as React from 'react';
import Routes from './routes';
import { History } from 'history';
import { BrowserRouter } from 'react-router-dom'
import { AppProvider } from "./context/context";


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
