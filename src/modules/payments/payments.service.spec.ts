/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';

import { PaymentsService } from './payments.service';
import { Order, OrderStatus } from '../orders/entities/order.entity';

const mockCreatePreference = jest.fn();
const mockGetPayment = jest.fn();

jest.mock('mercadopago', () => ({
  MercadoPagoConfig: jest.fn(),
  Preference: jest.fn().mockImplementation(() => ({
    create: mockCreatePreference,
  })),
  Payment: jest.fn().mockImplementation(() => ({
    get: mockGetPayment,
  })),
}));

describe('PaymentsService', () => {
  let service: PaymentsService;
  let orderRepository: jest.Mocked<Repository<Order>>;

  const mockOrder = {
    id: 'order-123',
    total: 1000,
    status: OrderStatus.PENDING,
    user: { email: 'diego@test.com', id: 'user-1' },
    items: [],
  } as unknown as Order;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn().mockReturnValue('mock-token'),
            get: jest.fn((key: string) => {
              const config: Record<string, string> = {
                BASE_URL_WEBHOOK: 'https://diegoabmdev-ecommerce.onrender.com',
                FRONTEND_URL:
                  'https://diegoabmdev-ecommerce-frontend.vercel.app',
                N8N_WEBHOOK_URL: 'https://n8n.test.com',
              };
              return config[key];
            }),
          },
        },
        {
          provide: getRepositoryToken(Order),
          useValue: {
            findOne: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    orderRepository = module.get(getRepositoryToken(Order));

    jest.clearAllMocks();
  });

  describe('createPreference', () => {
    it('debería crear una preferencia exitosamente', async () => {
      const mockItems = [
        { productId: 'p1', title: 'P1', quantity: 1, price: 100 },
      ];
      const mockResponse = { id: 'pref-123', init_point: 'https://mp.com/pay' };

      mockCreatePreference.mockResolvedValue(mockResponse);

      const result = await service.createPreference('order-123', mockItems);

      expect(result).toEqual(mockResponse);
      expect(mockCreatePreference).toHaveBeenCalled();
    });
  });

  describe('verifyPayment', () => {
    it('debería actualizar la orden si el pago es aprobado', async () => {
      const paymentId = 'pay-123';
      const paymentData = {
        status: 'approved',
        external_reference: 'order-123',
      };

      mockGetPayment.mockResolvedValue(paymentData);

      orderRepository.findOne.mockResolvedValue(mockOrder);
      orderRepository.update.mockResolvedValue({} as UpdateResult);
      global.fetch = jest.fn().mockResolvedValue({ ok: true });

      const result = await service.verifyPayment(paymentId);

      expect(result.success).toBe(true);
      expect(orderRepository.update).toHaveBeenCalledWith('order-123', {
        status: OrderStatus.PAID,
      });
    });
  });
});
