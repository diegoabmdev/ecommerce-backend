import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  ParseUUIDPipe,
  Param,
  Delete,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('cart')
@UseGuards(AuthGuard())
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  addToCart(@Body() addToCartDto: AddToCartDto, @GetUser() user: User) {
    return this.cartService.addToCart(addToCartDto, user);
  }

  @Get()
  getCart(@GetUser() user: User) {
    return this.cartService.getCart(user);
  }

  @Delete(':productId')
  removeProduct(
    @Param('productId', ParseUUIDPipe) productId: string,
    @GetUser() user: User,
  ) {
    return this.cartService.removeProductFromCart(productId, user);
  }
}
