import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { email, nombre, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ error: 'Faltan datos requeridos (email u OTP).' }, { status: 400 });
    }

    const gmailUser = process.env.EMAIL_USER || process.env.GMAIL_USER || process.env.SMTP_USER;
    const gmailPass = process.env.EMAIL_PASS || process.env.GMAIL_APP_PASS || process.env.SMTP_PASS;

    // Si se configuran credenciales SMTP en .env.local, enviar correo real mediante Gmail/SMTP
    if (gmailUser && gmailPass) {
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: gmailUser,
            pass: gmailPass.replace(/\s+/g, ''), // Asegurar sin espacios
          },
        });

        const mailOptions = {
          from: `"SICP - U.E. Colegio Simón Bolívar" <${gmailUser}>`,
          to: email,
          subject: `Código de Seguridad para Recuperar Contraseña: ${otp}`,
          html: `
            <div style="font-family: Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 25px; border-radius: 16px;">
              <h2 style="color: #10b981; margin-bottom: 5px;">U.E. Colegio Simón Bolívar • SICP</h2>
              <p style="font-size: 14px; color: #94a3b8; margin-top: 0;">Sistema Integral de Control de Pagos e Inscripciones</p>
              
              <div style="background-color: #1e293b; padding: 20px; border-radius: 12px; margin: 20px 0; border: 1px solid #334155;">
                <p style="margin: 0 0 10px 0; font-size: 15px;">Hola <strong>${nombre || 'Representante'}</strong>,</p>
                <p style="font-size: 14px; color: #cbd5e1;">Has solicitado restablecer tu contraseña de acceso en la plataforma SICP. Tu código de verificación de 6 dígitos es:</p>
                <div style="text-align: center; margin: 25px 0;">
                  <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #34d399; background: #0f172a; padding: 12px 24px; border-radius: 8px; border: 1px solid #059669; display: inline-block;">
                    ${otp}
                  </span>
                </div>
                <p style="font-size: 12px; color: #94a3b8; text-align: center;">Este código es de un solo uso y tiene una validez de <strong>10 minutos</strong>.</p>
              </div>
              
              <p style="font-size: 12px; color: #64748b;">Si no realizaste esta solicitud, por favor comunícate de inmediato con la Secretaría del Colegio.</p>
            </div>
          `,
        };

        await transporter.sendMail(mailOptions);

        return NextResponse.json({
          success: true,
          mode: 'REAL_EMAIL',
          message: `Código enviado exitosamente a tu bandeja de correo Gmail (${email}).`
        });
      } catch (err: any) {
        console.warn('Fallo al enviar correo real con SMTP:', err.message);
      }
    }

    // Modo de contingencia/pruebas locales si no hay SMTP configurado
    return NextResponse.json({
      success: true,
      mode: 'SIMULATED',
      message: 'Código generado en modo de pruebas local.',
      otp: otp
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error al procesar envío de código.' }, { status: 500 });
  }
}
