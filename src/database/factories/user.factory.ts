// src/database/factories/user.factory.ts
import { setSeederFactory } from 'typeorm-extension';
import { User } from '../../modules/users/entities/user.entity';

export default setSeederFactory(User, (faker) => {
  const user = new User();
  user.fullName = faker.person.fullName();
  user.email = faker.internet.email();
  user.password = '123456';
  user.phone = faker.phone.number();
  user.role = 'admin';
  return user;
});
