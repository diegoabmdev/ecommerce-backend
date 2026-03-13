import { ApiProperty } from '@nestjs/swagger';

class TempImageDataDto {
  @ApiProperty({
    example: 'https://res.cloudinary.com/demo/image/upload/temp.jpg',
  })
  imageUrl: string;
}

export class TempImageResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Operación realizada con éxito' })
  message: string;

  @ApiProperty({ type: TempImageDataDto })
  data: TempImageDataDto;
}

class MultipleImageDataDto {
  @ApiProperty({ example: '2 imágenes subidas con éxito' })
  message: string;

  @ApiProperty({ example: ['https://url1.jpg', 'https://url2.jpg'] })
  images: string[];
}

export class ImageUploadResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Imagen subida con éxito' })
  message: string;

  @ApiProperty({ type: MultipleImageDataDto })
  data: MultipleImageDataDto;
}
