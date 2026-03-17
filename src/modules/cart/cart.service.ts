import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from './entities/cart.entity';
import { User } from '../users/entities/user.entity';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { ProductsService } from '../products/products.service';

@Injectable()
export class CartService {
  private readonly TAX_RATE = 0.19;

  constructor(
    @InjectRepository(CartItem)
    private readonly cartRepository: Repository<CartItem>,
    private readonly productsService: ProductsService,
  ) {}

  async addToCart(addToCartDto: AddToCartDto, user: User): Promise<CartItem> {
    const { productId, quantity = 1 } = addToCartDto;

    const product = await this.productsService.findOne(productId);

    if (product.stock < quantity)
      throw new BadRequestException('Stock insuficiente en tienda');

    let cartItem = await this.cartRepository.findOne({
      where: { user: { id: user.id }, product: { id: productId } },
    });

    if (cartItem) {
      const newQuantity = cartItem.quantity + quantity;
      if (product.stock < newQuantity) {
        throw new BadRequestException('No puedes exceder el stock disponible');
      }
      cartItem.quantity = newQuantity;
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

    return this.calculateCartTotals(items);
  }

  async updateQuantity(
    productId: string,
    quantity: number,
    user: User,
  ): Promise<CartItem> {
    if (quantity <= 0) {
      await this.removeProductFromCart(productId, user);
      throw new BadRequestException(
        'Cantidad actualizada a 0, producto eliminado',
      );
    }

    const cartItem = await this.cartRepository.findOne({
      where: { user: { id: user.id }, product: { id: productId } },
      relations: ['product'],
    });

    if (!cartItem)
      throw new NotFoundException('Producto no encontrado en el carrito');

    if (cartItem.product.stock < quantity) {
      throw new BadRequestException(
        `Solo quedan ${cartItem.product.stock} unidades disponibles`,
      );
    }

    cartItem.quantity = quantity;
    return await this.cartRepository.save(cartItem);
  }

  async changeQuantityStep(
    productId: string,
    step: 1 | -1,
    user: User,
  ): Promise<CartItem | { message: string }> {
    const cartItem = await this.cartRepository.findOne({
      where: { user: { id: user.id }, product: { id: productId } },
      relations: ['product'],
    });

    if (!cartItem)
      throw new NotFoundException('Producto no encontrado en el carrito');

    const newQuantity = cartItem.quantity + step;

    if (newQuantity <= 0) {
      await this.cartRepository.remove(cartItem);
      return { message: 'Producto eliminado del carrito' };
    }

    if (step > 0 && cartItem.product.stock < newQuantity) {
      throw new BadRequestException('No hay más stock disponible');
    }

    cartItem.quantity = newQuantity;
    return await this.cartRepository.save(cartItem);
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

  private calculateCartTotals(items: CartItem[]) {
    const subtotal = items.reduce(
      (acc, item) => acc + item.product.price * item.quantity,
      0,
    );

    const tax = subtotal * this.TAX_RATE;
    const total = subtotal + tax;

    return {
      items: items.map((item) => ({
        productId: item.product.id,
        title: item.product.title,
        price: item.product.price,
        quantity: item.quantity,
        itemTotal: Number((item.product.price * item.quantity).toFixed(2)),
      })),
      summary: {
        totalItems: items.reduce((acc, item) => acc + item.quantity, 0),
        subtotal: Number(subtotal.toFixed(2)),
        tax: Number(tax.toFixed(2)),
        total: Number(total.toFixed(2)),
      },
    };
  }
}
