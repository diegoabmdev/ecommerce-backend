import {
  Controller,
  Post,
  Get,
  ParseUUIDPipe,
  Patch,
  Body,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

import { OrdersService } from './orders.service';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';
import { Order } from './entities/order.entity';

import { Auth } from '../../common/decorators/auth.decorator';
import { ApiBaseResponse } from '../../common/decorators/api-res-generic.decorator';
import {
  ApiIdResponse,
  ApiServerErrors,
  ApiValidationResponse,
} from '../../common/decorators/swagger-errors.decorator';

import { OrderCreatedDataDto } from 'src/common/responses/order-responses.dto';
import { MessageDataDto } from 'src/common/responses/image-responses.dto';
import { UpdateOrderStatusDto } from './dto/update-order.dto';
import { ValidRoles } from '../auth/interfaces/valid-roles';

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

  @Patch(':id/status')
  @Auth(ValidRoles.admin)
  @ApiOperation({
    summary: 'Actualizar estado de una orden (Admin)',
    description:
      'Permite cambiar manualmente el estado a PAID, SHIPPED, CANCELLED, etc.',
  })
  @ApiBaseResponse(MessageDataDto, 'Estado actualizado correctamente')
  @ApiIdResponse()
  @ApiValidationResponse()
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(id, updateOrderStatusDto);
  }
}
