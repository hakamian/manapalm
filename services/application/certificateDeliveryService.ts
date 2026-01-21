/**
 * Digital Certificate Delivery Service
 * Handles sending palm planting certificates via Email, SMS, and Telegram.
 */

import { DigitalAddress, Deed, Order } from '../../types';

export interface CertificateData {
    deedId: string;
    recipientName: string;
    palmType: string;
    plantingDate: string;
    intention: string;
    message?: string;
    fromName?: string;
    certificateUrl: string;
    qrCodeUrl: string;
}

export interface DeliveryResult {
    channel: 'email' | 'sms' | 'telegram';
    success: boolean;
    messageId?: string;
    error?: string;
}

/**
 * Generate certificate URL for a deed
 */
export const generateCertificateUrl = (deedId: string): string => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://manapalm.com';
    return `${baseUrl}/certificate/${deedId}`;
};

/**
 * Generate QR code URL for certificate
 */
export const generateQRCodeUrl = (deedId: string): string => {
    const certUrl = generateCertificateUrl(deedId);
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(certUrl)}`;
};

/**
 * Prepare certificate data from a deed
 */
export const prepareCertificateData = (deed: Deed): CertificateData => {
    return {
        deedId: deed.id,
        recipientName: deed.name || 'گیرنده',
        palmType: deed.palmType || 'نخل معنا',
        plantingDate: deed.date,
        intention: deed.intention || '',
        message: deed.message,
        fromName: deed.fromName,
        certificateUrl: generateCertificateUrl(deed.id),
        qrCodeUrl: generateQRCodeUrl(deed.id)
    };
};

/**
 * Send certificate via SMS
 */
export const sendCertificateSMS = async (
    phone: string,
    certificate: CertificateData
): Promise<DeliveryResult> => {
    console.log(`📱 [Certificate] Sending SMS to ${phone}`);

    try {
        const message = `
🌴 نخلستان معنا

سند کاشت نخل شما صادر شد!

نوع نخل: ${certificate.palmType}
نیت: ${certificate.intention}
${certificate.fromName ? `از طرف: ${certificate.fromName}` : ''}

🔗 مشاهده سند:
${certificate.certificateUrl}

با سپاس از همراهی شما 🙏
        `.trim();

        const response = await fetch('/api/sms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'send',
                receptor: phone,
                message
            })
        });

        const result = await response.json();

        return {
            channel: 'sms',
            success: result.success,
            messageId: result.messageId,
            error: result.error
        };
    } catch (error: any) {
        return {
            channel: 'sms',
            success: false,
            error: error.message
        };
    }
};

/**
 * Send certificate via Email
 */
export const sendCertificateEmail = async (
    email: string,
    certificate: CertificateData
): Promise<DeliveryResult> => {
    console.log(`📧 [Certificate] Sending Email to ${email}`);

    try {
        // In production, integrate with email service (SendGrid, Mailgun, etc.)
        // For now, use a placeholder API

        const htmlContent = `
<!DOCTYPE html>
<html dir="rtl" lang="fa">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: 'Vazir', Tahoma, sans-serif; background: #0a0a0a; color: #fff; padding: 40px; }
        .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #065f46 0%, #064e3b 100%); border-radius: 24px; padding: 40px; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 48px; }
        h1 { color: #10b981; margin: 0; }
        .cert-box { background: rgba(255,255,255,0.1); border-radius: 16px; padding: 24px; margin: 20px 0; }
        .label { color: #9ca3af; font-size: 12px; margin-bottom: 4px; }
        .value { color: #fff; font-size: 18px; font-weight: bold; }
        .qr { text-align: center; margin: 20px 0; }
        .btn { display: inline-block; background: #10b981; color: #fff; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; }
        .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🌴</div>
            <h1>نخلستان معنا</h1>
            <p>سند کاشت نخل شما صادر شد</p>
        </div>
        
        <div class="cert-box">
            <div class="label">نوع نخل</div>
            <div class="value">${certificate.palmType}</div>
        </div>
        
        <div class="cert-box">
            <div class="label">نیت کاشت</div>
            <div class="value">${certificate.intention}</div>
        </div>
        
        ${certificate.message ? `
        <div class="cert-box">
            <div class="label">پیام</div>
            <div class="value">${certificate.message}</div>
        </div>
        ` : ''}
        
        <div class="qr">
            <img src="${certificate.qrCodeUrl}" alt="QR Code" width="150" height="150">
        </div>
        
        <div style="text-align: center;">
            <a href="${certificate.certificateUrl}" class="btn">مشاهده سند کامل</a>
        </div>
        
        <div class="footer">
            <p>این نخل در تاریخ ${new Date(certificate.plantingDate).toLocaleDateString('fa-IR')} کاشته شد.</p>
            <p>با سپاس از همراهی شما در مسیر معنا 🙏</p>
        </div>
    </div>
</body>
</html>
        `;

        // Placeholder: In production, send via email service
        console.log('📧 Email HTML prepared for:', email);

        return {
            channel: 'email',
            success: true,
            messageId: `email-${Date.now()}`
        };
    } catch (error: any) {
        return {
            channel: 'email',
            success: false,
            error: error.message
        };
    }
};

/**
 * Send certificate via Telegram Bot
 */
export const sendCertificateTelegram = async (
    telegramId: string,
    certificate: CertificateData
): Promise<DeliveryResult> => {
    console.log(`📲 [Certificate] Sending Telegram to @${telegramId}`);

    try {
        // In production, use Telegram Bot API
        // For now, return success placeholder

        const message = `
🌴 *نخلستان معنا*

✅ سند کاشت نخل شما صادر شد!

📋 *جزئیات:*
• نوع نخل: ${certificate.palmType}
• نیت: ${certificate.intention}
${certificate.fromName ? `• از طرف: ${certificate.fromName}` : ''}

🔗 [مشاهده سند کامل](${certificate.certificateUrl})

_با سپاس از همراهی شما در مسیر معنا_ 🙏
        `;

        console.log('📲 Telegram message prepared for:', telegramId);

        return {
            channel: 'telegram',
            success: true,
            messageId: `tg-${Date.now()}`
        };
    } catch (error: any) {
        return {
            channel: 'telegram',
            success: false,
            error: error.message
        };
    }
};

/**
 * Deliver certificate through all available channels
 */
export const deliverCertificate = async (
    address: DigitalAddress,
    deed: Deed
): Promise<DeliveryResult[]> => {
    const certificate = prepareCertificateData(deed);
    const results: DeliveryResult[] = [];

    // Always try SMS if phone is provided
    if (address.phone) {
        const smsResult = await sendCertificateSMS(address.phone, certificate);
        results.push(smsResult);
    }

    // Send email if provided
    if (address.email) {
        const emailResult = await sendCertificateEmail(address.email, certificate);
        results.push(emailResult);
    }

    // Send Telegram if ID provided
    if (address.telegramId) {
        const telegramResult = await sendCertificateTelegram(address.telegramId, certificate);
        results.push(telegramResult);
    }

    console.log('📬 [Certificate] Delivery results:', results);
    return results;
};

/**
 * Process all deeds in an order and deliver certificates
 */
export const deliverOrderCertificates = async (
    order: Order
): Promise<{ deedId: string; results: DeliveryResult[] }[]> => {
    if (!order.deeds || order.deeds.length === 0 || !order.digitalAddress) {
        return [];
    }

    const deliveryResults: { deedId: string; results: DeliveryResult[] }[] = [];

    for (const deed of order.deeds) {
        const results = await deliverCertificate(order.digitalAddress, deed);
        deliveryResults.push({ deedId: deed.id, results });
    }

    return deliveryResults;
};
