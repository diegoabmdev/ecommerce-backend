import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';

import { Auth } from '../../common/decorators/auth.decorator';
import { ApiBaseResponse } from '../../common/decorators/api-res-generic.decorator';
import {
  ApiIdResponse,
  ApiValidationResponse,
  ApiServerErrors,
} from '../../common/decorators/swagger-errors.decorator';
import { ValidRoles } from '../auth/interfaces/valid-roles';
import { UpdateUserDto } from './dto/update-user.dto';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@ApiTags('Users')
@ApiServerErrors()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Registrar nuevo usuario',
    description:
      'Crea un usuario en el sistema. La contraseña se encripta automáticamente.',
  })
  @ApiBaseResponse(User, 'Usuario creado exitosamente', HttpStatus.CREATED)
  @ApiValidationResponse()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @Auth(ValidRoles.admin)
  @ApiOperation({ summary: 'Listar todos los usuarios (Admin)' })
  @ApiBaseResponse(User, 'Lista de usuarios obtenida', HttpStatus.OK, true)
  findAll(@Query() paginationDto: PaginationDto) {
    return this.usersService.findAll(paginationDto);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @Auth()
  @ApiOperation({ summary: 'Obtener usuario por ID' })
  @ApiBaseResponse(User, 'Usuario encontrado', HttpStatus.OK, false)
  @ApiIdResponse()
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findOne(id);
  }

  @Patch('me')
  @HttpCode(HttpStatus.OK)
  @Auth()
  @ApiOperation({
    summary: 'Actualizar mi perfil',
    description:
      'Permite al usuario autenticado cambiar su nombre, teléfono, correo o contraseña.',
  })
  @ApiBaseResponse(
    User,
    'Perfil actualizado correctamente',
    HttpStatus.OK,
    false,
  )
  @ApiValidationResponse()
  updateMe(@GetUser() user: User, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(user.id, updateUserDto);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @Auth(ValidRoles.admin)
  @ApiOperation({ summary: 'Actualizar usuario por ID (Admin)' })
  @ApiBaseResponse(
    User,
    'Usuario actualizado por el administrador',
    HttpStatus.OK,
    false,
  )
  @ApiIdResponse()
  updateAdmin(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }
}
