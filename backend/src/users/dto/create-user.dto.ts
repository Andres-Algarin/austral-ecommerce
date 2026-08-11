export class CreateUserDto {
  nombre!: string;

  apellido!: string;

  cedula!: string;

  correo!: string;

  telefono!: string;

  password_hash!: string;

  rol!: string;

  estado!: boolean;
}