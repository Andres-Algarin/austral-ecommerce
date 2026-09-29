import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  MinLength,
} from 'class-validator';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class RegisterDto {
  @Transform(trim)
  @IsString()
  @Length(2, 100)
  nombre!: string;

  @Transform(trim)
  @IsString()
  @Length(2, 100)
  apellido!: string;

  @Transform(trim)
  @IsString()
  @Length(5, 20)
  cedula!: string;

  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string'
      ? value.trim().toLowerCase()
      : value,
  )
  @IsEmail({}, { message: 'El correo no es válido' })
  @MaxLength(150)
  correo!: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @Length(7, 20)
  telefono?: string;

  // bcrypt solo usa los primeros 72 bytes.
  @IsString()
  @IsNotEmpty()
  @MinLength(6, {
    message: 'La contraseña debe tener al menos 6 caracteres',
  })
  @MaxLength(72)
  password!: string;
}
