import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, Transporter } from 'nodemailer';

interface Mensaje {
  para: string;
  asunto: string;
  html: string;
}

/*
 * Envío de correos por SMTP.
 *
 * Si SMTP_HOST no está configurado (desarrollo), el correo
 * se muestra en la consola en lugar de enviarse.
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: Transporter | null;
  private readonly from: string;

  constructor(private readonly config: ConfigService) {
    const host = config.get<string>('SMTP_HOST');

    this.from = config.get<string>(
      'MAIL_FROM',
      'Austral <no-reply@austral.com>',
    );

    this.transporter = host
      ? createTransport({
          host,
          port: Number(config.get('SMTP_PORT', 587)),
          secure: config.get<string>('SMTP_SECURE') === 'true',
          auth: config.get<string>('SMTP_USER')
            ? {
                user: config.get<string>('SMTP_USER'),
                pass: config.get<string>('SMTP_PASS'),
              }
            : undefined,
        })
      : null;
  }

  get frontendUrl() {
    return this.config
      .get<string>('FRONTEND_URL', 'http://localhost:5173')
      .replace(/\/$/, '');
  }

  async send({ para, asunto, html }: Mensaje) {
    if (!this.transporter) {
      this.logger.log(
        `[SMTP no configurado] Para: ${para} | Asunto: ${asunto}\n${html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()}`,
      );
      return;
    }

    await this.transporter.sendMail({
      from: this.from,
      to: para,
      subject: asunto,
      html,
    });
  }

  /*
   * Para correos que no deben hacer fallar la operación
   * principal (p. ej. confirmación de pedido).
   */
  sendInBackground(mensaje: Mensaje) {
    this.send(mensaje).catch((error: unknown) => {
      this.logger.error(
        `No se pudo enviar el correo "${mensaje.asunto}" a ${mensaje.para}`,
        error instanceof Error ? error.stack : String(error),
      );
    });
  }
}

/*
 * Escapa texto que viene del usuario antes de ponerlo en HTML.
 */
export const escapeHtml = (texto: string | null | undefined) =>
  (texto ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export const formatoPesos = (valor: number | string) =>
  `$${Number(valor).toLocaleString('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
