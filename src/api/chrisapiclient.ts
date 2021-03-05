import Client from '@fnndsc/chrisapi';

declare var process: {
  env: {
    REACT_APP_CHRIS_UI_URL: string,
  }
};

const AUTH_TOKEN_KEY = 'AUTH_TOKEN';

/**
 * This is a singleton to hold an instantiated, authenticated `Client` object,
 * in order to prevent  every component that needs the client from having to be
 * passed the token, declare process.env variables, etc.
 */

class ChrisAPIClient {

  private static client: Client;
  private static tokenIsUnauthorized: boolean;

  static getClient(): Client {
    if (!this.client || this.tokenIsUnauthorized) {
      const token: string = window.sessionStorage.getItem(AUTH_TOKEN_KEY) || '';
      if (token) {
        this.tokenIsUnauthorized = true;
      } else {
        this.tokenIsUnauthorized = false;
      }
      this.client = new Client(process.env.REACT_APP_CHRIS_UI_URL, {
        token
      });
    }
    return this.client;
  }

  static setTokenIsUnauthorized(tokenIsUnauthorized: boolean) {
    this.tokenIsUnauthorized = tokenIsUnauthorized;
  }

}

export default ChrisAPIClient;
