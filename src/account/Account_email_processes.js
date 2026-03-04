import nodemailer from 'nodemailer';
import PDFDocument from 'pdfkit';
import { config } from '../../configs/config.js';
import { User } from '../users/user.model.js';

// ─── Transporter 
const createTransporter = () => {
  if (!config.smtp.username || !config.smtp.password) {
    console.warn('SMTP credenciales no configuradas.');
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
    if (!user) console.warn(`[email] Usuario no encontrado en PostgreSQL: "${idStr}"`);
    return user || null;
  } catch (err) {
    console.error(`[email] Error buscando usuario ${userId}:`, err.message);
    return null;
  }
};

const formatDate = (date) =>
  new Date(date).toLocaleString('es-GT', {
    timeZone: 'America/Guatemala',
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });

//Generador de PDF con api PDF
const generateTransactionPDF = (
  transaccion,
  cuentaOrigen,  saldoAnteriorOrigen,
  cuentaDestino, saldoAnteriorDestino,
  usuarioOrigen
) =>
  new Promise((resolve, reject) => {
    const doc    = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('end',  ()  => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const C_PRIMARY = '#004a99';
    const C_DARK    = '#333333';
    const C_GRAY    = '#666666';
    const C_BORDER  = '#dee2e6';
    const W         = doc.page.width - 100;
    const H         = doc.page.height;

    // Encabezado azul
    doc.rect(0, 0, doc.page.width, 90).fill(C_PRIMARY);
    doc.font('Helvetica-Bold').fontSize(22).fillColor('#fff').text('Sistema Bancario / Grupo 1', 50, 20);
    doc.font('Helvetica').fontSize(10).fillColor('#cce4ff').text('Comprobante Oficial de Transaccion ', 50, 48);
    doc.fontSize(9).fillColor('#cce4ff').text(`Generado: ${formatDate(new Date())}`, 50, 63);
    const trxLabel = transaccion.id_transaccion || String(transaccion._id).slice(-8).toUpperCase();
    doc.font('Helvetica-Bold').fontSize(9).fillColor('#fff')
      .text(`N ${trxLabel}`, 50, 20, { align: 'right', width: W });

    // Banda tipo
    const esTransferencia = transaccion.tipo_transaccion === 'TRANSFERENCIA';
    doc.rect(0, 90, doc.page.width, 32).fill(esTransferencia ? C_PRIMARY : '#28a745');
    doc.font('Helvetica-Bold').fontSize(11).fillColor('#fff')
      .text(esTransferencia ? '  TRANSFERENCIA ENTRE CUENTAS' : '  DEPOSITO EN CUENTA', 50, 101, { width: W });

    let y = 142;

    // Monto
    doc.rect(50, y, W, 60).fill('#f8f9fa').stroke(C_BORDER);
    doc.font('Helvetica').fontSize(10).fillColor(C_GRAY).text('MONTO DE LA OPERACION', 50, y + 10, { align: 'center', width: W });
    doc.font('Helvetica-Bold').fontSize(28).fillColor(C_PRIMARY)
      .text(`Q ${Number(transaccion.monto).toFixed(2)}`, 50, y + 26, { align: 'center', width: W });
    y += 80;

    // Tarjeta genérica
    const drawCard = (title, rows, startY) => {
      const h = 28 + rows.length * 22 + 10;
      doc.rect(50, startY, W, h).fill('#fff').stroke(C_BORDER);
      doc.rect(50, startY, W, 26).fill(C_PRIMARY);
      doc.font('Helvetica-Bold').fontSize(10).fillColor('#fff').text(title, 62, startY + 8);
      let ry = startY + 34;
      rows.forEach(([lbl, val], i) => {
        if (i % 2 === 0) doc.rect(50, ry - 2, W, 22).fill('#f8f9fa');
        doc.font('Helvetica').fontSize(9).fillColor(C_GRAY).text(lbl, 62, ry, { width: W / 2 - 20 });
        doc.font('Helvetica-Bold').fontSize(9).fillColor(C_DARK)
          .text(String(val ?? '-'), 62 + W / 2, ry, { width: W / 2 - 20 });
        ry += 22;
      });
      return startY + h + 14;
    };

    // Detalles
    y = drawCard('DETALLES DE LA TRANSACCION', [
      ['Numero de transaccion', transaccion.id_transaccion || '-'],
      ['Tipo de operacion',     transaccion.tipo_transaccion],
      ['Fecha y hora',          formatDate(transaccion.fecha_transaccion || transaccion.createdAt)],
      ['Estado',                'COMPLETADA'],
    ], y);

    // Cuenta Origen
    if (cuentaOrigen) {
      const rows = [
        ['Numero de cuenta', cuentaOrigen.no_cuenta || '-'],
        ['Tipo de cuenta',   cuentaOrigen.tipo_cuenta],
        ['Titular',          usuarioOrigen ? `${usuarioOrigen.Name} ${usuarioOrigen.Surname}` : '-'],
      ];
      if (saldoAnteriorOrigen !== null && saldoAnteriorOrigen !== undefined)
        rows.push(['Saldo anterior', `Q ${Number(saldoAnteriorOrigen).toFixed(2)}`]);
      rows.push(['Saldo actual', `Q ${Number(cuentaOrigen.saldo).toFixed(2)}`]);
      if (cuentaOrigen.alias) rows.push(['Alias', cuentaOrigen.alias]);
      y = drawCard('CUENTA DE ORIGEN', rows, y);
    }

    // Cuenta Destino
    if (cuentaDestino) {
      const rows = [
        ['Numero de cuenta', cuentaDestino.no_cuenta || '-'],
        ['Tipo de cuenta',   cuentaDestino.tipo_cuenta],
      ];
      if (saldoAnteriorDestino !== null && saldoAnteriorDestino !== undefined)
        rows.push(['Saldo anterior', `Q ${Number(saldoAnteriorDestino).toFixed(2)}`]);
      rows.push(['Saldo actual', `Q ${Number(cuentaDestino.saldo).toFixed(2)}`]);
      if (cuentaDestino.alias) rows.push(['Alias', cuentaDestino.alias]);
      y = drawCard('CUENTA DESTINATARIA', rows, y);
    }

    // Aviso
    doc.rect(50, y, W, 38).fill('#fff3cd').stroke('#ffc107');
    doc.font('Helvetica').fontSize(8).fillColor('#856404')
      .text('Comprobante oficial. Conservelo para sus registros. Si no reconoce esta transaccion comuniquese con atencion al cliente.', 58, y + 8, { width: W - 16 });

    // Pie
    doc.rect(0, H - 40, doc.page.width, 40).fill('#f1f3f5');
    doc.font('Helvetica').fontSize(8).fillColor(C_GRAY)
      .text('Banca Digital - Sistema de Gestion Bancaria  |  Documento generado automaticamente  |  Confidencial', 50, H - 26, { align: 'center', width: W });

    doc.end();
  });

// ─── CORREOS: CREAR transacción ───────────────────────────────────────────────
export const sendTransactionEmails = async (
  transaccion,
  cuentaOrigen,  saldoAnteriorOrigen,
  cuentaDestino, saldoAnteriorDestino
) => {
  if (!transporter) return;
  try {
    const [usuarioOrigen, usuarioDestino] = await Promise.all([
      cuentaOrigen  ? getUserEmail(cuentaOrigen.usuario_cuenta)  : Promise.resolve(null),
      cuentaDestino ? getUserEmail(cuentaDestino.usuario_cuenta) : Promise.resolve(null),
    ]);

    const tipo  = transaccion.tipo_transaccion;
    const monto = `Q ${Number(transaccion.monto).toFixed(2)}`;
    const trxId = transaccion.id_transaccion || String(transaccion._id);
    const fecha = formatDate(transaccion.fecha_transaccion || transaccion.createdAt);
    const from  = `${config.smtp.fromName} <${config.smtp.fromEmail}>`;

    // ── Correo ORIGEN + PDF ───────────────────────────────────────────────────
    if (cuentaOrigen && usuarioOrigen) {
      const pdf = await generateTransactionPDF(
        transaccion,
        cuentaOrigen,  saldoAnteriorOrigen,
        cuentaDestino, saldoAnteriorDestino,
        usuarioOrigen
      );

      const filaSaldoAnt = saldoAnteriorOrigen !== null
        ? `<tr><td style="padding:10px;color:#666;">Saldo anterior</td><td style="padding:10px;font-weight:bold;color:#888;">Q ${Number(saldoAnteriorOrigen).toFixed(2)}</td></tr>`
        : '';

      await transporter.sendMail({
        from, to: usuarioOrigen.Email,
        subject: `Confirmacion de ${tipo} - ${monto} | Ref: ${trxId}`,
        html: `<div style="background:#f4f4f4;padding:40px 20px;font-family:Arial,sans-serif;text-align:center;">
          <div style="max-width:520px;margin:0 auto;background:#fff;border-top:4px solid #004a99;border-radius:4px;padding:30px;">
            <h2 style="color:#333;margin-top:0;">Operacion Realizada</h2>
            <p style="color:#555;font-size:15px;">Estimado/a <strong>${usuarioOrigen.Name} ${usuarioOrigen.Surname}</strong>,<br>Se realizo la siguiente operacion desde su cuenta:</p>
            <table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:14px;text-align:left;">
              <tr style="background:#f0f5ff;"><td style="padding:10px;color:#666;">Tipo</td><td style="padding:10px;font-weight:bold;">${tipo}</td></tr>
              <tr><td style="padding:10px;color:#666;">Monto debitado</td><td style="padding:10px;font-weight:bold;color:#c0392b;">${monto}</td></tr>
              <tr style="background:#f0f5ff;"><td style="padding:10px;color:#666;">Cuenta origen</td><td style="padding:10px;font-weight:bold;">${cuentaOrigen.no_cuenta}</td></tr>
              <tr><td style="padding:10px;color:#666;">Cuenta destino</td><td style="padding:10px;font-weight:bold;">${cuentaDestino?.no_cuenta || '-'}</td></tr>
              ${filaSaldoAnt}
              <tr style="background:#f0f5ff;"><td style="padding:10px;color:#666;">Saldo actual</td><td style="padding:10px;font-weight:bold;color:#004a99;">Q ${Number(cuentaOrigen.saldo).toFixed(2)}</td></tr>
              <tr><td style="padding:10px;color:#666;">Fecha</td><td style="padding:10px;color:#333;">${fecha}</td></tr>
              <tr style="background:#f0f5ff;"><td style="padding:10px;color:#666;">Referencia</td><td style="padding:10px;color:#333;">${trxId}</td></tr>
            </table>
            <p style="color:#888;font-size:12px;border-top:1px solid #eee;padding-top:16px;">Se adjunta el comprobante oficial en PDF.</p>
          </div></div>`,
        attachments: [{ filename: `comprobante-${trxId}.pdf`, content: pdf, contentType: 'application/pdf' }],
      });
    }

    // ── Correo DESTINO ────────────────────────────────────────────────────────
    if (cuentaDestino && usuarioDestino) {
      const origenInfo = cuentaOrigen ? `desde la cuenta <strong>${cuentaOrigen.no_cuenta}</strong>` : 'mediante deposito externo';
      const filaSaldoAnt = saldoAnteriorDestino !== null
        ? `<tr><td style="padding:10px;color:#666;">Saldo anterior</td><td style="padding:10px;font-weight:bold;color:#888;">Q ${Number(saldoAnteriorDestino).toFixed(2)}</td></tr>`
        : '';

      await transporter.sendMail({
        from, to: usuarioDestino.Email,
        subject: `Deposito recibido - ${monto} | Ref: ${trxId}`,
        html: `<div style="background:#f4f4f4;padding:40px 20px;font-family:Arial,sans-serif;text-align:center;">
          <div style="max-width:520px;margin:0 auto;background:#fff;border-top:4px solid #28a745;border-radius:4px;padding:30px;">
            <h2 style="color:#333;margin-top:0;">Ha recibido un deposito!</h2>
            <p style="color:#555;font-size:15px;">Estimado/a <strong>${usuarioDestino.Name} ${usuarioDestino.Surname}</strong>,<br>Se acredito un monto en su cuenta ${origenInfo}.</p>
            <table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:14px;text-align:left;">
              <tr style="background:#f0fff4;"><td style="padding:10px;color:#666;">Monto acreditado</td><td style="padding:10px;font-weight:bold;color:#28a745;">${monto}</td></tr>
              <tr><td style="padding:10px;color:#666;">Cuenta destinataria</td><td style="padding:10px;font-weight:bold;">${cuentaDestino.no_cuenta}</td></tr>
              ${filaSaldoAnt}
              <tr style="background:#f0fff4;"><td style="padding:10px;color:#666;">Saldo actual</td><td style="padding:10px;font-weight:bold;color:#004a99;">Q ${Number(cuentaDestino.saldo).toFixed(2)}</td></tr>
              <tr><td style="padding:10px;color:#666;">Fecha</td><td style="padding:10px;color:#333;">${fecha}</td></tr>
              <tr style="background:#f0fff4;"><td style="padding:10px;color:#666;">Referencia</td><td style="padding:10px;color:#333;">${trxId}</td></tr>
            </table>
            <p style="color:#888;font-size:12px;border-top:1px solid #eee;padding-top:16px;">Mensaje automatico. No requiere accion.</p>
          </div></div>`,
      });
    }

  } catch (err) {
    console.error('Error enviando emails de transaccion:', err.message);
  }
};

// ─── CORREOS: CANCELAR transacción ───────────────────────────────────────────
export const sendCancellationEmails = async (
  transaccion,
  cuentaOrigen,  saldoAnteriorOrigen,
  cuentaDestino, saldoAnteriorDestino
) => {
  if (!transporter) return;
  try {
    console.log('[cancelacion] usuario_cuenta origen:', cuentaOrigen?.usuario_cuenta ?? 'null');
    console.log('[cancelacion] usuario_cuenta destino:', cuentaDestino?.usuario_cuenta ?? 'null');

    const [usuarioOrigen, usuarioDestino] = await Promise.all([
      cuentaOrigen  ? getUserEmail(cuentaOrigen.usuario_cuenta)  : Promise.resolve(null),
      cuentaDestino ? getUserEmail(cuentaDestino.usuario_cuenta) : Promise.resolve(null),
    ]);

    console.log('[cancelacion] email origen:', usuarioOrigen?.Email ?? 'null');
    console.log('[cancelacion] email destino:', usuarioDestino?.Email ?? 'null');

    const tipo  = transaccion.tipo_transaccion;
    const monto = `Q ${Number(transaccion.monto).toFixed(2)}`;
    const trxId = transaccion.id_transaccion || String(transaccion._id);
    const fecha = formatDate(transaccion.fecha_transaccion || transaccion.createdAt);
    const from  = `${config.smtp.fromName} <${config.smtp.fromEmail}>`;

    // Pre-construir filas seguras (sin null access en template)
    const filaOrigen  = cuentaOrigen
      ? `<tr style="background:#fff5f5;"><td style="padding:10px;color:#666;">Cuenta origen</td><td style="padding:10px;font-weight:bold;">${cuentaOrigen.no_cuenta}</td></tr>`
      : '';
    const filaDestino = cuentaDestino
      ? `<tr><td style="padding:10px;color:#666;">Cuenta destino</td><td style="padding:10px;font-weight:bold;">${cuentaDestino.no_cuenta}</td></tr>`
      : '';

    const buildHtml = (nombre, filaSaldoAnt, saldoActual) => `
      <div style="background:#f4f4f4;padding:40px 20px;font-family:Arial,sans-serif;text-align:center;">
        <div style="max-width:520px;margin:0 auto;background:#fff;border-top:4px solid #c0392b;border-radius:4px;padding:30px;">
          <h2 style="color:#c0392b;margin-top:0;">Transaccion Cancelada</h2>
          <p style="color:#555;font-size:15px;">Estimado/a <strong>${nombre}</strong>,<br>La siguiente transaccion fue <strong>cancelada</strong> y el saldo reintegrado.</p>
          <table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:14px;text-align:left;">
            <tr style="background:#fff5f5;"><td style="padding:10px;color:#666;">Tipo</td><td style="padding:10px;font-weight:bold;">${tipo}</td></tr>
            <tr><td style="padding:10px;color:#666;">Monto cancelado</td><td style="padding:10px;font-weight:bold;color:#c0392b;">${monto}</td></tr>
            ${filaOrigen}
            ${filaDestino}
            ${filaSaldoAnt}
            <tr style="background:#fff5f5;"><td style="padding:10px;color:#666;">Saldo actual</td><td style="padding:10px;font-weight:bold;color:#004a99;">${saldoActual}</td></tr>
            <tr><td style="padding:10px;color:#666;">Fecha</td><td style="padding:10px;color:#333;">${fecha}</td></tr>
            <tr style="background:#fff5f5;"><td style="padding:10px;color:#666;">Referencia</td><td style="padding:10px;color:#333;">${trxId}</td></tr>
          </table>
          <div style="background:#fff3cd;border:1px solid #ffc107;border-radius:4px;padding:14px;text-align:left;margin-bottom:16px;">
            <p style="color:#856404;font-size:13px;margin:0;"><strong>No reconoce esta cancelacion?</strong><br>Comuniquese con atencion al cliente.</p>
          </div>
          <p style="color:#888;font-size:12px;border-top:1px solid #eee;padding-top:16px;">Mensaje automatico. No requiere accion.</p>
        </div>
      </div>`;

    const envios = [];

    if (cuentaOrigen && usuarioOrigen) {
      const filaSaldoAnt = saldoAnteriorOrigen !== null
        ? `<tr><td style="padding:10px;color:#666;">Saldo anterior</td><td style="padding:10px;font-weight:bold;color:#888;">Q ${Number(saldoAnteriorOrigen).toFixed(2)}</td></tr>`
        : '';
      envios.push(transporter.sendMail({
        from, to: usuarioOrigen.Email,
        subject: `Cancelacion de ${tipo} - ${monto} | Ref: ${trxId}`,
        html: buildHtml(
          `${usuarioOrigen.Name} ${usuarioOrigen.Surname}`,
          filaSaldoAnt,
          `Q ${Number(cuentaOrigen.saldo).toFixed(2)}`
        ),
      }));
    }

    if (cuentaDestino && usuarioDestino) {
      const filaSaldoAnt = saldoAnteriorDestino !== null
        ? `<tr><td style="padding:10px;color:#666;">Saldo anterior</td><td style="padding:10px;font-weight:bold;color:#888;">Q ${Number(saldoAnteriorDestino).toFixed(2)}</td></tr>`
        : '';
      envios.push(transporter.sendMail({
        from, to: usuarioDestino.Email,
        subject: `Notificacion de cancelacion - ${monto} | Ref: ${trxId}`,
        html: buildHtml(
          `${usuarioDestino.Name} ${usuarioDestino.Surname}`,
          filaSaldoAnt,
          `Q ${Number(cuentaDestino.saldo).toFixed(2)}`
        ),
      }));
    }

    if (envios.length === 0) {
      console.warn('[cancelacion] No se encontraron usuarios para notificar.');
      return;
    }

    await Promise.all(envios);
    console.log(`[cancelacion] ${envios.length} correo(s) enviado(s).`);

  } catch (err) {
    console.error('Error enviando emails de cancelacion:', err.message);
  }
};