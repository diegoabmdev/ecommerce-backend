import { InjectRepository } from '@nestjs/typeorm';
import { Wishlist } from './entities/wishlist.entity';
import { ProductsService } from '../products/products.service';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

@Injectable()
export class WishlistService {
  constructor(
    @InjectRepository(Wishlist)
    private readonly wishlistRepository: Repository<Wishlist>,
    private readonly productsService: ProductsService,
  ) {}

  async toggleWishlist(userId: string, productId: string) {
    await this.productsService.findOne(productId);

    const existing = await this.wishlistRepository.findOne({
      where: { user: { id: userId }, product: { id: productId } },
    });

    if (existing) {
      await this.wishlistRepository.remove(existing);
      return { added: false, message: 'Producto eliminado de favoritos' };
    }

    const newItem = this.wishlistRepository.create({
      user: { id: userId },
      product: { id: productId },
    });

    await this.wishlistRepository.save(newItem);
    return { added: true, message: 'Producto añadido a favoritos' };
  }

  async getUserWishlist(userId: string) {
    const items = await this.wishlistRepository.find({
      where: { user: { id: userId } },
      relations: ['product', 'product.category'],
      order: { createdAt: 'DESC' },
    });

    return items.map((item) => item.product);
  }
}
