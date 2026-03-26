import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/common/decorators/auth.decorator';
import { WishlistService } from './wishlist.service';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { ApiBaseResponse } from 'src/common/decorators/api-res-generic.decorator';
import { Wishlist } from './entities/wishlist.entity';
import { ApiValidationResponse } from 'src/common/decorators/swagger-errors.decorator';

@ApiTags('Wishlist')
@Controller('wishlist')
@Auth()
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener mis productos favoritos' })
  @ApiBaseResponse(Wishlist, 'Listado obtenido', HttpStatus.OK, true)
  findAll(@GetUser('id') userId: string) {
    return this.wishlistService.getUserWishlist(userId);
  }

  @Post(':productId')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Alternar (añadir/quitar) producto de favoritos' })
  @ApiBaseResponse(Wishlist, 'Producto añadido a favoritos', HttpStatus.CREATED)
  @ApiValidationResponse()
  toggle(
    @Param('productId', ParseUUIDPipe) productId: string,
    @GetUser('id') userId: string,
  ) {
    return this.wishlistService.toggleWishlist(userId, productId);
  }
}
