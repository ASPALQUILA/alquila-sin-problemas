import { parse } from 'querystring';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const body = await new Promise((resolve) => {
    let data = '';
    req.on('data', chunk => { data += chunk.toString(); });
    req.on('end', () => resolve(parse(data)));
  });

  const BREVO_API_KEY = process.env.BREVO_API_KEY;
  const { NOMBRE, SMS__COUNTRY_CODE, SMS, EMAIL, DIRECCION, M2, HABITACIONES, BANOS, COMENTARIOS } = body;
  if (!NOMBRE || !SMS || !EMAIL || !DIRECCION || !M2 || !HABITACIONES || !BANOS) {
  return res.redirect(302, '/index.html');
}

  try {
    const contactRes = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: { 'api-key': BREVO_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: EMAIL,
        listIds: [3],
        updateEnabled: true,
        attributes: { NOMBRE, SMS: telefono, DIRECCION, M2, HABITACIONES, BANOS, COMENTARIOS: COMENTARIOS || '' }
      })
    });
    console.log('Contact:', contactRes.status, await contactRes.text());

    const emailRes = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': BREVO_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender: { name: 'Alquila Sin Problemas', email: 'hola@alquilasinproblemas.com' },
        to: [{ email: 'alquilasinproblemas@gmail.com' }],
        subject: '🏠 NUEVO LEAD WEB',
        htmlContent: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #ddd;border-radius:8px;overflow:hidden"><div style="background:#225053;padding:20px;text-align:center"><h2 style="color:white;margin:0">🏠 NUEVO LEAD WEB</h2></div><div style="padding:24px"><table style="width:100%;border-collapse:collapse"><tr><td style="padding:10px;background:#f7fafa;font-weight:700;color:#225053;width:160px">Nombre</td><td style="padding:10px">${NOMBRE || '-'}</td></tr><tr><td style="padding:10px;font-weight:700;color:#225053">Teléfono</td><td style="padding:10px">${telefono || '-'}</td></tr><tr><td style="padding:10px;background:#f7fafa;font-weight:700;color:#225053">Email</td><td style="padding:10px">${EMAIL || '-'}</td></tr><tr><td style="padding:10px;font-weight:700;color:#225053">Dirección</td><td style="padding:10px">${DIRECCION || '-'}</td></tr><tr><td style="padding:10px;background:#f7fafa;font-weight:700;color:#225053">M2</td><td style="padding:10px">${M2 || '-'}</td></tr><tr><td style="padding:10px;font-weight:700;color:#225053">Habitaciones</td><td style="padding:10px">${HABITACIONES || '-'}</td></tr><tr><td style="padding:10px;background:#f7fafa;font-weight:700;color:#225053">Baños</td><td style="padding:10px">${BANOS || '-'}</td></tr><tr><td style="padding:10px;font-weight:700;color:#225053">Comentarios</td><td style="padding:10px">${COMENTARIOS || '-'}</td></tr></table></div></div>`
      })
    });
    console.log('Email:', emailRes.status, await emailRes.text());
  } catch (e) {
    console.error('Error:', e.message);
  }

  res.redirect(302, '/gracias.html');
}
