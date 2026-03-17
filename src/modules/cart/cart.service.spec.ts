/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartItem } from './entities/cart.entity';
import { ProductsService } from '../products/products.service';
import { User } from '../users/entities/user.entity';
import { Product } from '../products/entities/product.entity';

describe('CartService', () => {
  let service: CartService;
  let cartRepository: jest.Mocked<Repository<CartItem>>;
  let productsService: jest.Mocked<ProductsService>;

  const mockUser = { id: 'user-uuid' } as User;
  const mockProduct = {
    id: 'prod-uuid',
    price: 1000,
    stock: 5,
    title: 'Producto Test',
  } as Product;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        {
          provide: getRepositoryToken(CartItem),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            findOneBy: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            remove: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: ProductsService,
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
    cartRepository = module.get(getRepositoryToken(CartItem));
    productsService = module.get(ProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addToCart', () => {
    it('debería añadir un nuevo producto al carrito exitosamente', async () => {
      productsService.findOne.mockResolvedValue(mockProduct);
      cartRepository.findOne.mockResolvedValue(null);
      cartRepository.create.mockReturnValue({
        product: mockProduct,
        user: mockUser,
        quantity: 2,
      } as CartItem);
      cartRepository.save.mockResolvedValue({
        id: 'item-1',
        quantity: 2,
      } as CartItem);

      const result = await service.addToCart(
        { productId: 'prod-uuid', quantity: 2 },
        mockUser,
      );

      expect(result).toBeDefined();
      expect(cartRepository.create).toHaveBeenCalled();
      expect(cartRepository.save).toHaveBeenCalled();
    });

    it('debería lanzar BadRequestException si no hay stock suficiente', async () => {
      productsService.findOne.mockResolvedValue(mockProduct); // stock: 5

      await expect(
        service.addToCart({ productId: 'prod-uuid', quantity: 10 }, mockUser),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getCart', () => {
    it('debería retornar el carrito con los cálculos de totales correctos', async () => {
      const mockCartItems = [
        { product: { ...mockProduct, price: 100 }, quantity: 2 },
      ] as CartItem[];

      cartRepository.find.mockResolvedValue(mockCartItems);

      const result = await service.getCart(mockUser);

      // Subtotal: 100 * 2 = 200
      // Tax (19%): 38
      // Total: 238
      expect(result.summary.subtotal).toBe(200);
      expect(result.summary.tax).toBe(38);
      expect(result.summary.total).toBe(238);
      expect(result.items).toHaveLength(1);
    });
  });

  describe('updateQuantity', () => {
    it('debería actualizar la cantidad si hay stock disponible', async () => {
      const existingItem = { product: mockProduct, quantity: 1 } as CartItem;
      cartRepository.findOne.mockResolvedValue(existingItem);
      cartRepository.save.mockResolvedValue({
        ...existingItem,
        quantity: 3,
      } as CartItem);

      const result = await service.updateQuantity('prod-uuid', 3, mockUser);

      expect(result.quantity).toBe(3);
      expect(cartRepository.save).toHaveBeenCalled();
    });

    it('debería eliminar el producto si la cantidad es 0', async () => {
      const removeSpy = jest
        .spyOn(service, 'removeProductFromCart')
        .mockResolvedValue(undefined);

      await expect(
        service.updateQuantity('prod-uuid', 0, mockUser),
      ).rejects.toThrow(BadRequestException);
      expect(removeSpy).toHaveBeenCalled();
    });
  });

  describe('changeQuantityStep', () => {
    it('debería incrementar la cantidad en +1', async () => {
      const existingItem = { product: mockProduct, quantity: 1 } as CartItem;
      cartRepository.findOne.mockResolvedValue(existingItem);

      await service.changeQuantityStep('prod-uuid', 1, mockUser);

      expect(existingItem.quantity).toBe(2);
      expect(cartRepository.save).toHaveBeenCalled();
    });

    it('debería retornar un mensaje si al decrementar la cantidad llega a 0', async () => {
      const existingItem = { product: mockProduct, quantity: 1 } as CartItem;
      cartRepository.findOne.mockResolvedValue(existingItem);

      const result = await service.changeQuantityStep(
        'prod-uuid',
        -1,
        mockUser,
      );

      expect(result).toEqual({ message: 'Producto eliminado del carrito' });
      expect(cartRepository.remove).toHaveBeenCalled();
    });
  });
});
