import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { CartService } from '../cart/cart.service';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Product } from '../products/entities/product.entity';
import { PaymentsService } from '../payments/payments.service';
import { UpdateOrderStatusDto } from './dto/update-order.dto';

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

    const queryRunner = this.dataSource.createQueryRunner();
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
          throw new BadRequestException(
            `Stock insuficiente para el producto: ${item.title}`,
          );
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
        message: 'Orden creada exitosamente',
        orderId: savedOrder.id,
        checkoutUrl: paymentPreference.init_point,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
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

  async checkUserBoughtProduct(
    userId: string,
    productId: string,
  ): Promise<boolean> {
    const orderItem = await this.dataSource.manager.findOne(OrderItem, {
      where: {
        product: { id: productId },
        order: {
          user: { id: userId },
          status: OrderStatus.PAID,
        },
      },
    });
    return !!orderItem;
  }

  async updateStatus(id: string, updateOrderStatusDto: UpdateOrderStatusDto) {
    const { status } = updateOrderStatusDto;

    const order = await this.dataSource.manager.findOneBy(Order, { id });

    if (!order) {
      throw new BadRequestException(`Orden con ID ${id} no encontrada`);
    }

    order.status = status;
    await this.dataSource.manager.save(order);

    return {
      message: 'Estado de la orden actualizado',
      orderId: id,
      newStatus: status,
    };
  }
}
