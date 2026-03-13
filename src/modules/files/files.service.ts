import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

interface DeleteApiResponse {
  result: string;
  [key: string]: any;
}

@Injectable()
export class FilesService {
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
          if (error)
            return reject(
              new BadRequestException(`Cloudinary: ${error.message}`),
            );
          if (!result)
            return reject(
              new InternalServerErrorException(
                'No se recibió respuesta de Cloudinary',
              ),
            );
          resolve(result);
        },
      );

      const stream = new Readable();
      stream.push(file.buffer);
      stream.push(null);
      stream.pipe(upload);
    });
  }

  async deleteImage(imageUrl: string): Promise<DeleteApiResponse> {
    const parts = imageUrl.split('/');
    const fileWithExtension = parts.pop() || '';
    const folder = parts.pop() || '';
    const publicId = `${folder}/${fileWithExtension.split('.')[0]}`;

    const result = (await cloudinary.uploader.destroy(
      publicId,
    )) as DeleteApiResponse;

    if (result.result !== 'ok' && result.result !== 'not found') {
      throw new InternalServerErrorException(
        `Error al borrar en Cloudinary: ${result.result}`,
      );
    }

    return result;
  }
}
