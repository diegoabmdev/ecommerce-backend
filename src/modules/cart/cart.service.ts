// cart.service.ts
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from './entities/cart.entity';
import { Product } from '../products/entities/product.entity';
import { User } from '../users/entities/user.entity';
import { AddToCartDto } from './dto/add-to-cart.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItem)
    private readonly cartRepository: Repository<CartItem>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async addToCart(addToCartDto: AddToCartDto, user: User): Promise<CartItem> {
    const { productId, quantity = 1 } = addToCartDto;

    const product = await this.productRepository.findOneBy({ id: productId });
    if (!product) throw new NotFoundException('Producto no encontrado');

    if (product.stock < quantity)
      throw new BadRequestException('Stock insuficiente');

    let cartItem = await this.cartRepository.findOne({
      where: { user: { id: user.id }, product: { id: productId } },
    });

    if (cartItem) {
      if (product.stock < cartItem.quantity + quantity) {
        throw new BadRequestException(
          'No puedes agregar más de este producto (límite de stock)',
        );
      }
      cartItem.quantity += quantity;
    } else {
      cartItem = this.cartRepository.create({ user, product, quantity });
    }

    return await this.cartRepository.save(cartItem);
  }

  async getCart(user: User) {
    const items = await this.cartRepository.find({
      where: { user: { id: user.id } },
      relations: ['product'],
    });

    const subtotal = items.reduce(
      (acc, item) => acc + item.product.price * item.quantity,
      0,
    );
    const tax = subtotal * 0.19;
    const total = subtotal + tax;

    return {
      items: items.map((item) => ({
        productId: item.product.id,
        title: item.product.title,
        price: item.product.price,
        quantity: item.quantity,
        itemTotal: item.product.price * item.quantity,
      })),
      summary: {
        totalItems: items.length,
        subtotal: Number(subtotal.toFixed(2)),
        tax: Number(tax.toFixed(2)),
        total: Number(total.toFixed(2)),
      },
    };
  }

  async removeProductFromCart(productId: string, user: User): Promise<void> {
    const cartItem = await this.cartRepository.findOneBy({
      product: { id: productId },
      user: { id: user.id },
    });

    if (!cartItem)
      throw new NotFoundException(`El producto no está en tu carrito`);

    await this.cartRepository.remove(cartItem);
  }

  async clearCart(userId: string): Promise<void> {
    await this.cartRepository.delete({ user: { id: userId } });
  }
}
