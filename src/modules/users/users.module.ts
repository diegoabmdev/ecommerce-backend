import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { Address } from './entities/address.entity';
import { AuthModule } from '../auth/auth.module';
import { AddressesController } from './addresses.controller';
import { MailModule } from '../mail/mail.module';
import { CartModule } from '../cart/cart.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Address]),
    MailModule,
    forwardRef(() => AuthModule),
    CartModule,
  ],
  controllers: [UsersController, AddressesController],
  providers: [UsersService],
  exports: [TypeOrmModule, UsersService],
})
export class UsersModule {}
