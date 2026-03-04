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
    doc.font('Helvetica-Bold').fontSize(22).fillColor('#fff').text('BANCA DIGITAL', 50, 20);
    doc.font('Helvetica').fontSize(10).fillColor('#cce4ff').text('Comprobante Oficial de Transaccion', 50, 48);
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

const generateTransactionHistoryPDF = (transacciones, cuenta, usuario) =>
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

    // Encabezado
    doc.rect(0, 0, doc.page.width, 90).fill(C_PRIMARY);
    doc.font('Helvetica-Bold').fontSize(22).fillColor('#fff').text('BANCA DIGITAL', 50, 20);
    doc.font('Helvetica').fontSize(10).fillColor('#cce4ff').text('Estado de Cuenta - Historial de Transacciones', 50, 48);
    doc.fontSize(9).fillColor('#cce4ff').text(`Generado: ${formatDate(new Date())}`, 50, 63);
    doc.font('Helvetica-Bold').fontSize(9).fillColor('#fff')
      .text(`Cuenta: ${cuenta.no_cuenta}`, 50, 20, { align: 'right', width: W });

    // Banda
    doc.rect(0, 90, doc.page.width, 32).fill('#003580');
    doc.font('Helvetica-Bold').fontSize(11).fillColor('#fff')
      .text('  ULTIMAS 5 TRANSACCIONES', 50, 101, { width: W });

    let y = 142;

    // Info de la cuenta
    doc.rect(50, y, W, 60).fill('#f0f5ff').stroke(C_BORDER);
    doc.font('Helvetica-Bold').fontSize(10).fillColor(C_PRIMARY)
      .text(`${usuario.Name} ${usuario.Surname}`, 62, y + 10);
    doc.font('Helvetica').fontSize(9).fillColor(C_GRAY)
      .text(`Cuenta ${cuenta.tipo_cuenta}  |  N ${cuenta.no_cuenta}  |  Saldo actual: Q ${Number(cuenta.saldo).toFixed(2)}`, 62, y + 30);
    y += 74;

    if (transacciones.length === 0) {
      doc.font('Helvetica').fontSize(11).fillColor(C_GRAY)
        .text('No se encontraron transacciones para esta cuenta.', 50, y, { align: 'center', width: W });
    } else {
      // Encabezado tabla
      const colX  = [50, 130, 220, 310, 390, 460];
      const colW  = [75, 85,  85,  75,  65,  W - 415];
      const heads = ['Referencia', 'Fecha', 'Tipo', 'Monto', 'Origen', 'Destino'];

      doc.rect(50, y, W, 24).fill(C_PRIMARY);
      heads.forEach((h, i) => {
        doc.font('Helvetica-Bold').fontSize(8).fillColor('#fff')
          .text(h, colX[i] + 4, y + 7, { width: colW[i] });
      });
      y += 24;

      transacciones.forEach((t, idx) => {
        const bg = idx % 2 === 0 ? '#ffffff' : '#f0f5ff';
        doc.rect(50, y, W, 26).fill(bg).stroke(C_BORDER);

        const esSalida = t.cuenta_origen &&
          t.cuenta_origen._id?.toString() === cuenta._id.toString();

        const montoStr  = `Q ${Number(t.monto).toFixed(2)}`;
        const origenNo  = t.cuenta_origen?.no_cuenta  || 'Externo';
        const destinoNo = t.cuenta_destinatoria?.no_cuenta || '-';

        const row = [
          t.id_transaccion || String(t._id).slice(-6).toUpperCase(),
          formatDate(t.fecha_transaccion || t.createdAt).slice(0, 16),
          t.tipo_transaccion,
          montoStr,
          origenNo,
          destinoNo,
        ];

        row.forEach((val, i) => {
          const color = i === 3
            ? (esSalida ? '#c0392b' : '#28a745')
            : C_DARK;
          doc.font('Helvetica').fontSize(8).fillColor(color)
            .text(val, colX[i] + 4, y + 8, { width: colW[i] - 4 });
        });
        y += 26;
      });

      // Totales
      const totalEnviado  = transacciones
        .filter(t => t.cuenta_origen?._id?.toString() === cuenta._id.toString())
        .reduce((acc, t) => acc + Number(t.monto), 0);
      const totalRecibido = transacciones
        .filter(t => t.cuenta_destinatoria?._id?.toString() === cuenta._id.toString())
        .reduce((acc, t) => acc + Number(t.monto), 0);

      y += 10;
      doc.rect(50, y, W / 2 - 5, 28).fill('#fdf2f2');
      doc.font('Helvetica-Bold').fontSize(9).fillColor('#c0392b')
        .text(`Total enviado: Q ${totalEnviado.toFixed(2)}`, 62, y + 8);

      doc.rect(50 + W / 2 + 5, y, W / 2 - 5, 28).fill('#f0fff4');
      doc.font('Helvetica-Bold').fontSize(9).fillColor('#28a745')
        .text(`Total recibido: Q ${totalRecibido.toFixed(2)}`, 62 + W / 2 + 5, y + 8);
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

export const sendTransactionHistoryEmail = async (transacciones, cuenta) => {
  if (!transporter) return;
  try {
    const usuario = await getUserEmail(cuenta.usuario_cuenta);
    if (!usuario) {
      console.warn('[transaction-email] No se encontro usuario para historial.');
      return;
    }

    const from  = `${config.smtp.fromName} <${config.smtp.fromEmail}>`;
    const fecha = formatDate(new Date());
    const pdf   = await generateTransactionHistoryPDF(transacciones, cuenta, usuario);

    const filas = transacciones.length > 0
      ? transacciones.map((t, i) => {
          const esSalida = t.cuenta_origen?._id?.toString() === cuenta._id.toString();
          const color    = esSalida ? '#c0392b' : '#28a745';
          return `
            <tr style="background:${i % 2 === 0 ? '#fff' : '#f0f5ff'};">
              <td style="padding:8px;color:#333;">${t.id_transaccion || String(t._id).slice(-6).toUpperCase()}</td>
              <td style="padding:8px;color:#555;">${formatDate(t.fecha_transaccion || t.createdAt)}</td>
              <td style="padding:8px;color:#333;">${t.tipo_transaccion}</td>
              <td style="padding:8px;font-weight:bold;color:${color};">Q ${Number(t.monto).toFixed(2)}</td>
              <td style="padding:8px;color:#666;">${t.cuenta_origen?.no_cuenta || 'Externo'}</td>
              <td style="padding:8px;color:#666;">${t.cuenta_destinatoria?.no_cuenta || '-'}</td>
            </tr>`;
        }).join('')
      : `<tr><td colspan="6" style="padding:16px;text-align:center;color:#888;">No hay transacciones registradas.</td></tr>`;

    await transporter.sendMail({
      from,
      to:      usuario.Email,
      subject: `Historial de Transacciones - Cuenta ${cuenta.no_cuenta} | ${fecha}`,
      html: `
        <div style="background:#f4f4f4;padding:40px 20px;font-family:Arial,sans-serif;text-align:center;">
          <div style="max-width:650px;margin:0 auto;background:#fff;border-top:4px solid #004a99;border-radius:4px;padding:30px;">
            <h2 style="color:#004a99;margin-top:0;">Historial de Transacciones</h2>
            <p style="color:#555;font-size:15px;">
              Estimado/a <strong>${usuario.Name} ${usuario.Surname}</strong>,<br>
              A continuacion sus ultimas 5 transacciones.
            </p>
            <p style="color:#666;font-size:13px;text-align:left;">
              Cuenta: <strong>${cuenta.no_cuenta}</strong> &nbsp;|&nbsp;
              Tipo: <strong>${cuenta.tipo_cuenta}</strong> &nbsp;|&nbsp;
              Saldo actual: <strong style="color:#004a99;">Q ${Number(cuenta.saldo).toFixed(2)}</strong>
            </p>
            <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:12px;text-align:left;">
              <thead>
                <tr style="background:#004a99;color:#fff;">
                  <th style="padding:10px;">Referencia</th>
                  <th style="padding:10px;">Fecha</th>
                  <th style="padding:10px;">Tipo</th>
                  <th style="padding:10px;">Monto</th>
                  <th style="padding:10px;">Origen</th>
                  <th style="padding:10px;">Destino</th>
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
      attachments: [{ filename: `historial-transacciones-${cuenta.no_cuenta}.pdf`, content: pdf, contentType: 'application/pdf' }],
    });

    console.log(`[transaction-email] Historial enviado a ${usuario.Email}`);
  } catch (err) {
    console.error('Error enviando historial de transacciones:', err.message);
  }
};