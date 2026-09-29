import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';

import { AddressesService } from './addresses.service';

import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface AuthenticatedRequest {
  user: {
    id_usuario: number;
    correo: string;
    rol: string;
  };
}

@Controller('addresses')
@UseGuards(JwtAuthGuard)
export class AddressesController {
  constructor(
    private readonly addressesService: AddressesService,
  ) {}

  @Post()
  create(
    @Request() req: AuthenticatedRequest,
    @Body() createAddressDto: CreateAddressDto,
  ) {
    return this.addressesService.create(
      req.user.id_usuario,
      createAddressDto,
    );
  }

  @Get()
  findAll(
    @Request() req: AuthenticatedRequest,
  ) {
    return this.addressesService.findAll(
      req.user.id_usuario,
    );
  }

  @Get(':id')
  findOne(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.addressesService.findOne(
      id,
      req.user.id_usuario,
    );
  }

  @Patch(':id')
  update(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAddressDto: UpdateAddressDto,
  ) {
    return this.addressesService.update(
      id,
      req.user.id_usuario,
      updateAddressDto,
    );
  }

  @Delete(':id')
  remove(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.addressesService.remove(
      id,
      req.user.id_usuario,
    );
  }
}

