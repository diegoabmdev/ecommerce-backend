import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { FilesService } from './files.service';

// Mockeamos la librería de cloudinary completamente
jest.mock('cloudinary', () => ({
  v2: {
    uploader: {
      upload_stream: jest.fn(),
      destroy: jest.fn(),
    },
  },
}));

describe('FilesService', () => {
  let service: FilesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FilesService],
    }).compile();

    service = module.get<FilesService>(FilesService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('uploadImage', () => {
    const mockFile = {
      buffer: Buffer.from('test-image'),
    } as Express.Multer.File;

    const mockUploadResponse = {
      secure_url: 'https://cloudinary.com/image.jpg',
      public_id: 'ecommerce-products/image',
    } as UploadApiResponse;

    it('debería subir una imagen exitosamente', async () => {
      (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation(
        (options, callback: (error: any, result: any) => void) => {
          callback(null, mockUploadResponse);
          return { pipe: jest.fn() };
        },
      );

      const result = await service.uploadImage(mockFile);

      expect(result.secure_url).toBe(mockUploadResponse.secure_url);
      expect(cloudinary.uploader.upload_stream).toHaveBeenCalled();
    });

    it('debería lanzar BadRequestException si no hay buffer', async () => {
      await expect(
        service.uploadImage({} as Express.Multer.File),
      ).rejects.toThrow(BadRequestException);
    });

    it('debería lanzar BadRequestException si Cloudinary devuelve un error', async () => {
      (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation(
        (options, callback: (error: any, result: any) => void) => {
          callback({ message: 'Error de Cloudinary' }, null);
          return { pipe: jest.fn() };
        },
      );

      await expect(service.uploadImage(mockFile)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('deleteImage', () => {
    const validUrl =
      'https://res.cloudinary.com/demo/image/upload/v12345678/ecommerce-products/image.jpg';

    it('debería extraer el publicId correctamente y borrar la imagen', async () => {
      const mockDeleteRes = { result: 'ok' };
      (cloudinary.uploader.destroy as jest.Mock).mockResolvedValue(
        mockDeleteRes,
      );

      const result = await service.deleteImage(validUrl);

      expect(cloudinary.uploader.destroy).toHaveBeenCalledWith(
        'ecommerce-products/image',
      );
      expect(result.result).toBe('ok');
    });

    it('debería retornar "not found" sin lanzar error (caso común en Cloudinary)', async () => {
      const mockDeleteRes = { result: 'not found' };
      (cloudinary.uploader.destroy as jest.Mock).mockResolvedValue(
        mockDeleteRes,
      );

      const result = await service.deleteImage(validUrl);

      expect(result.result).toBe('not found');
    });

    it('debería lanzar BadRequestException si la URL no es válida para la regex', async () => {
      const invalidUrl = 'https://google.com/foto.jpg';

      await expect(service.deleteImage(invalidUrl)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('debería lanzar InternalServerErrorException si el resultado no es ok ni not found', async () => {
      (cloudinary.uploader.destroy as jest.Mock).mockResolvedValue({
        result: 'error-desconocido',
      });

      await expect(service.deleteImage(validUrl)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
