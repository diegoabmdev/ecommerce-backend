import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { Address } from './entities/address.entity';
import { Auth } from '../../common/decorators/auth.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from './entities/user.entity';
import { ApiBaseResponse } from '../../common/decorators/api-res-generic.decorator';

@ApiTags('Addresses')
@Auth()
@Controller('addresses')
export class AddressesController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Agregar una dirección al perfil' })
  @ApiBaseResponse(Address, 'Dirección agregada')
  async create(@Body() dto: CreateAddressDto, @GetUser() user: User) {
    return this.usersService.addAddress(user, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar mis direcciones' })
  @ApiBaseResponse(Address, 'Lista de direcciones')
  async findAll(@GetUser() user: User) {
    return this.usersService.findAddresses(user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una dirección' })
  async remove(@Param('id', ParseUUIDPipe) id: string, @GetUser() user: User) {
    return this.usersService.removeAddress(id, user.id);
  }
}
