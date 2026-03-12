import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(AuthGuard())
  create(@Body() createReviewDto: CreateReviewDto, @GetUser() user: User) {
    return this.reviewsService.create(createReviewDto, user);
  }

  @Get('product/:productId')
  findByProduct(@Param('productId', ParseUUIDPipe) productId: string) {
    return this.reviewsService.findByProduct(productId);
  }

  @Delete(':id')
  @UseGuards(AuthGuard())
  remove(@Param('id', ParseUUIDPipe) id: string, @GetUser() user: User) {
    return this.reviewsService.remove(id, user);
  }
}
