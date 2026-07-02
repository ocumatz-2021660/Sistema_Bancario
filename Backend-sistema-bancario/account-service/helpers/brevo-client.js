import { config } from '../configs/config.js';

export const sendBrevoEmail = async ({ to, subject, html, attachments }) => {
  if (!config.brevo?.apiKey) {
    console.warn('Brevo API key not configured. Email not sent.');
    return;
  }

  try {
    const payload = {
      sender: {
        email: config.brevo.senderEmail,
        name: config.brevo.senderName,
      },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    };

    if (attachments && attachments.length > 0) {
      payload.attachment = attachments.map((att) => ({
        name: att.filename,
        content: att.content instanceof Buffer
          ? att.content.toString('base64')
          : att.content,
      }));
    }

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': config.brevo.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Brevo API error (${response.status}): ${errorBody}`);
    }
  } catch (err) {
    console.error('Error sending email via Brevo:', err.message);
  }
};
