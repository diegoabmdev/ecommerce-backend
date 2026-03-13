import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
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
import { Review } from './entities/review.entity';

@ApiTags('Reviews')
@ApiServerErrors()
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @Auth()
  @ApiOperation({ summary: 'Crear una reseña de producto' })
  @ApiValidationResponse()
  @ApiBaseResponse(Review, 'Reseña creada')
  create(@Body() createReviewDto: CreateReviewDto, @GetUser() user: User) {
    return this.reviewsService.create(createReviewDto, user);
  }

  @Get('product/:productId')
  @ApiOperation({ summary: 'Obtener reseñas de un producto específico' })
  @ApiBaseResponse(Review, 'Reseñas del producto obtenidas')
  @ApiIdResponse()
  findByProduct(@Param('productId', ParseUUIDPipe) productId: string) {
    return this.reviewsService.findByProduct(productId);
  }

  @Delete(':id')
  @Auth()
  @ApiOperation({ summary: 'Eliminar una reseña propia' })
  @ApiBaseResponse(MessageDataDto, 'Reseña eliminada')
  @ApiIdResponse()
  remove(@Param('id', ParseUUIDPipe) id: string, @GetUser() user: User) {
    return this.reviewsService.remove(id, user);
  }
}
