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
    if (!user) console.warn(`[deposit-email] Usuario no encontrado: "${idStr}"`);
    return user || null;
  } catch (err) {
    console.error(`[deposit-email] Error buscando usuario ${userId}:`, err.message);
    return null;
  }
};

const formatDate = (date) =>
  new Date(date).toLocaleString('es-GT', {
    timeZone: 'America/Guatemala',
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });

const generateDepositPDF = (deposito, cuenta, usuario) =>
  new Promise((resolve, reject) => {
    const doc    = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('end',  ()  => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const C_PRIMARY = '#28a745'; // verde para depósitos
    const C_DARK    = '#333333';
    const C_GRAY    = '#666666';
    const C_BORDER  = '#dee2e6';
    const W         = doc.page.width - 100;
    const H         = doc.page.height;

    // Encabezado
    doc.rect(0, 0, doc.page.width, 90).fill(C_PRIMARY);
    doc.font('Helvetica-Bold').fontSize(22).fillColor('#fff').text('BANCA DIGITAL', 50, 20);
    doc.font('Helvetica').fontSize(10).fillColor('#d4edda').text('Comprobante Oficial de Deposito', 50, 48);
    doc.fontSize(9).fillColor('#d4edda').text(`Generado: ${formatDate(new Date())}`, 50, 63);
    doc.font('Helvetica-Bold').fontSize(9).fillColor('#fff')
      .text(`N ${deposito.id_deposito}`, 50, 20, { align: 'right', width: W });

    // Banda
    doc.rect(0, 90, doc.page.width, 32).fill('#1e7e34');
    doc.font('Helvetica-Bold').fontSize(11).fillColor('#fff')
      .text('  DEPOSITO DE FONDOS', 50, 101, { width: W });

    let y = 142;

    // Monto destacado
    doc.rect(50, y, W, 60).fill('#f0fff4').stroke(C_BORDER);
    doc.font('Helvetica').fontSize(10).fillColor(C_GRAY)
      .text('MONTO DEPOSITADO', 50, y + 10, { align: 'center', width: W });
    doc.font('Helvetica-Bold').fontSize(28).fillColor(C_PRIMARY)
      .text(`Q ${Number(deposito.monto).toFixed(2)}`, 50, y + 26, { align: 'center', width: W });
    y += 80;

    // Tarjeta genérica
    const drawCard = (title, rows, startY) => {
      const h = 28 + rows.length * 22 + 10;
      doc.rect(50, startY, W, h).fill('#fff').stroke(C_BORDER);
      doc.rect(50, startY, W, 26).fill(C_PRIMARY);
      doc.font('Helvetica-Bold').fontSize(10).fillColor('#fff').text(title, 62, startY + 8);
      let ry = startY + 34;
      rows.forEach(([lbl, val], i) => {
        if (i % 2 === 0) doc.rect(50, ry - 2, W, 22).fill('#f0fff4');
        doc.font('Helvetica').fontSize(9).fillColor(C_GRAY).text(lbl, 62, ry, { width: W / 2 - 20 });
        doc.font('Helvetica-Bold').fontSize(9).fillColor(C_DARK)
          .text(String(val ?? '-'), 62 + W / 2, ry, { width: W / 2 - 20 });
        ry += 22;
      });
      return startY + h + 14;
    };

    // Detalles del depósito
    y = drawCard('DETALLES DEL DEPOSITO', [
      ['Numero de deposito', deposito.id_deposito],
      ['Fecha y hora',       formatDate(deposito.fecha_deposito || deposito.createdAt)],
      ['Estado',             'COMPLETADO'],
    ], y);

    // Datos de la cuenta
    const cuentaRows = [
      ['Numero de cuenta', cuenta.no_cuenta || '-'],
      ['Tipo de cuenta',   cuenta.tipo_cuenta],
      ['Titular',          usuario ? `${usuario.Name} ${usuario.Surname}` : '-'],
      ['Saldo anterior',   `Q ${Number(deposito.saldo_anterior).toFixed(2)}`],
      ['Saldo actual',     `Q ${Number(deposito.saldo_posterior).toFixed(2)}`],
    ];
    if (cuenta.alias) cuentaRows.push(['Alias', cuenta.alias]);
    y = drawCard('CUENTA DESTINATARIA', cuentaRows, y);

    // Aviso
    doc.rect(50, y, W, 38).fill('#fff3cd').stroke('#ffc107');
    doc.font('Helvetica').fontSize(8).fillColor('#856404')
      .text('Comprobante oficial de deposito. Conservelo para sus registros. Si no reconoce esta operacion comuniquese con atencion al cliente.', 58, y + 8, { width: W - 16 });

    // Pie
    doc.rect(0, H - 40, doc.page.width, 40).fill('#f1f3f5');
    doc.font('Helvetica').fontSize(8).fillColor(C_GRAY)
      .text('Banca Digital - Sistema de Gestion Bancaria  |  Documento generado automaticamente  |  Confidencial', 50, H - 26, { align: 'center', width: W });

    doc.end();
  });

const generateDepositHistoryPDF = (depositos, cuenta, usuario) =>
  new Promise((resolve, reject) => {
    const doc    = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('end',  ()  => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const C_PRIMARY = '#28a745';
    const C_DARK    = '#333333';
    const C_GRAY    = '#666666';
    const C_BORDER  = '#dee2e6';
    const W         = doc.page.width - 100;
    const H         = doc.page.height;

    // Encabezado
    doc.rect(0, 0, doc.page.width, 90).fill(C_PRIMARY);
    doc.font('Helvetica-Bold').fontSize(22).fillColor('#fff').text('BANCA DIGITAL', 50, 20);
    doc.font('Helvetica').fontSize(10).fillColor('#d4edda').text('Estado de Cuenta - Historial de Depositos', 50, 48);
    doc.fontSize(9).fillColor('#d4edda').text(`Generado: ${formatDate(new Date())}`, 50, 63);
    doc.font('Helvetica-Bold').fontSize(9).fillColor('#fff')
      .text(`Cuenta: ${cuenta.no_cuenta}`, 50, 20, { align: 'right', width: W });

    // Banda
    doc.rect(0, 90, doc.page.width, 32).fill('#1e7e34');
    doc.font('Helvetica-Bold').fontSize(11).fillColor('#fff')
      .text('  ULTIMOS 5 DEPOSITOS', 50, 101, { width: W });

    let y = 142;

    // Info de la cuenta
    doc.rect(50, y, W, 60).fill('#f0fff4').stroke(C_BORDER);
    doc.font('Helvetica-Bold').fontSize(10).fillColor(C_PRIMARY)
      .text(`${usuario.Name} ${usuario.Surname}`, 62, y + 10);
    doc.font('Helvetica').fontSize(9).fillColor(C_GRAY)
      .text(`Cuenta ${cuenta.tipo_cuenta}  |  N ${cuenta.no_cuenta}  |  Saldo actual: Q ${Number(cuenta.saldo).toFixed(2)}`, 62, y + 30);
    y += 74;

    if (depositos.length === 0) {
      doc.font('Helvetica').fontSize(11).fillColor(C_GRAY)
        .text('No se encontraron depositos para esta cuenta.', 50, y, { align: 'center', width: W });
    } else {
      // Encabezado de tabla
      const colX  = [50, 150, 270, 370, 460];
      const colW  = [95, 115, 95,  88,  W - 410];
      const heads = ['Referencia', 'Fecha', 'Monto', 'Saldo Ant.', 'Saldo Act.'];

      doc.rect(50, y, W, 24).fill(C_PRIMARY);
      heads.forEach((h, i) => {
        doc.font('Helvetica-Bold').fontSize(8).fillColor('#fff')
          .text(h, colX[i] + 4, y + 7, { width: colW[i] });
      });
      y += 24;

      depositos.forEach((d, idx) => {
        const bg = idx % 2 === 0 ? '#ffffff' : '#f0fff4';
        doc.rect(50, y, W, 26).fill(bg).stroke(C_BORDER);

        const row = [
          d.id_deposito || '-',
          formatDate(d.fecha_deposito || d.createdAt),
          `Q ${Number(d.monto).toFixed(2)}`,
          `Q ${Number(d.saldo_anterior).toFixed(2)}`,
          `Q ${Number(d.saldo_posterior).toFixed(2)}`,
        ];

        row.forEach((val, i) => {
          doc.font('Helvetica').fontSize(8)
            .fillColor(i === 2 ? C_PRIMARY : C_DARK)
            .text(val, colX[i] + 4, y + 8, { width: colW[i] - 4 });
        });
        y += 26;
      });

      // Total depositado
      const totalDepositado = depositos.reduce((acc, d) => acc + Number(d.monto), 0);
      y += 10;
      doc.rect(50, y, W, 28).fill('#1e7e34');
      doc.font('Helvetica-Bold').fontSize(9).fillColor('#fff')
        .text('TOTAL DEPOSITADO (ultimos 5):', 62, y + 8, { width: W / 2 });
      doc.font('Helvetica-Bold').fontSize(9).fillColor('#fff')
        .text(`Q ${totalDepositado.toFixed(2)}`, 62 + W / 2, y + 8, { width: W / 2 });
      y += 42;
    }

    // Aviso
    doc.rect(50, y, W, 38).fill('#fff3cd').stroke('#ffc107');
    doc.font('Helvetica').fontSize(8).fillColor('#856404')
      .text('Este documento es un resumen de sus ultimas operaciones. Para consultas comuniquese con atencion al cliente.', 58, y + 8, { width: W - 16 });

    // Pie
    doc.rect(0, H - 40, doc.page.width, 40).fill('#f1f3f5');
    doc.font('Helvetica').fontSize(8).fillColor(C_GRAY)
      .text('Banca Digital - Sistema de Gestion Bancaria  |  Documento generado automaticamente  |  Confidencial', 50, H - 26, { align: 'center', width: W });

    doc.end();
  });

export const sendDepositEmail = async (deposito, cuenta) => {
  if (!transporter) return;
  try {
    const usuario = await getUserEmail(cuenta.usuario_cuenta);
    if (!usuario) {
      console.warn('[deposit-email] No se encontro usuario para notificar.');
      return;
    }

    const monto = `Q ${Number(deposito.monto).toFixed(2)}`;
    const depId = deposito.id_deposito || String(deposito._id);
    const fecha = formatDate(deposito.fecha_deposito || deposito.createdAt);
    const from  = `${config.smtp.fromName} <${config.smtp.fromEmail}>`;
    const pdf   = await generateDepositPDF(deposito, cuenta, usuario);

    await transporter.sendMail({
      from,
      to:      usuario.Email,
      subject: `Deposito recibido - ${monto} | Ref: ${depId}`,
      html: `
        <div style="background:#f4f4f4;padding:40px 20px;font-family:Arial,sans-serif;text-align:center;">
          <div style="max-width:520px;margin:0 auto;background:#fff;border-top:4px solid #28a745;border-radius:4px;padding:30px;">
            <h2 style="color:#28a745;margin-top:0;">Deposito Recibido</h2>
            <p style="color:#555;font-size:15px;">
              Estimado/a <strong>${usuario.Name} ${usuario.Surname}</strong>,<br>
              Se ha acreditado un deposito en su cuenta.
            </p>
            <table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:14px;text-align:left;">
              <tr style="background:#f0fff4;"><td style="padding:10px;color:#666;">Monto depositado</td><td style="padding:10px;font-weight:bold;color:#28a745;">${monto}</td></tr>
              <tr><td style="padding:10px;color:#666;">Cuenta</td><td style="padding:10px;font-weight:bold;">${cuenta.no_cuenta}</td></tr>
              <tr style="background:#f0fff4;"><td style="padding:10px;color:#666;">Saldo anterior</td><td style="padding:10px;font-weight:bold;color:#888;">Q ${Number(deposito.saldo_anterior).toFixed(2)}</td></tr>
              <tr><td style="padding:10px;color:#666;">Saldo actual</td><td style="padding:10px;font-weight:bold;color:#004a99;">Q ${Number(deposito.saldo_posterior).toFixed(2)}</td></tr>
              <tr style="background:#f0fff4;"><td style="padding:10px;color:#666;">Fecha</td><td style="padding:10px;color:#333;">${fecha}</td></tr>
              <tr><td style="padding:10px;color:#666;">Referencia</td><td style="padding:10px;color:#333;">${depId}</td></tr>
            </table>
            <p style="color:#888;font-size:12px;border-top:1px solid #eee;padding-top:16px;">
              Se adjunta el comprobante oficial en PDF.<br>
              Si no reconoce esta operacion, contactenos de inmediato.
            </p>
          </div>
        </div>`,
      attachments: [{ filename: `deposito-${depId}.pdf`, content: pdf, contentType: 'application/pdf' }],
    });

    console.log(`[deposit-email] Comprobante enviado a ${usuario.Email}`);
  } catch (err) {
    console.error('Error enviando email de deposito:', err.message);
  }
};

export const sendDepositHistoryEmail = async (depositos, cuenta) => {
  if (!transporter) return;
  try {
    const usuario = await getUserEmail(cuenta.usuario_cuenta);
    if (!usuario) {
      console.warn('[deposit-email] No se encontro usuario para historial.');
      return;
    }

    const from  = `${config.smtp.fromName} <${config.smtp.fromEmail}>`;
    const fecha = formatDate(new Date());
    const pdf   = await generateDepositHistoryPDF(depositos, cuenta, usuario);

    const filas = depositos.length > 0
      ? depositos.map((d, i) => `
          <tr style="background:${i % 2 === 0 ? '#fff' : '#f0fff4'};">
            <td style="padding:8px;color:#333;">${d.id_deposito || '-'}</td>
            <td style="padding:8px;color:#555;">${formatDate(d.fecha_deposito || d.createdAt)}</td>
            <td style="padding:8px;font-weight:bold;color:#28a745;">Q ${Number(d.monto).toFixed(2)}</td>
            <td style="padding:8px;color:#888;">Q ${Number(d.saldo_anterior).toFixed(2)}</td>
            <td style="padding:8px;font-weight:bold;color:#004a99;">Q ${Number(d.saldo_posterior).toFixed(2)}</td>
          </tr>`).join('')
      : `<tr><td colspan="5" style="padding:16px;text-align:center;color:#888;">No hay depositos registrados.</td></tr>`;

    await transporter.sendMail({
      from,
      to:      usuario.Email,
      subject: `Historial de Depositos - Cuenta ${cuenta.no_cuenta} | ${fecha}`,
      html: `
        <div style="background:#f4f4f4;padding:40px 20px;font-family:Arial,sans-serif;text-align:center;">
          <div style="max-width:600px;margin:0 auto;background:#fff;border-top:4px solid #28a745;border-radius:4px;padding:30px;">
            <h2 style="color:#28a745;margin-top:0;">Historial de Depositos</h2>
            <p style="color:#555;font-size:15px;">
              Estimado/a <strong>${usuario.Name} ${usuario.Surname}</strong>,<br>
              A continuacion sus ultimos 5 depositos recibidos.
            </p>
            <p style="color:#666;font-size:13px;text-align:left;">
              Cuenta: <strong>${cuenta.no_cuenta}</strong> &nbsp;|&nbsp;
              Tipo: <strong>${cuenta.tipo_cuenta}</strong> &nbsp;|&nbsp;
              Saldo actual: <strong style="color:#004a99;">Q ${Number(cuenta.saldo).toFixed(2)}</strong>
            </p>
            <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:13px;text-align:left;">
              <thead>
                <tr style="background:#28a745;color:#fff;">
                  <th style="padding:10px;">Referencia</th>
                  <th style="padding:10px;">Fecha</th>
                  <th style="padding:10px;">Monto</th>
                  <th style="padding:10px;">Saldo Ant.</th>
                  <th style="padding:10px;">Saldo Act.</th>
                </tr>
              </thead>
              <tbody>${filas}</tbody>
            </table>
            <p style="color:#888;font-size:12px;border-top:1px solid #eee;padding-top:16px;">
              Se adjunta el estado de cuenta en PDF.<br>
              Si no reconoce alguna operacion, contactenos de inmediato.
            </p>
          </div>
        </div>`,
      attachments: [{ filename: `historial-depositos-${cuenta.no_cuenta}.pdf`, content: pdf, contentType: 'application/pdf' }],
    });

    console.log(`[deposit-email] Historial enviado a ${usuario.Email}`);
  } catch (err) {
    console.error('Error enviando historial de depositos:', err.message);
  }
};