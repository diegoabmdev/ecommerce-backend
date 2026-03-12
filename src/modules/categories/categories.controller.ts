import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { RoleProtected } from '../auth/decorators/role-protected.decorator';
import { ValidRoles } from '../auth/interfaces/valid-roles';
import { UserRoleGuard } from '../auth/guards/user-role.guard';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @RoleProtected(ValidRoles.admin)
  @UseGuards(AuthGuard(), UserRoleGuard)
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get('menu-stats')
  async getMenuStats() {
    return await this.categoriesService.findAllWithCount();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @Patch(':id')
  @RoleProtected(ValidRoles.admin)
  @UseGuards(AuthGuard(), UserRoleGuard)
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @RoleProtected(ValidRoles.admin)
  @UseGuards(AuthGuard(), UserRoleGuard)
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}
