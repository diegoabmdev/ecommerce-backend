import {
  Controller,
  Post,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';

interface MPWebhookBody {
  type?: string;
  data?: { id: string };
  resource?: string;
}

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Query('topic') topic: string | undefined,
    @Body() body: MPWebhookBody,
  ) {
    if (topic === 'payment' || body.type === 'payment') {
      const paymentId = body.data?.id || body.resource?.split('/').pop();

      if (paymentId) {
        return await this.paymentsService.verifyPayment(paymentId);
      }
    }
    return { received: true };
  }
}
