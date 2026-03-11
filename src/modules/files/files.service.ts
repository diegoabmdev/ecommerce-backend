import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  v2 as cloudinary,
  UploadApiResponse,
  UploadApiErrorResponse,
} from 'cloudinary';
import { Readable } from 'stream';

interface DeleteApiResponse {
  result: string;
  [key: string]: any;
}

@Injectable()
export class FilesService {
  async uploadImage(file: Express.Multer.File): Promise<UploadApiResponse> {
    if (!file) {
      throw new BadRequestException('No se ha proporcionado ningún archivo');
    }

    const fileBuffer = (file as { buffer: Buffer }).buffer;

    if (!fileBuffer) {
      throw new BadRequestException('El archivo no tiene un contenido válido');
    }

    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        {
          folder: 'ecommerce-products',
          resource_type: 'auto',
          transformation: [
            { width: 1000, crop: 'limit' },
            { quality: 'auto' },
            { fetch_format: 'auto' },
          ],
        },
        (
          error: UploadApiErrorResponse | undefined,
          result: UploadApiResponse | undefined,
        ) => {
          if (error) {
            return reject(new Error(error.message || 'Error en Cloudinary'));
          }
          if (!result) {
            return reject(new Error('No se recibió respuesta de Cloudinary'));
          }
          resolve(result);
        },
      );

      const stream = new Readable();
      stream.push(fileBuffer);
      stream.push(null);
      stream.pipe(upload);
    });
  }

  async deleteImage(imageUrl: string): Promise<DeleteApiResponse> {
    const parts = imageUrl.split('/');
    const fileWithExtension = parts.pop() || '';
    const folder = parts.pop() || '';

    const publicId = `${folder}/${fileWithExtension.split('.')[0]}`;

    try {
      const result = (await cloudinary.uploader.destroy(
        publicId,
      )) as DeleteApiResponse;

      if (result.result !== 'ok' && result.result !== 'not found') {
        throw new Error(`Cloudinary delete status: ${result.result}`);
      }

      return result;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Error al borrar en Cloudinary';
      throw new InternalServerErrorException(message);
    }
  }
}
