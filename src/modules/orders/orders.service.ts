import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { DataSource, QueryRunner } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { CartService } from '../cart/cart.service';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Product } from '../products/entities/product.entity';
import { PaymentsService } from '../payments/payments.service';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger('OrdersService');

  constructor(
    private readonly dataSource: DataSource,
    private readonly cartService: CartService,
    private readonly paymentsService: PaymentsService,
  ) {}

  async create(user: User) {
    const cart = await this.cartService.getCart(user);

    if (cart.items.length === 0)
      throw new BadRequestException('El carrito está vacío');

    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const order = queryRunner.manager.create(Order, {
        total: cart.summary.total,
        tax: cart.summary.tax,
        user: user,
        status: OrderStatus.PENDING,
      });

      const savedOrder = await queryRunner.manager.save(order);

      for (const item of cart.items) {
        const product = await queryRunner.manager.findOneBy(Product, {
          id: item.productId,
        });

        if (!product || product.stock < item.quantity) {
          throw new Error(`Stock insuficiente para el producto: ${item.title}`);
        }

        product.stock -= item.quantity;
        await queryRunner.manager.save(product);

        const orderItem = queryRunner.manager.create(OrderItem, {
          order: savedOrder,
          product: product,
          quantity: item.quantity,
          priceAtPurchase: item.price,
        });

        await queryRunner.manager.save(orderItem);
      }

      await this.cartService.clearCart(user.id);
      const paymentPreference = await this.paymentsService.createPreference(
        savedOrder.id,
        cart.items,
      );

      await queryRunner.commitTransaction();

      return {
        message: 'Orden creada. Redirigiendo a pago...',
        orderId: savedOrder.id,
        checkoutUrl: paymentPreference.init_point,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();

      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error(errorMessage);

      throw new BadRequestException(errorMessage);
    } finally {
      await queryRunner.release();
    }
  }

  async findAllByUser(user: User): Promise<Order[]> {
    return await this.dataSource.manager.find(Order, {
      where: { user: { id: user.id } },
      order: { createdAt: 'DESC' },
      relations: ['items', 'items.product'],
    });
  }
}
