import users from '../../fixtures/users.json';

describe('editing profile', () => {
  beforeEach(() => {
    cy.task('resetDatabase');
    cy.cleanWebsocket();
    cy.register(users[0]);
    cy.visit('/login');
  });

  it('should handle no password', () => {
    cy.login(users[0].username, users[0].password);
    cy.get('[data-test="nav-btn"]').click();
    cy.get('[href="/editprofile"]').click();
    cy.get('[data-test="edit-profile-btn"]').click();
    cy.on('window:alert', str => {
      expect(str, 'no password').to.equal('Please fill in all fields');
    });
  });

  it('should handle no first name or last name', () => {
    cy.login(users[0].username, users[0].password);
    cy.get('[data-test="nav-btn"]').click();
    cy.get('[href="/editprofile"]').click();
    cy.get('[data-test="confirm-password"]').type(users[0].password);
    cy.get('[data-test="first-name"]').clear();
    cy.get('[data-test="edit-profile-btn"]').click();
    cy.get('[data-test="last-name"]').clear();
    cy.get('[data-test="edit-profile-btn"]').click();
    cy.on('window:alert', str => {
      expect(str, 'no first name').to.equal('Please fill in all fields');
    });
  });

  it('should handle no change to profile', () => {
    cy.login(users[0].username, users[0].password);
    cy.get('[data-test="nav-btn"]').click();
    cy.get('[href="/editprofile"]').click();
    cy.get('[data-test="confirm-password"]').type(users[0].password);
    cy.get('[data-test="edit-profile-btn"]').click();
    cy.on('window:alert', str => {
      expect(str, 'no changes').to.equal(
        'Please change make changes to your profile',
      );
    });
  });

  it('should handle wrong password', () => {
    cy.login(users[0].username, users[0].password);
    cy.get('[data-test="nav-btn"]').click();
    cy.get('[href="/editprofile"]').click();
    cy.get('[data-test="last-name"]').clear().type('new last name');
    cy.get('[data-test="confirm-password"]').type('wrong password');
    cy.get('[data-test="edit-profile-btn"]').click();
    cy.wait(3000);
    cy.on('window:alert', str => {
      expect(str, 'wrong password').to.equal(
        'Cannot create edit profile: Password is incorrect',
      );
    });
  });

  it('should be able to edit profile', () => {
    cy.login(users[0].username, users[0].password);
    cy.get('[data-test="nav-btn"]').click();
    cy.get('[href="/editprofile"]').click();
    cy.get('[data-test="confirm-password"]').type(users[0].password);
    cy.get('[data-test="first-name"]').clear().type('new first name');
    cy.get('[data-test="last-name"]').clear().type('new last name');
    cy.get('[data-test="edit-profile-btn"]').click();
    cy.login(users[0].username, users[0].password);
    cy.get('[data-test="nav-btn"]').click();
    cy.get('[href="/editprofile"]').click();
    cy.get('[data-test="first-name"]').should('have.value', 'new first name');
    cy.get('[data-test="last-name"]').should('have.value', 'new last name');
  });
});
