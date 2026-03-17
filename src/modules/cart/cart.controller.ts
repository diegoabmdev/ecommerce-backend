import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  ParseUUIDPipe,
  Patch,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';

import { Auth } from '../../common/decorators/auth.decorator';
import { ApiBaseResponse } from '../../common/decorators/api-res-generic.decorator';
import {
  ApiIdResponse,
  ApiValidationResponse,
  ApiServerErrors,
} from '../../common/decorators/swagger-errors.decorator';
import { BaseResponseDto } from '../../common/responses/base-response.dto';
import { UpdateCartQuantityDto } from './dto/update-quantity.dto';
import {
  CartResponseDto,
  CartUpdateDto,
} from '../../common/responses/cart-response.dto';

@ApiTags('Cart')
@ApiServerErrors()
@Auth()
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Añadir producto al carrito' })
  @ApiValidationResponse()
  @ApiBaseResponse(CartResponseDto, 'Carrito actualizado', HttpStatus.OK)
  addToCart(@Body() addToCartDto: AddToCartDto, @GetUser() user: User) {
    return this.cartService.addToCart(addToCartDto, user);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener el carrito del usuario autenticado' })
  @ApiBaseResponse(CartResponseDto, 'Contenido del carrito', HttpStatus.OK)
  getCart(@GetUser() user: User) {
    return this.cartService.getCart(user);
  }

  @Patch(':productId/quantity')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar cantidad de un producto manualmente' })
  @ApiValidationResponse()
  @ApiBaseResponse(
    CartUpdateDto,
    'Actualizar cantidad',
    HttpStatus.OK,
    false,
    false,
  )
  updateQuantity(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() updateCartQuantityDto: UpdateCartQuantityDto,
    @GetUser() user: User,
  ) {
    return this.cartService.updateQuantity(
      productId,
      updateCartQuantityDto.quantity,
      user,
    );
  }

  @Patch(':productId/increment')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Incrementar +1 cantidad' })
  @ApiBaseResponse(
    CartResponseDto,
    'Incrementar Cantidad',
    HttpStatus.OK,
    false,
    false,
  )
  increment(
    @Param('productId', ParseUUIDPipe) productId: string,
    @GetUser() user: User,
  ) {
    return this.cartService.changeQuantityStep(productId, 1, user);
  }

  @Patch(':productId/decrement')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Decrementar -1 cantidad' })
  @ApiBaseResponse(
    CartResponseDto,
    'Decrementar Cantidad',
    HttpStatus.OK,
    false,
    false,
  )
  decrement(
    @Param('productId', ParseUUIDPipe) productId: string,
    @GetUser() user: User,
  ) {
    return this.cartService.changeQuantityStep(productId, -1, user);
  }

  @Delete(':productId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar un producto del carrito' })
  @ApiBaseResponse(
    BaseResponseDto,
    'Producto removido del carrito',
    HttpStatus.OK,
    false,
    false,
  )
  @ApiIdResponse()
  removeProduct(
    @Param('productId', ParseUUIDPipe) productId: string,
    @GetUser() user: User,
  ) {
    return this.cartService.removeProductFromCart(productId, user);
  }
}
