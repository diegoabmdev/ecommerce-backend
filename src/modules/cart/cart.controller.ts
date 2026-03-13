import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  ParseUUIDPipe,
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
import { MessageDataDto } from 'src/common/responses/image-responses.dto';
import { CartItem } from './entities/cart.entity';

@ApiTags('Cart')
@ApiServerErrors()
@Auth()
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  @ApiOperation({ summary: 'Añadir producto al carrito' })
  @ApiValidationResponse()
  @ApiBaseResponse(CartItem, 'Carrito actualizado')
  addToCart(@Body() addToCartDto: AddToCartDto, @GetUser() user: User) {
    return this.cartService.addToCart(addToCartDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener el carrito del usuario autenticado' })
  @ApiBaseResponse(CartItem, 'Contenido del carrito')
  getCart(@GetUser() user: User) {
    return this.cartService.getCart(user);
  }

  @Delete(':productId')
  @ApiOperation({ summary: 'Eliminar un producto del carrito' })
  @ApiBaseResponse(MessageDataDto, 'Producto removido del carrito')
  @ApiIdResponse()
  removeProduct(
    @Param('productId', ParseUUIDPipe) productId: string,
    @GetUser() user: User,
  ) {
    return this.cartService.removeProductFromCart(productId, user);
  }
}
