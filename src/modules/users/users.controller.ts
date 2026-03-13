import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
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
}
