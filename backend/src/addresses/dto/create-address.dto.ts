import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateAddressDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  alias?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  direccion!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  ciudad!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  departamento!: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  codigo_postal?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  telefono_contacto?: string;

  @IsOptional()
  @IsBoolean()
  predeterminada?: boolean;
}

