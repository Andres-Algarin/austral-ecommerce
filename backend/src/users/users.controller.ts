import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';

import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import {
  ListUsersQueryDto,
  UpdateUserRoleDto,
  UpdateUserStatusDto,
} from './dto/admin-user.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles';

interface AuthenticatedRequest {
  user: {
    id_usuario: number;
    correo: string;
    rol: string;
  };
}

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  // ============================================================
  // MI PERFIL
  // ============================================================

  @Get('profile')
  getProfile(@Request() request: AuthenticatedRequest) {
    return this.usersService.getProfile(
      request.user.id_usuario,
    );
  }

  @Patch('profile')
  updateProfile(
    @Request() request: AuthenticatedRequest,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.updateProfile(
      request.user.id_usuario,
      updateUserDto,
    );
  }

  @Patch('profile/password')
  changePassword(
    @Request() request: AuthenticatedRequest,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(
      request.user.id_usuario,
      changePasswordDto,
    );
  }

  // ============================================================
  // ADMIN
  // ============================================================

  @Get()
  @Roles('admin')
  findAll(@Query() query: ListUsersQueryDto) {
    return this.usersService.findAllAdmin(query);
  }

  @Get(':id')
  @Roles('admin')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOneAdmin(id);
  }

  @Patch(':id/status')
  @Roles('admin')
  updateStatus(
    @Request() request: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserStatusDto: UpdateUserStatusDto,
  ) {
    return this.usersService.updateStatus(
      id,
      request.user.id_usuario,
      updateUserStatusDto,
    );
  }

  @Patch(':id/role')
  @Roles('admin')
  updateRole(
    @Request() request: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserRoleDto: UpdateUserRoleDto,
  ) {
    return this.usersService.updateRole(
      id,
      request.user.id_usuario,
      updateUserRoleDto,
    );
  }
}
