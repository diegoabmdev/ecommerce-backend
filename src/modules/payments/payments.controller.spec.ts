/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { MercadoPagoWebhookDto } from 'src/common/responses/payment-responses.dto';

describe('PaymentsController', () => {
  let controller: PaymentsController;
  let paymentsService: jest.Mocked<PaymentsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [
        {
          provide: PaymentsService,
          useValue: {
            processWebhook: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<PaymentsController>(PaymentsController);
    paymentsService = module.get(PaymentsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('handleWebhook', () => {
    const mockWebhookBody: MercadoPagoWebhookDto = {
      type: 'payment',
      data: { id: '123456789' },
    };

    it('debería llamar a paymentsService.processWebhook con los parámetros correctos', async () => {
      const topic = 'payment';
      const expectedResponse = { success: true };

      paymentsService.processWebhook.mockResolvedValue(expectedResponse);

      const result = await controller.handleWebhook(topic, mockWebhookBody);

      expect(paymentsService.processWebhook).toHaveBeenCalledWith(
        topic,
        mockWebhookBody,
      );
      expect(result).toEqual(expectedResponse);
    });

    it('debería funcionar correctamente cuando el topic es undefined', async () => {
      const expectedResponse = { received: true };

      paymentsService.processWebhook.mockResolvedValue(expectedResponse);

      const result = await controller.handleWebhook(undefined, mockWebhookBody);

      expect(paymentsService.processWebhook).toHaveBeenCalledWith(
        undefined,
        mockWebhookBody,
      );
      expect(result).toEqual(expectedResponse);
    });
  });
});
