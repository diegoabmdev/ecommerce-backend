// src/database/factories/user.factory.ts
import { setSeederFactory } from 'typeorm-extension';
import { User } from '../../modules/users/entities/user.entity';

export default setSeederFactory(User, (faker) => {
  const user = new User();
  const gender = faker.helpers.arrayElement(['male', 'female']);
  const firstName = faker.person.firstName(gender as any);
  const lastName = faker.person.lastName();

  user.fullName = `${firstName} ${lastName}`;
  user.username = faker.internet
    .username({ firstName, lastName })
    .toLowerCase();
  user.email = faker.internet.email({ firstName, lastName });
  user.password = 'Ab123456!';
  user.phone = faker.phone.number();
  user.role = 'customer';
  user.gender = gender;
  user.birthDate = faker.date.birthdate({ min: 18, max: 65, mode: 'age' });
  user.isActive = true;
  return user;
});
