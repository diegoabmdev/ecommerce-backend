import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  Patch,
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

@ApiTags('Users')
@ApiServerErrors()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Registrar nuevo usuario',
    description:
      'Crea un usuario en el sistema. La contraseña se encripta automáticamente.',
  })
  @ApiBaseResponse(User, 'Usuario creado exitosamente')
  @ApiValidationResponse()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Auth(ValidRoles.admin)
  @ApiOperation({ summary: 'Listar todos los usuarios (Admin)' })
  @ApiBaseResponse(User, 'Lista de usuarios obtenida')
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @Auth()
  @ApiOperation({ summary: 'Obtener usuario por ID' })
  @ApiBaseResponse(User, 'Usuario encontrado')
  @ApiIdResponse()
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findOne(id);
  }

  @Patch('me')
  @Auth()
  @ApiOperation({
    summary: 'Actualizar mi perfil',
    description:
      'Permite al usuario autenticado cambiar su nombre, teléfono, correo o contraseña.',
  })
  @ApiBaseResponse(User, 'Perfil actualizado correctamente')
  @ApiValidationResponse()
  updateMe(@GetUser() user: User, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(user.id, updateUserDto);
  }

  @Patch(':id')
  @Auth(ValidRoles.admin)
  @ApiOperation({ summary: 'Actualizar usuario por ID (Admin)' })
  @ApiBaseResponse(User, 'Usuario actualizado por el administrador')
  @ApiIdResponse()
  updateAdmin(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }
}
