import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';
import { ValidRoles } from '../auth/interfaces/valid-roles';

import { Auth } from '../../common/decorators/auth.decorator';
import { ApiBaseResponse } from '../../common/decorators/api-res-generic.decorator';
import {
  ApiIdResponse,
  ApiValidationResponse,
  ApiServerErrors,
} from '../../common/decorators/swagger-errors.decorator';
import { BaseResponseDto } from '../../common/responses/base-response.dto';

@ApiTags('Categories')
@ApiServerErrors()
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @Auth(ValidRoles.admin)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear una nueva categoría (Admin)' })
  @ApiBaseResponse(Category, 'Categoría creada con éxito', HttpStatus.CREATED)
  @ApiValidationResponse()
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Listar todas las categorías' })
  @ApiBaseResponse(
    Category,
    'Lista de categorías obtenida',
    HttpStatus.OK,
    true,
  )
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get('flat-list')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtiene una lista simple de los slugs' })
  @ApiBaseResponse(
    Category,
    'Lista de categorías obtenida',
    HttpStatus.OK,
    true,
  )
  getFlatList() {
    return this.categoriesService.getFlatList();
  }

  @Get('menu-stats')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener categorías con conteo de productos activos',
  })
  @ApiBaseResponse(Category, 'Categorias activas', HttpStatus.OK)
  getMenuStats() {
    return this.categoriesService.findAllWithCount();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener una categoría por ID' })
  @ApiBaseResponse(Category, 'Categoría encontrada', HttpStatus.OK)
  @ApiIdResponse()
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoriesService.findOne(id);
  }

  @Patch(':id')
  @Auth(ValidRoles.admin)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar una categoría (Admin)' })
  @ApiBaseResponse(Category, 'Categoría actualizada con éxito', HttpStatus.OK)
  @ApiIdResponse()
  @ApiValidationResponse()
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @Auth(ValidRoles.admin)
  @ApiOperation({ summary: 'Eliminar una categoría (Admin)' })
  @ApiBaseResponse(
    BaseResponseDto,
    'Categoría eliminada permanentemente',
    HttpStatus.OK,
    false,
    false,
  )
  @ApiIdResponse()
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoriesService.remove(id);
  }
}
