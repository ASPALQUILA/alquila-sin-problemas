const BREVO_API_KEY = process.env.BREVO_API_KEY;
const LIST_ID = 3;
const NOTIFY_EMAIL = 'alquilasinproblemas@gmail.com';
const SENDER_EMAIL = 'hola@alquilasinproblemas.com';
const SENDER_NAME = 'Alquila Sin Problemas';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { NOMBRE, SMS__COUNTRY_CODE, SMS, EMAIL, DIRECCION, M2, HABITACIONES, BANOS, COMENTARIOS } = req.body;
  const telefono = `${SMS__COUNTRY_CODE || '+34'}${SMS || ''}`;

  try {
    // 1. Guardar contacto en Brevo lista ASP WEB
    await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: { 'api-key': BREVO_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: EMAIL,
        listIds: [LIST_ID],
        updateEnabled: true,
        attributes: { NOMBRE, SMS: telefono, DIRECCION, M2, HABITACIONES, BANOS, COMENTARIOS: COMENTARIOS || '' }
      })
    });

    // 2. Enviar email de notificación
    await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': BREVO_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender: { name: SENDER_NAME, email: SENDER_EMAIL },
        to: [{ email: NOTIFY_EMAIL }],
        subject: '🏠 NUEVO LEAD WEB',
        htmlContent: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #ddd;border-radius:8px;overflow:hidden">
            <div style="background:#225053;padding:20px;text-align:center">
              <h2 style="color:white;margin:0">🏠 NUEVO LEAD WEB</h2>
              <p style="color:#1daaac;margin:4px 0 0">Alquila Sin Problemas</p>
            </div>
            <div style="padding:24px">
              <table style="width:100%;border-collapse:collapse">
                <tr><td style="padding:10px;background:#f7fafa;font-weight:700;color:#225053;width:160px;border-radius:4px">Nombre</td><td style="padding:10px">${NOMBRE || '-'}</td></tr>
                <tr><td style="padding:10px;font-weight:700;color:#225053">Teléfono</td><td style="padding:10px">${telefono || '-'}</td></tr>
                <tr><td style="padding:10px;background:#f7fafa;font-weight:700;color:#225053">Email</td><td style="padding:10px">${EMAIL || '-'}</td></tr>
                <tr><td style="padding:10px;font-weight:700;color:#225053">Dirección</td><td style="padding:10px">${DIRECCION || '-'}</td></tr>
                <tr><td style="padding:10px;background:#f7fafa;font-weight:700;color:#225053">M2 útiles</td><td style="padding:10px">${M2 || '-'}</td></tr>
                <tr><td style="padding:10px;font-weight:700;color:#225053">Habitaciones</td><td style="padding:10px">${HABITACIONES || '-'}</td></tr>
                <tr><td style="padding:10px;background:#f7fafa;font-weight:700;color:#225053">Baños</td><td style="padding:10px">${BANOS || '-'}</td></tr>
                <tr><td style="padding:10px;font-weight:700;color:#225053">Comentarios</td><td style="padding:10px">${COMENTARIOS || '-'}</td></tr>
              </table>
            </div>
            <div style="background:#f7fafa;padding:16px;text-align:center;font-size:12px;color:#888">
              Lead recibido desde la landing principal · alquilasinproblemas.com
            </div>
          </div>
        `
      })
    });
  } catch (e) {
    console.error('Error:', e);
  }

  res.redirect(302, '/gracias.html');
}
