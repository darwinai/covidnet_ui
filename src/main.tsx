import * as React from 'react';
import Routes from './routes';
import { History } from 'history';
import { BrowserRouter } from 'react-router-dom'

interface AllProps {
  history: History;
}

const Main = (props: AllProps) => {
  return (
    <BrowserRouter>
      <Routes />
    </BrowserRouter>
  );
}

export default Main;
