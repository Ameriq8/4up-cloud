import prisma from '../src/utils/prisma';

(async () => {
  await prisma.user.create({
    data: {
      email: 'malpymani132@gmail.com',
      username: 'Ahlinz',
      role: 0, // Member
      verified: true,
      password: '$2a$10$N7zZpoG8SgkHZLJoZA8JPuUWAF30.AKrtKK69vEMT8hMVGIYxj5OC', // @Hz12345
    },
  }).then(u => console.log(u));

  await prisma.user.create({
    data: {
      email: 'support@toxiclibrary.com',
      username: 'admin',
      role: 1, // Admin
      verified: true,
      password: '$2a$10$YBgMQrrsOUxkfP6YQORYhO1JLE0LQ9IAevRBu74zdDqkv9bj/Ccr6', // admin
    },
  }).then(u => console.log(u));

  await prisma.user.findMany({
  }).then(console.log)
})();