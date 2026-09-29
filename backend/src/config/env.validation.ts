/*
 * Valida las variables de entorno al arrancar.
 * Si falta algo obligatorio, la app no inicia y dice qué falta.
 */
export function validateEnv(config: Record<string, unknown>) {
  const errores: string[] = [];

  const requeridas = ['DB_HOST', 'DB_USER', 'DB_NAME', 'JWT_SECRET'];

  for (const clave of requeridas) {
    if (!config[clave]) {
      errores.push(`Falta la variable ${clave}`);
    }
  }

  const jwtSecret = config.JWT_SECRET;

  if (typeof jwtSecret === 'string' && jwtSecret.length > 0 && jwtSecret.length < 32) {
    errores.push('JWT_SECRET debe tener al menos 32 caracteres');
  }

  const numericas = [
    'PORT',
    'DB_PORT',
    'REFRESH_TOKEN_DAYS',
    'COSTO_ENVIO',
    'ENVIO_GRATIS_DESDE',
    'SMTP_PORT',
  ];

  for (const clave of numericas) {
    const valor = config[clave];

    if (valor !== undefined && valor !== '' && Number.isNaN(Number(valor))) {
      errores.push(`${clave} debe ser un número`);
    }
  }

  if (errores.length > 0) {
    throw new Error(
      `Configuración inválida (revisa el archivo .env):\n- ${errores.join('\n- ')}`,
    );
  }

  return config;
}
