import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

export class LoginDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string'
      ? value.trim().toLowerCase()
      : value,
  )
  @IsEmail({}, { message: 'El correo no es válido' })
  correo!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(72)
  password!: string;
}
