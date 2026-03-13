import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  BadRequestException,
  UseInterceptors,
  UploadedFiles,
  UploadedFile,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';

import { ProductsService } from './products.service';
import { FilesService } from '../files/files.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ValidRoles } from '../auth/interfaces/valid-roles';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Product } from './entities/product.entity';

import { Auth } from '../../common/decorators/auth.decorator';
import { ApiBaseResponse } from '../../common/decorators/api-res-generic.decorator';
import {
  ApiIdResponse,
  ApiFileResponse,
  ApiValidationResponse,
  ApiServerErrors,
} from '../../common/decorators/swagger-errors.decorator';

import { ProductListResponseDto } from 'src/common/responses/product-list-response.dto';
import {
  TempImageDataDto,
  MultipleImageDataDto,
  MessageDataDto,
} from 'src/common/responses/image-responses.dto';

@ApiTags('Products')
@ApiServerErrors()
@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly filesService: FilesService,
  ) {}

  @Post()
  @Auth(ValidRoles.admin)
  @ApiOperation({ summary: 'Crear un nuevo producto (Admin)' })
  @ApiBaseResponse(Product, 'Producto creado exitosamente')
  @ApiValidationResponse()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los productos con paginación' })
  @ApiResponse({ status: 200, type: ProductListResponseDto })
  @ApiValidationResponse()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.productsService.findAll(paginationDto);
  }

  @Post('upload-temp')
  @Auth(ValidRoles.admin)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Subir imagen temporal a Cloudinary (Admin)' })
  @ApiBaseResponse(TempImageDataDto, 'Imagen subida con éxito')
  @ApiFileResponse()
  @ApiBody({
    schema: {
      type: 'object',
      properties: { image: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(FileInterceptor('image'))
  async uploadTempImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Asegúrese de enviar una imagen');
    const result = await this.filesService.uploadImage(file);
    return { imageUrl: result.secure_url };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un producto por ID' })
  @ApiBaseResponse(Product, 'Producto obtenido')
  @ApiIdResponse()
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.findOne(id);
  }

  @Post(':id/upload-multiple')
  @Auth(ValidRoles.admin)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Subir imágenes a un producto' })
  @ApiBaseResponse(MultipleImageDataDto, 'Imágenes vinculadas correctamente')
  @ApiIdResponse()
  @ApiFileResponse()
  @ApiParam({ name: 'id', description: 'UUID del producto' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        images: { type: 'array', items: { type: 'string', format: 'binary' } },
      },
    },
  })
  @UseInterceptors(FilesInterceptor('images', 5))
  async uploadProductImage(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files || files.length === 0)
      throw new BadRequestException('No se subieron imágenes');
    return await this.productsService.uploadMultipleImages(id, files);
  }

  @Patch(':id')
  @Auth(ValidRoles.admin)
  @ApiOperation({ summary: 'Actualizar producto' })
  @ApiBaseResponse(Product, 'Producto actualizado')
  @ApiIdResponse()
  @ApiValidationResponse()
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @Auth(ValidRoles.admin)
  @ApiOperation({ summary: 'Eliminar producto' })
  @ApiBaseResponse(MessageDataDto, 'Producto eliminado físicamente')
  @ApiIdResponse()
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.remove(id);
  }

  @Delete(':id/image')
  @Auth(ValidRoles.admin)
  @ApiOperation({ summary: 'Quitar una imagen específica del producto' })
  @ApiBaseResponse(MessageDataDto, 'Imagen removida de la base de datos')
  @ApiIdResponse()
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        imageUrl: {
          type: 'string',
          example: 'https://res.cloudinary.com/image.jpg',
        },
      },
    },
  })
  async deleteImage(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('imageUrl') imageUrl: string,
  ) {
    if (!imageUrl) throw new BadRequestException('URL requerida');
    return await this.productsService.deleteProductImage(id, imageUrl);
  }
}
