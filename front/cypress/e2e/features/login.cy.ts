import users from '../../fixtures/users.json';

describe('login user account', () => {
  before(() => {
    cy.task('saveUserJson');
    cy.task('resetDatabase');
    cy.register(users[0]);
  });
  beforeEach(() => {
    cy.visit('/login');
    cy.logout();
  });

  it('should check if not fill all ', () => {
    const user = users[0];
    cy.log(`user
    ${user.username}
    ${user.password}`);

    cy.get('[data-test="login-btn"]').click();
    cy.on('window:alert', str => {
      expect(str, 'no value filled in').to.equal('Please fill in all fields');
    });
    cy.on('window:confirm', () => true);
    cy.get('[data-test="username"]').type(user.username);
    cy.get('[data-test="login-btn"]').click();
  });

  it('should check if username/password is wrong', () => {
    cy.on('window:alert', str => {
      expect(str, 'password is wrong').to.equal('Invalid username or password');
    });
    cy.get('[data-test="username"]').type('wrong username');
    cy.get('[data-test="password"]').type('wrong password');
    cy.get('[data-test="login-btn"]').click().wait(1000);
    expect(localStorage.getItem('token')).to.be.null;
    cy.url().should('include', '/login');
  });

  it('should login successfully', () => {
    const user = users[0];
    cy.get('[data-test="username"]').type(user.username);
    cy.get('[data-test="password"]').type(user.password);
    cy.get('[data-test="login-btn"]').click().wait(1000);
    cy.url().should('include', '/home');
    cy.log('login successfully');
    cy.get('[data-test="nav-btn"]').click();
    cy.get('[data-test="logout-btn"]').click();
    cy.url().should('include', '/');
    cy.log('logout successfully');
  });
});
