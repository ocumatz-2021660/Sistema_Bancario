import nodemailer from 'nodemailer';
import PDFDocument from 'pdfkit';
import { config } from '../../configs/config.js';
import { User } from '../users/user.model.js';

const createTransporter = () => {
  if (!config.smtp.username || !config.smtp.password) {
    console.warn('SMTP credentials not configured.');
    return null;
  }
  return nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.enableSsl,
    auth: { user: config.smtp.username, pass: config.smtp.password },
    connectionTimeout: 10_000,
    greetingTimeout:   10_000,
    socketTimeout:     10_000,
    tls: { rejectUnauthorized: false },
  });
};

const transporter = createTransporter();

const getUserEmail = async (userId) => {
  if (!userId) return null;
  try {
    const idStr = userId?.toString?.() ?? String(userId);
    const user  = await User.findByPk(idStr, { attributes: ['Id', 'Name', 'Surname', 'Email'] });
    if (!user) console.warn(`[withdrawal-email] Usuario no encontrado: "${idStr}"`);
    return user || null;
  } catch (err) {
    console.error(`[withdrawal-email] Error buscando usuario ${userId}:`, err.message);
    return null;
  }
};

const formatDate = (date) =>
  new Date(date).toLocaleString('es-GT', {
    timeZone: 'America/Guatemala',
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });

const generateWithdrawalPDF = (retiro, cuenta, usuario) =>
  new Promise((resolve, reject) => {
    const doc    = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('end',  ()  => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const C_PRIMARY = '#c0392b'; // rojo para retiros
    const C_DARK    = '#333333';
    const C_GRAY    = '#666666';
    const C_BORDER  = '#dee2e6';
    const W         = doc.page.width - 100;
    const H         = doc.page.height;

    doc.rect(0, 0, doc.page.width, 90).fill(C_PRIMARY);
    doc.font('Helvetica-Bold').fontSize(22).fillColor('#fff').text('BANCA DIGITAL', 50, 20);
    doc.font('Helvetica').fontSize(10).fillColor('#fdd').text('Comprobante Oficial de Retiro', 50, 48);
    doc.fontSize(9).fillColor('#fdd').text(`Generado: ${formatDate(new Date())}`, 50, 63);
    doc.font('Helvetica-Bold').fontSize(9).fillColor('#fff')
      .text(`N ${retiro.id_retiro}`, 50, 20, { align: 'right', width: W });

    // Banda
    doc.rect(0, 90, doc.page.width, 32).fill('#922b21');
    doc.font('Helvetica-Bold').fontSize(11).fillColor('#fff')
      .text('  RETIRO DE FONDOS', 50, 101, { width: W });

    let y = 142;

    doc.rect(50, y, W, 60).fill('#fdf2f2').stroke(C_BORDER);
    doc.font('Helvetica').fontSize(10).fillColor(C_GRAY)
      .text('MONTO RETIRADO', 50, y + 10, { align: 'center', width: W });
    doc.font('Helvetica-Bold').fontSize(28).fillColor(C_PRIMARY)
      .text(`Q ${Number(retiro.monto).toFixed(2)}`, 50, y + 26, { align: 'center', width: W });
    y += 80;

    const drawCard = (title, rows, startY) => {
      const h = 28 + rows.length * 22 + 10;
      doc.rect(50, startY, W, h).fill('#fff').stroke(C_BORDER);
      doc.rect(50, startY, W, 26).fill(C_PRIMARY);
      doc.font('Helvetica-Bold').fontSize(10).fillColor('#fff').text(title, 62, startY + 8);
      let ry = startY + 34;
      rows.forEach(([lbl, val], i) => {
        if (i % 2 === 0) doc.rect(50, ry - 2, W, 22).fill('#fdf2f2');
        doc.font('Helvetica').fontSize(9).fillColor(C_GRAY).text(lbl, 62, ry, { width: W / 2 - 20 });
        doc.font('Helvetica-Bold').fontSize(9).fillColor(C_DARK)
          .text(String(val ?? '-'), 62 + W / 2, ry, { width: W / 2 - 20 });
        ry += 22;
      });
      return startY + h + 14;
    };

    y = drawCard('DETALLES DEL RETIRO', [
      ['Numero de retiro', retiro.id_retiro],
      ['Fecha y hora',     formatDate(retiro.fecha_retiro || retiro.createdAt)],
      ['Estado',           'COMPLETADO'],
    ], y);

    // Datos de la cuenta
    const cuentaRows = [
      ['Numero de cuenta', cuenta.no_cuenta || '-'],
      ['Tipo de cuenta',   cuenta.tipo_cuenta],
      ['Titular',          usuario ? `${usuario.Name} ${usuario.Surname}` : '-'],
      ['Saldo anterior',   `Q ${Number(retiro.saldo_anterior).toFixed(2)}`],
      ['Saldo actual',     `Q ${Number(retiro.saldo_posterior).toFixed(2)}`],
    ];
    if (cuenta.alias) cuentaRows.push(['Alias', cuenta.alias]);
    y = drawCard('CUENTA', cuentaRows, y);

    doc.rect(50, y, W, 38).fill('#fff3cd').stroke('#ffc107');
    doc.font('Helvetica').fontSize(8).fillColor('#856404')
      .text('Comprobante oficial de retiro. Conservelo para sus registros. Si no reconoce esta operacion comuniquese con atencion al cliente.', 58, y + 8, { width: W - 16 });

    // Pie
    doc.rect(0, H - 40, doc.page.width, 40).fill('#f1f3f5');
    doc.font('Helvetica').fontSize(8).fillColor(C_GRAY)
      .text('Banca Digital - Sistema de Gestion Bancaria  |  Documento generado automaticamente  |  Confidencial', 50, H - 26, { align: 'center', width: W });

    doc.end();
  });

// Envío de correo de retiro
export const sendWithdrawalEmail = async (retiro, cuenta) => {
  if (!transporter) return;
  try {
    const usuario = await getUserEmail(cuenta.usuario_cuenta);
    if (!usuario) {
      console.warn('[withdrawal-email] No se encontró usuario para notificar.');
      return;
    }

    const monto = `Q ${Number(retiro.monto).toFixed(2)}`;
    const retId = retiro.id_retiro || String(retiro._id);
    const fecha = formatDate(retiro.fecha_retiro || retiro.createdAt);
    const from  = `${config.smtp.fromName} <${config.smtp.fromEmail}>`;

    const pdf = await generateWithdrawalPDF(retiro, cuenta, usuario);

    await transporter.sendMail({
      from,
      to:      usuario.Email,
      subject: `Comprobante de Retiro - ${monto} | Ref: ${retId}`,
      html: `
        <div style="background:#f4f4f4;padding:40px 20px;font-family:Arial,sans-serif;text-align:center;">
          <div style="max-width:520px;margin:0 auto;background:#fff;border-top:4px solid #c0392b;border-radius:4px;padding:30px;">
            <h2 style="color:#c0392b;margin-top:0;">Retiro Realizado</h2>
            <p style="color:#555;font-size:15px;">
              Estimado/a <strong>${usuario.Name} ${usuario.Surname}</strong>,<br>
              Se ha realizado un retiro de fondos en su cuenta.
            </p>
            <table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:14px;text-align:left;">
              <tr style="background:#fdf2f2;"><td style="padding:10px;color:#666;">Monto retirado</td><td style="padding:10px;font-weight:bold;color:#c0392b;">${monto}</td></tr>
              <tr><td style="padding:10px;color:#666;">Cuenta</td><td style="padding:10px;font-weight:bold;">${cuenta.no_cuenta}</td></tr>
              <tr style="background:#fdf2f2;"><td style="padding:10px;color:#666;">Saldo anterior</td><td style="padding:10px;font-weight:bold;color:#888;">Q ${Number(retiro.saldo_anterior).toFixed(2)}</td></tr>
              <tr><td style="padding:10px;color:#666;">Saldo actual</td><td style="padding:10px;font-weight:bold;color:#004a99;">Q ${Number(retiro.saldo_posterior).toFixed(2)}</td></tr>
              <tr style="background:#fdf2f2;"><td style="padding:10px;color:#666;">Fecha</td><td style="padding:10px;color:#333;">${fecha}</td></tr>
              <tr><td style="padding:10px;color:#666;">Referencia</td><td style="padding:10px;color:#333;">${retId}</td></tr>
            </table>
            <p style="color:#888;font-size:12px;border-top:1px solid #eee;padding-top:16px;">
              Se adjunta el comprobante oficial en PDF.<br>
              Si no reconoce esta operacion, contactenos de inmediato.
            </p>
          </div>
        </div>`,
      attachments: [{ filename: `retiro-${retId}.pdf`, content: pdf, contentType: 'application/pdf' }],
    });

    console.log(`[withdrawal-email] Correo enviado a ${usuario.Email}`);
  } catch (err) {
    console.error('Error enviando email de retiro:', err.message);
  }
};