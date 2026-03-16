import { ApiProperty } from '@nestjs/swagger';

export class TempImageDataDto {
  @ApiProperty({ example: 'https://res.cloudinary.com/.../temp.jpg' })
  imageUrl: string;
}

export class MultipleImageDataDto {
  @ApiProperty({ example: ['https://url1.jpg', 'https://url2.jpg'] })
  images: string[];
}

export class MessageDataDto {
  @ApiProperty({ example: 'Accion realizada correctamente' })
  message: string;
}
