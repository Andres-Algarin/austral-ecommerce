import {
  IsJWT,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class ResetPasswordDto {
  @IsJWT({ message: 'El enlace de recuperación no es válido' })
  token!: string;

  @IsString()
  @MinLength(6, {
    message: 'La contraseña debe tener al menos 6 caracteres',
  })
  @MaxLength(72)
  password!: string;
}
