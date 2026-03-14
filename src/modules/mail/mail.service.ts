import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT) || 2525,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }

  async sendResetPasswordEmail(email: string, token: string) {
    const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password?token=${token}`;

    try {
      await this.transporter.sendMail({
        from: `"Soporte E-commerce" <${process.env.MAIL_FROM}>`,
        to: email,
        subject: 'Recuperación de Contraseña',
        html: `<h1>Ingrese al enlace para recuperar su contraseña...</h1><a href="${resetUrl}">Link</a>`,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException(
        `Error al enviar el correo: ${errorMessage}`,
      );
    }
  }
}
