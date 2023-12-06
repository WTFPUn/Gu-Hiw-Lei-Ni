import users from '../../fixtures/users.json';
import locations from '../../fixtures/locations.json';
import parties from '../../fixtures/parties.json';
import locations2km from '../../fixtures/locations-2km.json';
import { joinName } from '../../utils/generateUser';

describe('party system', () => {
  beforeEach(() => {
    cy.log('reset database');
    cy.task('resetDatabase');
    cy.cleanWebsocket();
    cy.register(users[0]);
    cy.register(users[1]);
    cy.register(users[2]);
    cy.register(users[3]);
    cy.visit('/login');
  });

  it('should create party successfully', () => {
    const location0 = locations[0];
    const user0 = users[0];
    const party0 = parties[0];
    cy.mockGeolocation(location0);
    cy.login(user0.username, user0.password);
    cy.get('[src="/rice.png"]', { timeout: 5000 }).should('be.visible');
    cy.get('[data-test="create-party-btn"]').click();
    cy.get('[data-test="location-text"]').should($input => {
      expect($input).not.to.value('Move the map to update location');
    });
    cy.get('[data-test="create-party-location-btn"]').click();
    cy.url().should('include', '/createparty');

    cy.log('check no value filled in');
    cy.get('[data-test="create-party-btn"]').click();
    cy.on('window:alert', str => {
      expect(str, 'check no value filled in').to.equal(
        'Please fill in all fields',
      );
    });

    cy.log('filling in party info');
    cy.get('[data-test="party-name"]').type(party0.partyName);
    cy.get('[data-test="party-description"]').type(party0.partyDescription);
    cy.get('[data-test="budget"]').select(party0.budget);
    cy.get('[data-test="party-size"]').type('' + party0.partySize);
    cy.get('[data-test="create-party-btn"]').click();
    cy.wait(2500);

    cy.url().should('include', '/currentparty');

    cy.get('[data-test="party-name"]').should('have.text', party0.partyName);
    cy.get('[data-test="table-row-secondaryparty-description"]').should(
      'have.text',
      party0.partyDescription,
    );
  });

  it('should join and leave party successfully', () => {
    const location0 = locations[0];
    const location1 = locations[1];
    const user0 = users[0];
    const user1 = users[1];
    const party0 = parties[0];

    cy.mockGeolocation(location0);
    cy.login(user0.username, user0.password);
    cy.createParty(party0);
    cy.mockGeolocation(location1);
    cy.login(user1.username, user1.password);
    cy.log('wait for marker to show up');
    cy.get('[data-test="hiw-0-m-0"]').click({ force: true });
    cy.get('[data-test="hiw-0-m-0"] > .absolute > img').should('be.visible');
    cy.log('click join button');
    cy.get('[data-test="join-btn"]').click();
    cy.log('go to current party page');
    cy.get('[data-test="more-info-btn"]').click();

    cy.log('check info in current party');
    cy.get('[data-test="party-name"]').should('have.text', party0.partyName);
    cy.get('[data-test="table-row-secondaryparty-description"]').should(
      'have.text',
      party0.partyDescription,
    );

    cy.log('check members for host and member');
    cy.get('[data-test="member-namehost"]').should(
      'have.text',
      joinName(user0),
    );
    cy.get('[data-test="member-name1"]').should('have.text', joinName(user1));

    cy.log('leave party');
    cy.get('[data-test="back-btn"]').click();
    cy.get('[src="/sushi.png"]', { timeout: 5000 }).should('be.visible');
    cy.get('[data-test="current-party-btn"]').click();
    cy.get('[data-test="leave-btn"]').click();
    cy.get('[src="/bwsushi.png"]', { timeout: 5000 })
      .should('be.visible')
      .click();
    cy.on('window:alert', str => {
      expect(str, 'should not be in party').to.equal('You are not in a party.');
    });
    cy.logout();
  });

  it('multiple users should be able to create party', () => {
    const location0 = locations[0];
    const location1 = locations[1];
    const location2 = locations[2];
    const user0 = users[0];
    const user1 = users[1];
    const user2 = users[2];
    const party0 = parties[0];
    const party1 = parties[1];

    cy.mockGeolocation(location0);
    cy.login(user0.username, user0.password);
    cy.createParty(party0);
    cy.logout();
    cy.mockGeolocation(location1);
    cy.login(user1.username, user1.password);
    cy.createParty(party1);
    cy.logout();
    cy.mockGeolocation(location2);
    cy.login(user2.username, user2.password);
    cy.createParty(party0);
    cy.visit('/home');
    cy.zoomIn(5);
    cy.get('[data-test="hiw-0-m-0"]').should('exist');
    cy.get('[data-test="hiw-1-m-0"]').should('exist');
    cy.get('[data-test="hiw-current-party"]').should('exist');
  });

  it('should cluster multiple party markers', () => {
    const location0 = locations[0];
    const location1 = locations[1];
    const location2 = locations[2];
    const location3 = locations[3];

    const user0 = users[0];
    const user1 = users[1];
    const user2 = users[2];
    const user3 = users[3];

    const party0 = parties[0];
    const party1 = parties[1];
    const party2 = parties[2];
    const party3 = parties[3];

    cy.mockGeolocation(location0);
    cy.login(user0.username, user0.password);
    cy.createParty(party0);
    cy.logout();
    cy.mockGeolocation(location1);
    cy.login(user1.username, user1.password);
    cy.createParty(party1);
    cy.logout();
    cy.mockGeolocation(location2);
    cy.login(user2.username, user2.password);
    cy.createParty(party2);
    cy.logout();
    cy.mockGeolocation(location3);
    cy.login(user3.username, user3.password);
    cy.createParty(party3);
    cy.visit('/home');
    cy.get('[data-test="hiw-0-m-0"]').should('not.exist');
    cy.get('[data-test="hiw-current-party"]').should('exist');
    cy.get('[data-test="hiw-0-m-0"]').should('not.exist');
    cy.get('[data-test="hiw-cluster-0"]').should('exist');
    cy.log('zoom in should show all markers in cluster');
    cy.zoomIn(5);
    cy.get('[data-test="hiw-cluster-0"]').should('not.exist');
  });

  it('should not be able to join party if party is full', () => {
    const location0 = locations[0];
    const location1 = locations[1];
    const user0 = users[0];
    const user1 = users[1];
    const user2 = users[2];
    const user3 = users[3];
    const party0 = parties[0];

    cy.mockGeolocation(location0);
    cy.login(user0.username, user0.password);
    cy.createParty(party0);
    cy.logout();
    cy.mockGeolocation(location1);
    cy.login(user2.username, user2.password);
    cy.joinParty('0', '0');
    cy.logout();
    cy.login(user3.username, user3.password);
    cy.joinParty('0', '0');
    cy.logout();
    cy.login(user1.username, user1.password);
    cy.get('[data-test="hiw-0-m-0"]').click({ force: true });
    cy.get('[data-test="join-btn"]').should('not.exist');
    cy.logout();
  });

  it('should be able to chat with party member', () => {
    const location0 = locations[0];
    const location1 = locations[1];
    const user0 = users[0];
    const user1 = users[1];
    const party0 = parties[0];

    cy.mockGeolocation(location0);
    cy.login(user0.username, user0.password);
    cy.createParty(party0);
    cy.log('enter chat screen');
    cy.get('[data-test="chat-party-btn"]').click();
    cy.get('[data-test="chat-title"]').should('have.text', party0.partyName);

    cy.log('try without typing anything');
    cy.get('[data-test="chat-send-icon"]').click();
    cy.get('[data-test="user-bubble-text"]').should('not.exist');

    cy.log('try sending message');
    cy.get('[data-test="chat-input"]').type('hello world');
    cy.get('[data-test="chat-send-icon"]').click();
    cy.get('[data-test="user-bubble-text"]').should('have.text', 'hello world');

    cy.log('second user joins party');
    cy.mockGeolocation(location1);
    cy.login(user1.username, user1.password);
    cy.joinParty('0', '0');
    cy.get('[data-test="more-info-btn"]').click();

    cy.log('enter chat screen');
    cy.get('[data-test="chat-party-btn"]').click();
    cy.get('[data-test="chat-input"]').type('hello world to you too');
    cy.get('[data-test="chat-send-icon"]').click();

    cy.log('try sending message for second user');
    cy.get(':nth-child(3) > :nth-child(2) > :nth-child(1) > .text-xs').should(
      'have.text',
      `${joinName(user0)}`,
    );
    cy.get(':nth-child(2) > [data-test="user-bubble-text"]').should(
      'have.text',
      'hello world',
    );
    cy.get(':nth-child(4) > .flex > [data-test="system-bubble"]').should(
      'have.text',
      `${joinName(user1)} has joined the chat.`,
    );
    cy.get(':nth-child(1) > .flex > [data-test="user-bubble-text"]').should(
      'have.text',
      'hello world to you too',
    );
  });

  it('should be able to kick party member', () => {
    const location0 = locations[0];
    const location1 = locations[1];
    const user0 = users[0];
    const user1 = users[1];
    const user2 = users[2];
    const party0 = parties[0];

    cy.mockGeolocation(location0);
    cy.login(user0.username, user0.password);
    cy.createParty(party0);
    cy.mockGeolocation(location1);
    cy.login(user1.username, user1.password);
    cy.joinParty('0', '0');
    cy.logout();
    cy.login(user2.username, user2.password);
    cy.joinParty('0', '0');
    cy.logout();
    cy.login(user0.username, user0.password);
    cy.get('[data-test="current-party-btn"]').click();
    cy.get('[data-test="more-info-btn"]').click();
    cy.log('kick user1');
    cy.get('[data-test="remove-member1"]').click();
    cy.get('[data-test="member-name2"]').should('not.exist');
    cy.logout();
    cy.login(user1.username, user1.password);
    cy.log('user1 should be kicked out');
    cy.get('[data-test="current-party-btn"]').click();
    cy.get('[data-test="more-info-btn"]').should('not.exist');
    cy.on('window:alert', str => {
      expect(str, 'user1 should be kicked out').to.equal(
        'You are not in a party.',
      );
    });
    cy.login(user2.username, user2.password);
    cy.log('user2 should still be in party');
    cy.get('[data-test="current-party-btn"]').click();
    cy.get('[data-test="more-info-btn"]').click();
    cy.get('[data-test="member-name1"]').should('exist');
  });

  it('should not be able to join party after party start', () => {
    const location0 = locations[0];
    const location1 = locations[1];
    const user0 = users[0];
    const user1 = users[1];
    const user2 = users[2];
    const party0 = parties[0];

    cy.mockGeolocation(location0);
    cy.login(user0.username, user0.password);
    cy.createParty(party0);
    cy.mockGeolocation(location1);
    cy.login(user1.username, user1.password);
    cy.joinParty('0', '0');
    cy.logout();
    cy.login(user0.username, user0.password);
    cy.get('[data-test="current-party-btn"]').click();
    cy.get('[data-test="more-info-btn"]').click();
    cy.get('[data-test="start-party-btn"]').click();
    cy.logout();
    cy.login(user2.username, user2.password);
    cy.get('[data-test="hiw-0-m-0"]').should('not.exist');
    cy.get('[data-test="join-btn"]').should('not.exist');
  });

  it('party should not exist if cancelled', () => {
    const location0 = locations[0];
    const location1 = locations[1];
    const user0 = users[0];
    const user1 = users[1];
    const user2 = users[2];
    const party0 = parties[0];

    cy.mockGeolocation(location0);
    cy.login(user0.username, user0.password);
    cy.createParty(party0);
    cy.logout();
    cy.mockGeolocation(location1);
    cy.login(user1.username, user1.password);
    cy.joinParty('0', '0');
    cy.logout();
    cy.login(user0.username, user0.password);
    cy.get('[data-test="current-party-btn"]').click();
    cy.get('[data-test="more-info-btn"]').click();
    cy.get('[data-test="cancel-party-btn"]').click();
    cy.logout();
    cy.login(user2.username, user2.password);
    cy.get('[data-test="hiw-0-m-0"]').should('not.exist');
    cy.get('[data-test="join-btn"]').should('not.exist');
  });

  it('party should not exist if party is over', () => {
    const location0 = locations[0];
    const location1 = locations[1];
    const user0 = users[0];
    const user1 = users[1];
    const user2 = users[2];
    const party0 = parties[0];

    cy.mockGeolocation(location0);
    cy.login(user0.username, user0.password);
    cy.createParty(party0);
    cy.mockGeolocation(location1);
    cy.login(user1.username, user1.password);
    cy.joinParty('0', '0');
    cy.logout();
    cy.login(user0.username, user0.password);
    cy.get('[data-test="current-party-btn"]').click();
    cy.get('[data-test="more-info-btn"]').click();
    cy.get('[data-test="start-party-btn"]').click();
    cy.get('[data-test="cancel-party-btn"]').click();
    cy.logout();
    cy.login(user2.username, user2.password);
    cy.get('[data-test="hiw-0-m-0"]').should('not.exist');
    cy.get('[data-test="join-btn"]').should('not.exist');
  });

  it('should be able to create party after one party close', () => {
    const location0 = locations[0];
    const location1 = locations[1];
    const user0 = users[0];
    const user1 = users[1];
    const party0 = parties[0];
    const party1 = parties[1];

    cy.mockGeolocation(location0);
    cy.login(user0.username, user0.password);
    cy.createParty(party0);
    cy.get('[data-test="cancel-party-btn"]').click();
    cy.mockGeolocation(location1);
    cy.login(user1.username, user1.password);
    cy.createParty(party1);
    cy.visit('/home');
    cy.get('[aria-label="Zoom in"]').click();
    cy.get('[data-test="hiw-0-m-0"]').should('not.exist');
    cy.get('[data-test="hiw-current-party"]').should('exist');
  });

  it('should not be able to see party outside of set radius', () => {
    const location0 = locations2km[0];
    const location1 = locations2km[1];
    const location2 = locations2km[2];
    const user0 = users[0];
    const user1 = users[1];
    const user2 = users[2];
    const party0 = parties[0];
    const party1 = parties[1];

    cy.mockGeolocation(location0);
    cy.login(user0.username, user0.password);
    cy.createParty(party0);
    cy.mockGeolocation(location1);
    cy.login(user1.username, user1.password);
    cy.createParty(party1);
    cy.mockGeolocation(location2);
    cy.login(user2.username, user2.password);
    cy.log('should see closest party in at least km radius');
    cy.get('[data-test="hiw-0-m-0"]').should('exist');
    cy.log('should not see the furthest party');
    cy.get('[data-test="hiw-1-m-0"]').should('not.exist');
    cy.log('change radius to 1km to stop seeing party');
    cy.get('[data-test="distance-dropdown"]').select('1');
    cy.get('[data-test="hiw-0-m-0"]').should('not.exist');
  });

  it('should be able to matchmaking with budget set as Any and 4 km radius', () => {
    const location0 = locations2km[0];
    const location1 = locations2km[1];
    const location2 = locations2km[2];
    const user0 = users[0];
    const user1 = users[1];
    const user2 = users[2];
    const party0 = parties[0];
    const party1 = parties[1];

    cy.mockGeolocation(location0);
    cy.login(user0.username, user0.password);
    cy.createParty(party0);
    cy.mockGeolocation(location1);
    cy.login(user1.username, user1.password);
    cy.createParty(party1);
    cy.mockGeolocation(location2);
    cy.login(user2.username, user2.password);
    cy.get('[data-test="match-making"]').click({ force: true });
    cy.get('[data-test="distance"]').select('4');
    cy.get('[data-test="budget"]').select('');
    cy.get('[data-test="confirm-btn"]').click();
    cy.wait(5500).url().should('include', '/currentparty');
  });

  it('should be able to filter matchmaking with a set budget low and distance at 4km', () => {
    const location0 = locations2km[0];
    const location1 = locations2km[1];
    const location2 = locations2km[2];
    const user0 = users[0];
    const user1 = users[1];
    const user2 = users[2];
    const party0 = parties[0];
    const party1 = parties[1];

    cy.mockGeolocation(location0);
    cy.login(user0.username, user0.password);
    cy.createParty(party0);
    cy.mockGeolocation(location1);
    cy.login(user1.username, user1.password);
    cy.createParty(party1);
    cy.mockGeolocation(location2);
    cy.login(user2.username, user2.password);
    cy.get('[data-test="match-making"]').click({ force: true });
    cy.get('[data-test="distance"]').select('4');
    cy.get('[data-test="budget"]').select('low');
    cy.get('[data-test="confirm-btn"]').click();
    cy.wait(5500).url().should('include', '/currentparty');
  });

  it('should be able to filter matchmaking with a set budget high and distance at 4km', () => {
    const location0 = locations2km[0];
    const location1 = locations2km[1];
    const location2 = locations2km[2];
    const user0 = users[0];
    const user1 = users[1];
    const user2 = users[2];
    const party0 = parties[0];
    const party1 = parties[1];

    cy.mockGeolocation(location0);
    cy.login(user0.username, user0.password);
    cy.createParty(party0);
    cy.mockGeolocation(location1);
    cy.login(user1.username, user1.password);
    cy.createParty(party1);
    cy.mockGeolocation(location2);
    cy.login(user2.username, user2.password);
    cy.get('[data-test="match-making"]').click({ force: true });
    cy.get('[data-test="distance"]').select('4');
    cy.get('[data-test="budget"]').select('high');
    cy.get('[data-test="confirm-btn"]').click();
    cy.wait(5500).url().should('include', '/matchmaking');
    cy.get('[data-test="cancel-btn"]').should('exist');
  });

  it('should be able to filter matchmaking with a set budget any and distance at 1km', () => {
    const location0 = locations2km[0];
    const location1 = locations2km[1];
    const location2 = locations2km[2];
    const user0 = users[0];
    const user1 = users[1];
    const user2 = users[2];
    const party0 = parties[0];
    const party1 = parties[1];

    cy.mockGeolocation(location0);
    cy.login(user0.username, user0.password);
    cy.createParty(party0);
    cy.mockGeolocation(location1);
    cy.login(user1.username, user1.password);
    cy.createParty(party1);
    cy.mockGeolocation(location2);
    cy.login(user2.username, user2.password);
    cy.get('[data-test="match-making"]').click({ force: true });
    cy.get('[data-test="distance"]').select('1');
    cy.get('[data-test="budget"]').select('');
    cy.get('[data-test="confirm-btn"]').click();
    cy.wait(5500).url().should('include', '/matchmaking');
    cy.get('[data-test="cancel-btn"]').should('exist');
  });
});
