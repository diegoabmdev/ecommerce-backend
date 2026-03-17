import {
  Controller,
  Post,
  Get,
  ParseUUIDPipe,
  Patch,
  Body,
  Param,
  HttpStatus,
  HttpCode,
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

import { OrderCreatedDataDto } from '../../common/responses/order-responses.dto';
import { UpdateOrderStatusDto } from './dto/update-order.dto';
import { ValidRoles } from '../auth/interfaces/valid-roles';
import { CreateOrderDto } from './dto/create-order.dto';
import { BaseResponseDto } from '../../common/responses/base-response.dto';

@ApiTags('Orders')
@ApiServerErrors()
@Auth()
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('checkout')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear una orden y generar link de pago',
    description:
      'Valida stock, vacía el carrito y genera una preferencia de pago en la pasarela.',
  })
  @ApiBaseResponse(
    OrderCreatedDataDto,
    'Orden creada exitosamente. Redirigir al usuario al checkoutUrl',
    HttpStatus.CREATED,
  )
  @ApiValidationResponse()
  create(@GetUser() user: User, @Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(user, createOrderDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener historial de órdenes del usuario autenticado',
  })
  @ApiBaseResponse(
    Order,
    'Lista de órdenes obtenida con éxito',
    HttpStatus.OK,
    true,
  )
  findAll(@GetUser() user: User) {
    return this.ordersService.findAllByUser(user);
  }

  @Patch(':id/status')
  @Auth(ValidRoles.admin)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Actualizar estado de una orden (Admin)',
    description: 'Permite cambiar el estado a PAID, SHIPPED, CANCELLED, etc.',
  })
  @ApiBaseResponse(
    BaseResponseDto,
    'Estado actualizado correctamente',
    HttpStatus.OK,
    false,
    false,
  )
  @ApiIdResponse()
  @ApiValidationResponse()
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(id, updateOrderStatusDto);
  }
}
