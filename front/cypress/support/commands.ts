/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }

Cypress.Commands.add('login', (username: string, password: string) => {
  cy.visit('/login');
  cy.get('input[name=username]').type(username);
  cy.get('input[name=password]').type(`${password}{enter}`, { log: false });
  cy.url().should('include', '/home');
});

Cypress.Commands.add(
  'register',
  (user: {
    username: string;
    firstName: string;
    lastName: string;
    password: string;
  }) => {
    cy.request('POST', Cypress.env('API_URL') + '/auth/register', {
      user_name: user.username,
      first_name: user.firstName,
      last_name: user.lastName,
      password: user.password,
      confirm_password: user.password,
    }).then(res => {
      expect(res.status).to.equal(200);
    });
  },
);

Cypress.Commands.add('logout', () => {
  if (localStorage.getItem('token') !== null) {
    localStorage.removeItem('token');
  }
  cy.url().then(url => {
    if (!url.includes('/login')) {
      cy.visit('/login');
    }
  });
});

Cypress.Commands.add('mockGeolocation', (coords: number[]) => {
  cy.window().then(win => {
    cy.wrap(
      Cypress.automation('remote:debugger:protocol', {
        command: 'Browser.grantPermissions',
        params: {
          permissions: ['geolocation'],
          origin: win.location.origin,
        },
      }),
    );
  });

  console.debug(
    `cypress::setGeolocationOverride with position ${JSON.stringify(coords)}`,
  );

  cy.log('**setGeolocationOverride**').then(() =>
    Cypress.automation('remote:debugger:protocol', {
      command: 'Emulation.setGeolocationOverride',
      params: {
        latitude: coords[0],
        longitude: coords[1],
        accuracy: 50,
      },
    }),
  );
});

Cypress.Commands.add('cleanWebsocket', () => {
  cy.log(Cypress.env('TEST_KEY'));
  const env = Cypress.env();
  cy.request('POST', env.API_URL + '/clean_ws', {
    test_key: Cypress.env('TEST_KEY'),
  }).should(res => {
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('status', true);
  });
});

Cypress.Commands.add('createParty', (partyLocation: number[], partyInfo) => {
  cy.mockGeolocation(partyLocation);
  const { partyName, partyDescription, budget, partySize } = partyInfo;

  cy.wait(2500);
  cy.visit('/home');
  cy.get('[data-test="create-party-btn"]').click();
  cy.get('[data-test="location-text"]').should($input => {
    expect($input).not.to.value('Move the map to update location');
  });
  cy.get('[data-test="create-party-location-btn"]').click();
  cy.url().should('include', '/createparty');

  cy.get('[data-test="party-name"]').type(partyName);
  cy.get('[data-test="party-description"]').type(partyDescription);
  cy.get('[data-test="budget"]').select(budget);
  cy.get('[data-test="party-size"]').type(partySize);
  cy.get('[data-test="create-party-btn"]').click();
  cy.wait(3000);
  cy.url().should('include', '/currentparty');
});
