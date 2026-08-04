export class CreateProductDto {
  nombre!: string;

  descripcion!: string;

  beneficios!: string;

  ingredientes!: string;

  modo_uso!: string;

  precio!: number;

  stock!: number;

  imagen_principal!: string;

  estado!: boolean;

  id_categoria!: number;
}