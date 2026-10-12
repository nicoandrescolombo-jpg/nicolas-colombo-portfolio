import { Resend } from 'resend'

interface SendInquiryEmailParams {
  name: string
  clientEmail: string
  message: string
  toEmail?: string
}

export async function sendInquiryNotification({
  name,
  clientEmail,
  message,
  toEmail = 'nicoandres.colombo@gmail.com',
}: SendInquiryEmailParams) {
  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey) {
    console.warn('RESEND_API_KEY no configurada. Mensaje guardado en base de datos.')
    return { success: false, reason: 'NO_API_KEY' }
  }

  try {
    const resend = new Resend(apiKey)

    const response = await resend.emails.send({
      from: 'Portfolio Nicolas Colombo <onboarding@resend.dev>',
      to: [toEmail],
      replyTo: clientEmail,
      subject: `🎯 Nuevo contacto en portfolio: ${name}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #0A0A0A; color: #F5F5F5; border-radius: 8px; border: 1px solid #222222;">
          <h2 style="color: #E8FF59; font-size: 24px; margin-top: 0; font-weight: 600;">Nuevo mensaje de cliente</h2>
          <p style="color: #999999; font-size: 14px; margin-bottom: 24px;">Alguien completó el formulario de contacto en tu sitio web.</p>
          
          <div style="background-color: #141414; padding: 18px; border-radius: 6px; border: 1px solid #282828; margin-bottom: 20px;">
            <p style="margin: 0 0 10px 0; font-size: 14px;"><strong>Remitente:</strong> <span style="color: #F5F5F5;">${name}</span></p>
            <p style="margin: 0; font-size: 14px;"><strong>Email:</strong> <a href="mailto:${clientEmail}" style="color: #E8FF59; text-decoration: none;">${clientEmail}</a></p>
          </div>

          <div style="background-color: #141414; padding: 18px; border-radius: 6px; border: 1px solid #282828;">
            <p style="margin: 0 0 8px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #777777;">Mensaje:</p>
            <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #E0E0E0; white-space: pre-wrap;">${message}</p>
          </div>

          <p style="font-size: 12px; color: #555555; margin-top: 30px; text-align: center;">
            Puedes responder directamente a este correo haciendo clic en "Responder" para contactar a ${clientEmail}.
          </p>
        </div>
      `,
    })

    return { success: true, response }
  } catch (error: any) {
    console.error('Error enviando correo con Resend:', error)
    return { success: false, error: error.message }
  }
}
