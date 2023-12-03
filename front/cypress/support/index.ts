declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to select DOM element by data-cy attribute.
       * @example cy.dataCy('greeting')
       */
      login(username: string, password: string): Chainable<null>;
      register(user: {
        username: string;
        firstName: string;
        lastName: string;
        password: string;
      }): Chainable<null>;
      logout(): Chainable<null>;
      mockGeolocation(coords: number[]): Chainable<null>;
      cleanWebsocket(): Chainable<null>;
    }
  }
}
export {};
