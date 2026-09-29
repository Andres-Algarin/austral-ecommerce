import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @Length(2, 100)
  nombre?: string;

  @IsOptional()
  @IsString()
  @Length(2, 100)
  apellido?: string;

  @IsOptional()
  @IsString()
  @Length(5, 20)
  cedula?: string;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string'
      ? value.trim().toLowerCase()
      : value,
  )
  @IsEmail()
  correo?: string;

  @IsOptional()
  @IsString()
  @Length(7, 20)
  telefono?: string;
}