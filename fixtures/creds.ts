import { User } from '../interfaces/interfaces';

const requireEnv = (name: string) => {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set: copy .env.example to .env and fill it in`);
  return value;
};

export default {
  credentials: {
    user: {
      username: requireEnv('WIKI_USERNAME'),
      password: requireEnv('WIKI_PASSWORD'),
    },
  },

  getCredentials(userName: 'user'): User {
    return this.credentials[userName];
  },
};
