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
  HttpStatus,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';

import { ProductsService } from './products.service';
import { FilesService } from '../files/files.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ValidRoles } from '../auth/interfaces/valid-roles';
import { PaginationDto } from '../../common/dtos/pagination.dto';
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

import {
  TempImageDataDto,
  MultipleImageDataDto,
} from '../../common/responses/image-responses.dto';
import { BaseResponseDto } from '../../common/responses/base-response.dto';
import { User } from '../users/entities/user.entity';
import { GetUserOptional } from '../auth/decorators/get-user-optional.decorator';
import { JwtOptionalGuard } from '../auth/guards/jwt-optional.guard';

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
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo producto' })
  @ApiBaseResponse(Product, 'Producto creado', HttpStatus.CREATED)
  @ApiValidationResponse()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @UseGuards(JwtOptionalGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Listado paginado de productos' })
  @ApiBaseResponse(Product, 'Listado obtenido', HttpStatus.OK, true)
  findAll(
    @Query() paginationDto: PaginationDto,
    @GetUserOptional() user?: User,
  ) {
    console.log('Usuario detectado en ruta pública:', user?.email);
    return this.productsService.findAll(paginationDto, user?.id);
  }

  @Post('upload-temp')
  @Auth(ValidRoles.admin)
  @HttpCode(HttpStatus.CREATED)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Subir imagen temporal a Cloudinary (Admin)' })
  @ApiBaseResponse(
    TempImageDataDto,
    'Imagen subida con éxito',
    HttpStatus.CREATED,
  )
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

  @Get('search')
  @ApiOperation({ summary: 'Busca productos por título, descripción o marca' })
  search(@Query('q') q: string, @Query() paginationDto: PaginationDto) {
    if (!q)
      throw new BadRequestException(
        'El parámetro de búsqueda "q" es requerido',
      );
    return this.productsService.search(q, paginationDto);
  }

  @Get('category/:slug')
  @ApiOperation({
    summary: 'Obtiene productos filtrados por el slug de la categoría',
  })
  findByCategory(
    @Param('slug') slug: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.productsService.findByCategorySlug(slug, paginationDto);
  }

  @Get(':term')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener producto por ID o slug' })
  @ApiBaseResponse(Product, 'Producto encontrado', HttpStatus.OK)
  @ApiIdResponse()
  findOne(@Param('term') term: string) {
    return this.productsService.findOne(term);
  }

  @Post(':id/upload-multiple')
  @Auth(ValidRoles.admin)
  @HttpCode(HttpStatus.CREATED)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Subir imágenes a un producto' })
  @ApiBaseResponse(
    MultipleImageDataDto,
    'Imágenes vinculadas correctamente',
    HttpStatus.CREATED,
  )
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
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar producto' })
  @ApiBaseResponse(Product, 'Producto actualizado', HttpStatus.OK)
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
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminación física del producto' })
  @ApiBaseResponse(
    BaseResponseDto,
    'Producto eliminado',
    HttpStatus.OK,
    false,
    false,
  )
  @ApiIdResponse()
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.remove(id);
  }

  @Delete(':id/image')
  @Auth(ValidRoles.admin)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Quitar una imagen específica del producto' })
  @ApiBaseResponse(
    BaseResponseDto,
    'Imagen removida',
    HttpStatus.OK,
    false,
    false,
  )
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
