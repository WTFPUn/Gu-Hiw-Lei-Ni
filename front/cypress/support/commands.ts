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
  cy.session(
    username,
    () => {
      cy.visit('/login');
      cy.get('input[name=username]').type(username);
      cy.get('input[name=password]').type(`${password}{enter}`, { log: false });
      cy.url().should('include', '/home');
    },
    {
      validate: () => {
        expect(localStorage.getItem('token')).to.be.a('string');
      },
    },
  );
});

Cypress.Commands.add(
  'register',
  (username: string, firstName: string, lastName: string, password: string) => {
    cy.visit('/register');
    cy.get('input[name=username]').type(username);
    cy.get('input[name=firstName]').type(firstName);
    cy.get('input[name=lastName]').type(lastName);
    cy.get('input[name=password]').type(password);
    cy.get('input[name=confirmPassword]').type(password);
    cy.get('button[type=submit]').click();
    cy.on('window:alert', str => {
      expect(str, 'if user already exists').to.equal(
        'Cannot create new user: Username already exists',
      );
      cy.visit('/login');
    });
    cy.url().should('include', '/login');
  },
);
