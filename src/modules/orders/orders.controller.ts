import { Controller, Post, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

import { OrdersService } from './orders.service';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';
import { Order } from './entities/order.entity';

import { Auth } from '../../common/decorators/auth.decorator';
import { ApiBaseResponse } from '../../common/decorators/api-res-generic.decorator';
import {
  ApiServerErrors,
  ApiValidationResponse,
} from '../../common/decorators/swagger-errors.decorator';

import { OrderCreatedDataDto } from 'src/common/responses/order-responses.dto';

@ApiTags('Orders')
@ApiServerErrors()
@Auth()
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('checkout')
  @ApiOperation({
    summary: 'Crear una orden y generar link de pago',
    description:
      'Valida stock, vacía el carrito y genera una preferencia de pago.',
  })
  @ApiBaseResponse(
    OrderCreatedDataDto,
    'Orden creada. Redirigir al usuario al checkoutUrl',
  )
  @ApiValidationResponse()
  create(@GetUser() user: User) {
    return this.ordersService.create(user);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener historial de órdenes del usuario' })
  @ApiBaseResponse(Order, 'Lista de órdenes obtenida con éxito')
  findAll(@GetUser() user: User) {
    return this.ordersService.findAllByUser(user);
  }
}
