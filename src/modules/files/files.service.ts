import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

interface DeleteApiResponse {
  result: 'ok' | 'not found' | (string & {});
}

@Injectable()
export class FilesService {
  private readonly logger = new Logger('FilesService');

  async uploadImage(file: Express.Multer.File): Promise<UploadApiResponse> {
    if (!file?.buffer) {
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
        (error, result) => {
          if (error) {
            this.logger.error(`Cloudinary Error: ${error.message}`);
            return reject(
              new BadRequestException(`Cloudinary: ${error.message}`),
            );
          }
          if (!result) {
            return reject(
              new InternalServerErrorException(
                'No se recibió respuesta de Cloudinary',
              ),
            );
          }
          resolve(result);
        },
      );

      Readable.from(file.buffer).pipe(upload);
    });
  }

  async deleteImage(imageUrl: string): Promise<DeleteApiResponse> {
    try {
      const regex = /\/upload\/(?:v\d+\/)?([^.]+)/;
      const match = imageUrl.match(regex);

      if (!match) {
        throw new BadRequestException('URL de imagen inválida');
      }

      const publicId = match[1];

      const result = (await cloudinary.uploader.destroy(
        publicId,
      )) as DeleteApiResponse;

      if (result.result !== 'ok' && result.result !== 'not found') {
        throw new InternalServerErrorException(
          `Error al borrar en Cloudinary: ${result.result}`,
        );
      }

      return result;
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException(
        'Error al procesar la eliminación de la imagen',
      );
    }
  }
}
