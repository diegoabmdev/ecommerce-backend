import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Delete,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { Address } from './entities/address.entity';
import { Auth } from '../../common/decorators/auth.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from './entities/user.entity';
import { ApiBaseResponse } from '../../common/decorators/api-res-generic.decorator';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@ApiTags('Addresses')
@Auth()
@Controller('addresses')
export class AddressesController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Agregar una dirección al perfil' })
  @ApiBaseResponse(Address, 'Dirección agregada', HttpStatus.CREATED, false)
  async create(@Body() dto: CreateAddressDto, @GetUser() user: User) {
    return this.usersService.addAddress(user, dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Listar mis direcciones' })
  @ApiBaseResponse(Address, 'Lista de direcciones', HttpStatus.OK, true)
  async findAll(@GetUser() user: User, @Query() paginationDto: PaginationDto) {
    return this.usersService.findAddresses(user.id, paginationDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar una dirección' })
  @ApiBaseResponse(Address, 'Dirección eliminada', HttpStatus.OK, false)
  async remove(@Param('id', ParseUUIDPipe) id: string, @GetUser() user: User) {
    return this.usersService.removeAddress(id, user.id);
  }
}
