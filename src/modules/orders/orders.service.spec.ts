/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, QueryRunner } from 'typeorm';
import { BadRequestException } from '@nestjs/common';

import { OrdersService } from './orders.service';
import { CartService } from '../cart/cart.service';
import { PaymentsService } from '../payments/payments.service';
import { User } from '../users/entities/user.entity';
import { Order, OrderStatus } from './entities/order.entity';
import { Address } from '../users/entities/address.entity';
import { Product } from '../products/entities/product.entity';

interface CartResponse {
  items: {
    productId: string;
    title: string;
    price: number;
    quantity: number;
    itemTotal: number;
  }[];
  summary: {
    totalItems: number;
    subtotal: number;
    tax: number;
    total: number;
  };
}

interface PreferenceResponse {
  init_point: string;
  id: string;
}

describe('OrdersService', () => {
  let service: OrdersService;
  let cartService: jest.Mocked<CartService>;
  let paymentsService: jest.Mocked<PaymentsService>;
  let queryRunner: jest.Mocked<QueryRunner>;
  let dataSource: jest.Mocked<DataSource>;

  const mockUser = { id: 'user-123', email: 'diego@test.com' } as User;
  const mockAddress = { id: 'addr-123', user: { id: 'user-123' } } as Address;

  beforeEach(async () => {
    queryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        findOne: jest.fn(),
        findOneBy: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
      },
    } as unknown as jest.Mocked<QueryRunner>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: CartService,
          useValue: { getCart: jest.fn(), clearCart: jest.fn() },
        },
        {
          provide: PaymentsService,
          useValue: { createPreference: jest.fn() },
        },
        {
          provide: DataSource,
          useValue: {
            createQueryRunner: jest.fn().mockReturnValue(queryRunner),
          },
        },
        {
          provide: DataSource,
          useValue: {
            createQueryRunner: jest.fn().mockReturnValue(queryRunner),
            manager: { findOneBy: jest.fn(), save: jest.fn() },
          },
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    cartService = module.get(CartService);
    paymentsService = module.get(PaymentsService);
    dataSource = module.get(DataSource);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create Order', () => {
    const createOrderDto = { addressId: 'addr-123' };

    it('debería lanzar error si el carrito está vacío', async () => {
      const emptyCart: CartResponse = {
        items: [],
        summary: { totalItems: 0, subtotal: 0, tax: 0, total: 0 },
      };
      cartService.getCart.mockResolvedValue(emptyCart as never);

      await expect(service.create(mockUser, createOrderDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('debería hacer rollback si el stock es insuficiente', async () => {
      const mockCart: CartResponse = {
        items: [
          {
            productId: 'p1',
            title: 'Producto 1',
            quantity: 10,
            price: 100,
            itemTotal: 1000,
          },
        ],
        summary: { totalItems: 1, subtotal: 1000, tax: 190, total: 1190 },
      };
      cartService.getCart.mockResolvedValue(mockCart as never);

      (queryRunner.manager.findOne as jest.Mock).mockResolvedValue(mockAddress);
      (queryRunner.manager.create as jest.Mock).mockReturnValue({
        id: 'order-1',
      });
      (queryRunner.manager.save as jest.Mock).mockResolvedValue({
        id: 'order-1',
      });

      (queryRunner.manager.findOneBy as jest.Mock).mockResolvedValue({
        id: 'p1',
        stock: 5,
      } as Product);

      await expect(service.create(mockUser, createOrderDto)).rejects.toThrow(
        BadRequestException,
      );

      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    it('debería crear la orden exitosamente y retornar checkoutUrl', async () => {
      const mockCart: CartResponse = {
        items: [
          {
            productId: 'p1',
            title: 'P1',
            quantity: 1,
            price: 100,
            itemTotal: 100,
          },
        ],
        summary: { totalItems: 1, subtotal: 100, tax: 19, total: 119 },
      };
      cartService.getCart.mockResolvedValue(mockCart as never);

      (queryRunner.manager.findOne as jest.Mock).mockResolvedValue(mockAddress);
      (queryRunner.manager.create as jest.Mock).mockReturnValue({
        id: 'order-1',
      });
      (queryRunner.manager.save as jest.Mock).mockResolvedValue({
        id: 'order-1',
      });
      (queryRunner.manager.findOneBy as jest.Mock).mockResolvedValue({
        id: 'p1',
        stock: 10,
      });

      const mockPreference: PreferenceResponse = {
        init_point: 'http://mercadopago.com',
        id: 'pref-123',
      };
      paymentsService.createPreference.mockResolvedValue(
        mockPreference as never,
      );

      const result = await service.create(mockUser, createOrderDto);

      expect(result).toEqual({
        message: 'Orden creada exitosamente',
        orderId: 'order-1',
        checkoutUrl: 'http://mercadopago.com',
      });
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
    });
  });

  describe('updateStatus', () => {
    it('debería actualizar el estado de la orden', async () => {
      const mockOrder = { id: 'order-1', status: OrderStatus.PENDING } as Order;

      jest.spyOn(dataSource.manager, 'findOneBy').mockResolvedValue(mockOrder);
      jest.spyOn(dataSource.manager, 'save').mockResolvedValue(mockOrder);

      const result = await service.updateStatus('order-1', {
        status: OrderStatus.PAID,
      });

      expect(result.newStatus).toBe(OrderStatus.PAID);
    });
  });
});
