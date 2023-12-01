import { generateUser } from '../../utils/generateUser';

describe('registering user account', () => {
  beforeEach(() => {
    cy.visit('/register');
  });

  it('should check if not fill in all field', () => {
    const fillText = 'Please fill in all fields';
    const randomUser = generateUser();

    cy.log(`randomly generated user 
    ${randomUser.firstName} 
    ${randomUser.lastName} 
    ${randomUser.username} 
    ${randomUser.password}`);

    // no value filled in
    cy.get('[data-test="register-btn"]').click();
    cy.on('window:alert', str => {
      expect(str, 'no value filled in').to.equal(fillText);
    });
    cy.on('window:confirm', () => true);

    // only username and password filled in
    cy.get('[data-test="username"]').type(randomUser.username);
    cy.get('[data-test="password"]').type(randomUser.password);
    cy.get('[data-test="confirm-password"]').type(randomUser.password);

    cy.on('window:alert', str => {
      expect(str, 'only user and password field in').to.equal(fillText);
    });
  });

  it('should check if password and confirm password are not the same', () => {
    const randomUser = generateUser();

    cy.log('randomly generated user', randomUser);

    cy.get('[data-test="username"]').type(randomUser.username);
    cy.get('[data-test="first-name"]').type(randomUser.firstName);
    cy.get('[data-test="last-name"]').type(randomUser.lastName);
    cy.get('[data-test="password"]').type(randomUser.password);
    cy.get('[data-test="confirm-password"]').type('not the same password');

    cy.get('[data-test="register-btn"]').click();
    cy.on('window:alert', str => {
      expect(str, 'password and confirm password are not the same').to.equal(
        'Password does not match',
      );
    });
  });

  it('should check if password is too short (< 8 character)', () => {
    const randomUser = generateUser(3);

    cy.log('randomly generated user', randomUser);

    cy.get('[data-test="username"]').type(randomUser.username);
    cy.get('[data-test="first-name"]').type(randomUser.firstName);
    cy.get('[data-test="last-name"]').type(randomUser.lastName);
    cy.get('[data-test="password"]').type(randomUser.password);
    cy.get('[data-test="confirm-password"]').type(randomUser.password);

    cy.get('[data-test="register-btn"]').click();
    cy.on('window:alert', str => {
      expect(str, 'password is too short').to.equal(
        'Password must be at least 8 characters',
      );
    });
  });

  it('should be able to create new user', () => {
    const randomUser = generateUser();

    cy.log('randomly generated user', randomUser);

    cy.get('[data-test="username"]').type(randomUser.username);
    cy.get('[data-test="first-name"]').type(randomUser.firstName);
    cy.get('[data-test="last-name"]').type(randomUser.lastName);
    cy.get('[data-test="password"]').type(randomUser.password);
    cy.get('[data-test="confirm-password"]').type(randomUser.password);

    cy.get('[data-test="register-btn"]').click();
    cy.wait(1000);
    cy.location('pathname').should('eq', '/login');
  });

  it('should check if user is already registered', () => {
    const randomUser = generateUser();

    cy.log('randomly generated user', randomUser);

    cy.get('[data-test="username"]').type(randomUser.username);
    cy.get('[data-test="first-name"]').type(randomUser.firstName);
    cy.get('[data-test="last-name"]').type(randomUser.lastName);
    cy.get('[data-test="password"]').type(randomUser.password);
    cy.get('[data-test="confirm-password"]').type(randomUser.password);

    cy.on('window:alert', str => {
      expect(str, 'user is already registered').to.equal(
        'Cannot create new user: Username already exists',
      );
    });

    // on windows redirect to login page, redirect to register page
    cy.get('[data-test="register-btn"]').click();
    cy.wait(1000);
    cy.get('[data-test="register-link"]').click();

    cy.get('[data-test="username"]').type(randomUser.username);
    cy.get('[data-test="first-name"]').type(randomUser.firstName);
    cy.get('[data-test="last-name"]').type(randomUser.lastName);
    cy.get('[data-test="password"]').type(randomUser.password);
    cy.get('[data-test="confirm-password"]').type(randomUser.password);
    cy.get('[data-test="register-btn"]').click();
    cy.wait(1500);
  });
});
