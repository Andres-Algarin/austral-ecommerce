import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

const toBoolean = ({ value }: { value: unknown }) => {
  if (value === 'true' || value === true) {
    return true;
  }

  if (value === 'false' || value === false) {
    return false;
  }

  return value;
};

export const ROLES_USUARIO = ['cliente', 'admin'] as const;

export class ListUsersQueryDto {
  // Busca en nombre, apellido, correo y cédula.
  @IsOptional()
  @IsString()
  @MaxLength(100)
  q?: string;

  @IsOptional()
  @IsIn(ROLES_USUARIO)
  rol?: (typeof ROLES_USUARIO)[number];

  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  estado?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}

export class UpdateUserStatusDto {
  @Transform(toBoolean)
  @IsBoolean()
  estado!: boolean;
}

export class UpdateUserRoleDto {
  @IsIn(ROLES_USUARIO)
  rol!: (typeof ROLES_USUARIO)[number];
}
