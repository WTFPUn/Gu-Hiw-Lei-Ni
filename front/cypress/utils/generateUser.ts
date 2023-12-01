import {
  randUserName,
  randFirstName,
  randLastName,
  randPassword,
} from '@ngneat/falso';

export const generateUser = (passwordLength = 8) => ({
  username: randUserName(),
  firstName: randFirstName(),
  lastName: randLastName(),
  password: randPassword({ size: passwordLength }),
});
