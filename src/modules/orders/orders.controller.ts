import { Controller, Post, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OrdersService } from './orders.service';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('orders')
@UseGuards(AuthGuard())
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('checkout')
  create(@GetUser() user: User) {
    return this.ordersService.create(user);
  }

  @Get()
  findAll(@GetUser() user: User) {
    return this.ordersService.findAllByUser(user);
  }
}
