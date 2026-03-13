import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
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
import { MessageDataDto } from 'src/common/responses/image-responses.dto';

@ApiTags('Categories')
@ApiServerErrors()
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @Auth(ValidRoles.admin)
  @ApiOperation({ summary: 'Crear una nueva categoría (Admin)' })
  @ApiBaseResponse(Category, 'Categoría creada con éxito')
  @ApiValidationResponse()
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las categorías' })
  @ApiBaseResponse(Category, 'Lista de categorías obtenida')
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get('menu-stats')
  @ApiOperation({
    summary: 'Obtener categorías con conteo de productos activos',
  })
  @ApiBaseResponse(Category, 'Categorias activas')
  getMenuStats() {
    return this.categoriesService.findAllWithCount();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una categoría por ID' })
  @ApiBaseResponse(Category, 'Categoría encontrada')
  @ApiIdResponse()
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoriesService.findOne(id);
  }

  @Patch(':id')
  @Auth(ValidRoles.admin)
  @ApiOperation({ summary: 'Actualizar una categoría (Admin)' })
  @ApiBaseResponse(Category, 'Categoría actualizada con éxito')
  @ApiIdResponse()
  @ApiValidationResponse()
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @Auth(ValidRoles.admin)
  @ApiOperation({ summary: 'Eliminar una categoría (Admin)' })
  @ApiBaseResponse(MessageDataDto, 'Categoría eliminada permanentemente')
  @ApiIdResponse()
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoriesService.remove(id);
  }
}
