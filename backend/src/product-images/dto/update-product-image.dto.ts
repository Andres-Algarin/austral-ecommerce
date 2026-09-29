import {
  Equals,
  IsInt,
  IsOptional,
  Min,
} from 'class-validator';

export class UpdateProductImageDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  orden?: number;

  // Solo se puede marcar como principal (true); para cambiar
  // la principal, se marca otra imagen.
  @IsOptional()
  @Equals(true)
  es_principal?: true;
}
