import {
  randUserName,
  randFirstName,
  randLastName,
  randPassword,
} from '@ngneat/falso';
import * as fs from 'fs';

export const generateUser = (passwordLength = 8) => ({
  username: randUserName(),
  firstName: randFirstName(),
  lastName: randLastName(),
  password: randPassword({ size: passwordLength }),
});

export const generateSeedUser = (numberOfUsers = 12, passwordLength = 8) => {
  let users = [];
  for (let i = 0; i < numberOfUsers; i++) {
    users.push(generateUser(passwordLength));
  }
  return users;
};

// generateSeedUser(12, 8);

export const saveSeedUser = (numberOfUsers = 12, passwordLength = 8) => {
  let users = generateSeedUser(numberOfUsers, passwordLength);
  fs.writeFileSync(
    'cypress/fixtures/users.json',
    JSON.stringify(users, null, 2),
  );
  return users;
};

export const joinName = (user: { firstName: string; lastName: string }) => {
  return user.firstName + ' ' + user.lastName;
};
