import users from '../../fixtures/users.json';
import locations from '../../fixtures/locations.json';

describe('party system', () => {
  beforeEach(() => {
    cy.task('resetDatabase');
    cy.cleanWebsocket();
    cy.register(users[0]);
    cy.register(users[1]);
    cy.visit('/login');
    cy.logout();
  });
  describe('create and join party', () => {
    it('should create party successfully', () => {
      cy.mockGeolocation(locations[10]);
      cy.login(users[0].username, users[0].password);
      cy.wait(3000);
      cy.get('[src="/rice.png"]', { timeout: 5000 }).should('be.visible');
      cy.get('[data-test="create-party-btn"]').click();
      cy.get('[data-test="location-text"]').should($input => {
        expect($input).not.to.value('Move the map to update location');
      });
      cy.get('[data-test="create-party-location-btn"]').click();
      cy.url().should('include', '/createparty');

      cy.get('[data-test="create-party-btn"]').click();
      cy.on('window:alert', str => {
        expect(str, 'check no value filled in').to.equal(
          'Please fill in all fields',
        );
      });

      cy.get('[data-test="party-name"]').type('test party 1');
      cy.get('[data-test="party-description"]').type(
        'test party 1 description',
      );
      cy.get('[data-test="budget"]').select('$$$');
      cy.get('[data-test="party-size"]').type('12');
      cy.get('[data-test="create-party-btn"]').click();
      cy.wait(3000);
      cy.url().should('include', '/currentparty');
    });
  });
});
