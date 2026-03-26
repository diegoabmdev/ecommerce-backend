import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from './entities/product.entity';
import { AuthModule } from '../auth/auth.module';
import { FilesModule } from '../files/files.module';
import { CategoriesModule } from '../categories/categories.module';
import { Wishlist } from '../wishlist/entities/wishlist.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Wishlist]),
    AuthModule,
    FilesModule,
    CategoriesModule,
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService, TypeOrmModule],
})
export class ProductsModule {}
