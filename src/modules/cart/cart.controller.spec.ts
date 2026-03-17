/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { User } from '../users/entities/user.entity';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartQuantityDto } from './dto/update-quantity.dto';

describe('CartController', () => {
  let controller: CartController;
  let service: jest.Mocked<CartService>;

  const mockUser = { id: 'user-uuid', email: 'diego@test.com' } as User;
  const mockProductId = '436cd5b2-c14e-495f-9e7a-6defb882a1de';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CartController],
      providers: [
        {
          provide: CartService,
          useValue: {
            addToCart: jest.fn(),
            getCart: jest.fn(),
            updateQuantity: jest.fn(),
            changeQuantityStep: jest.fn(),
            removeProductFromCart: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CartController>(CartController);
    service = module.get(CartService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('addToCart', () => {
    it('debería llamar a cartService.addToCart con los datos correctos', async () => {
      const dto: AddToCartDto = { productId: mockProductId, quantity: 2 };
      service.addToCart.mockResolvedValue({} as any);

      await controller.addToCart(dto, mockUser);

      expect(service.addToCart).toHaveBeenCalledWith(dto, mockUser);
    });
  });

  describe('getCart', () => {
    it('debería llamar a cartService.getCart del usuario', async () => {
      service.getCart.mockResolvedValue({ items: [], summary: {} } as any);

      await controller.getCart(mockUser);

      expect(service.getCart).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('updateQuantity', () => {
    it('debería llamar a updateQuantity con el ID y la nueva cantidad', async () => {
      const dto: UpdateCartQuantityDto = { quantity: 5 };
      service.updateQuantity.mockResolvedValue({} as any);

      await controller.updateQuantity(mockProductId, dto, mockUser);

      expect(service.updateQuantity).toHaveBeenCalledWith(
        mockProductId,
        5,
        mockUser,
      );
    });
  });

  describe('increment / decrement', () => {
    it('increment() debería llamar a changeQuantityStep con +1', async () => {
      await controller.increment(mockProductId, mockUser);
      expect(service.changeQuantityStep).toHaveBeenCalledWith(
        mockProductId,
        1,
        mockUser,
      );
    });

    it('decrement() debería llamar a changeQuantityStep con -1', async () => {
      await controller.decrement(mockProductId, mockUser);
      expect(service.changeQuantityStep).toHaveBeenCalledWith(
        mockProductId,
        -1,
        mockUser,
      );
    });
  });

  describe('removeProduct', () => {
    it('debería llamar a removeProductFromCart', async () => {
      service.removeProductFromCart.mockResolvedValue(undefined);

      await controller.removeProduct(mockProductId, mockUser);

      expect(service.removeProductFromCart).toHaveBeenCalledWith(
        mockProductId,
        mockUser,
      );
    });
  });
});
