import { ApiProperty } from '@nestjs/swagger';

// Para: upload-temp
export class TempImageDataDto {
  @ApiProperty({ example: 'https://res.cloudinary.com/.../temp.jpg' })
  imageUrl: string;
}

// Para: upload-multiple
export class MultipleImageDataDto {
  @ApiProperty({ example: ['https://url1.jpg', 'https://url2.jpg'] })
  images: string[];
}

// Para: delete-image y otros mensajes simples
export class MessageDataDto {
  @ApiProperty({ example: 'Accion realizada correctamente' })
  message: string;
}
