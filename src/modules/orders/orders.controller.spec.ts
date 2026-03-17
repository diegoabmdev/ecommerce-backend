/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { PassportModule } from '@nestjs/passport';

import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { User } from '../users/entities/user.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order.dto';
import { Order, OrderStatus } from './entities/order.entity';

describe('OrdersController', () => {
  let controller: OrdersController;
  let ordersService: jest.Mocked<OrdersService>;

  const mockUser = { id: 'user-123', email: 'diego@test.com' } as User;

  const mockOrderResponse = {
    message: 'Orden creada exitosamente',
    orderId: 'order-uuid',
    checkoutUrl: 'https://mercadopago.com/pay',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
      controllers: [OrdersController],
      providers: [
        {
          provide: OrdersService,
          useValue: {
            create: jest.fn(),
            findAllByUser: jest.fn(),
            updateStatus: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
    ordersService = module.get(OrdersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('debería llamar a ordersService.create y retornar el link de pago', async () => {
      const createOrderDto: CreateOrderDto = { addressId: 'addr-123' };

      ordersService.create.mockResolvedValue(mockOrderResponse as never);

      const result = await controller.create(mockUser, createOrderDto);

      expect(ordersService.create).toHaveBeenCalledWith(
        mockUser,
        createOrderDto,
      );
      expect(result).toEqual(mockOrderResponse);
    });
  });

  describe('findAll', () => {
    it('debería retornar el historial de órdenes del usuario', async () => {
      const mockOrders = [
        { id: 'order-1', total: 1000, status: OrderStatus.PAID },
        { id: 'order-2', total: 500, status: OrderStatus.PENDING },
      ] as Order[];

      ordersService.findAllByUser.mockResolvedValue(mockOrders);

      const result = await controller.findAll(mockUser);

      expect(ordersService.findAllByUser).toHaveBeenCalledWith(mockUser);
      expect(result).toHaveLength(2);
      expect(result).toEqual(mockOrders);
    });
  });

  describe('updateStatus', () => {
    it('debería llamar a ordersService.updateStatus con el nuevo estado', async () => {
      const orderId = 'order-123';
      const updateDto: UpdateOrderStatusDto = { status: OrderStatus.SHIPPED };
      const mockUpdateRes = {
        message: 'Estado actualizado correctamente',
        orderId,
        newStatus: OrderStatus.SHIPPED,
      };

      ordersService.updateStatus.mockResolvedValue(mockUpdateRes as never);

      const result = await controller.updateStatus(orderId, updateDto);

      expect(ordersService.updateStatus).toHaveBeenCalledWith(
        orderId,
        updateDto,
      );
      expect(result).toEqual(mockUpdateRes);
    });
  });
});
