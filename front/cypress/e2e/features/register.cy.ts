import users from '../../fixtures/users.json';

describe('registering user account', () => {
  before(() => {
    cy.task('saveUserJson');
    cy.task('resetDatabase');
  });

  beforeEach(() => {
    cy.visit('/register');
  });

  it('should check if not fill in all field', () => {
    const user = users[0];

    cy.log(`user 
    ${user.firstName} 
    ${user.lastName} 
    ${user.username} 
    ${user.password}`);

    // no value filled in
    cy.get('[data-test="register-btn"]').click();
    cy.on('window:alert', str => {
      expect(str, 'no value filled in').to.equal('Please fill in all fields');
    });
    cy.on('window:confirm', () => true);

    // only username and password filled in
    cy.get('[data-test="username"]').type(user.username);
    cy.get('[data-test="password"]').type(user.password);
    cy.get('[data-test="confirm-password"]').type(user.password);

    cy.on('window:alert', str => {
      expect(str, 'only user and password field in').to.equal(
        'Please fill in all fields',
      );
    });
  });

  it('should check if password and confirm password are not the same', () => {
    const user = users[0];

    cy.get('[data-test="username"]').type(user.username);
    cy.get('[data-test="first-name"]').type(user.firstName);
    cy.get('[data-test="last-name"]').type(user.lastName);
    cy.get('[data-test="password"]').type(user.password);
    cy.get('[data-test="confirm-password"]').type('not the same password');

    cy.get('[data-test="register-btn"]').click();
    cy.on('window:alert', str => {
      expect(str, 'password and confirm password are not the same').to.equal(
        'Password does not match',
      );
    });
  });

  it('should check if password is too short (< 8 character)', () => {
    const user = users[0];

    cy.get('[data-test="username"]').type(user.username);
    cy.get('[data-test="first-name"]').type(user.firstName);
    cy.get('[data-test="last-name"]').type(user.lastName);
    cy.get('[data-test="password"]').type(user.password.slice(0, 7));
    cy.get('[data-test="confirm-password"]').type(user.password);

    cy.get('[data-test="register-btn"]').click();
    cy.on('window:alert', str => {
      expect(str, 'password is too short').to.equal(
        'Password must be at least 8 characters',
      );
    });
  });

  it('should be able to create new user', () => {
    const user = users[0];

    cy.get('[data-test="username"]').type(user.username);
    cy.get('[data-test="first-name"]').type(user.firstName);
    cy.get('[data-test="last-name"]').type(user.lastName);
    cy.get('[data-test="password"]').type(user.password);
    cy.get('[data-test="confirm-password"]').type(user.password);

    cy.get('[data-test="register-btn"]').click();
    cy.wait(1000);
    cy.location('pathname').should('eq', '/login');
  });

  it('should check if user is already registered', () => {
    const user = users[0];

    cy.get('[data-test="username"]').type(user.username);
    cy.get('[data-test="first-name"]').type(user.firstName);
    cy.get('[data-test="last-name"]').type(user.lastName);
    cy.get('[data-test="password"]').type(user.password);
    cy.get('[data-test="confirm-password"]').type(user.password);

    cy.on('window:alert', str => {
      expect(str, 'user is already registered').to.equal(
        'Cannot create new user: Username already exists',
      );
    });

    // on windows redirect to login page, redirect to register page
    cy.get('[data-test="register-btn"]').click();
    cy.wait(1000);
  });
});
