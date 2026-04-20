module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ ok: false, error: 'Method not allowed' });
    }

    const botToken = String(process.env.TELEGRAM_BOT_TOKEN || '').trim();
    const chatId = String(process.env.TELEGRAM_CHAT_ID || '').trim();

    if (!botToken || !chatId) {
        return res.status(500).json({ ok: false, error: 'Missing server configuration' });
    }

    let body = req.body || {};

    if (typeof body === 'string') {
        try {
            body = JSON.parse(body || '{}');
        } catch (error) {
            return res.status(400).json({ ok: false, error: 'Invalid JSON payload' });
        }
    }
    const name = String(body.name || '').trim();
    const email = String(body.email || '').trim();
    const message = String(body.message || '').trim();

    if (!name || !email || !message) {
        return res.status(400).json({ ok: false, error: 'Missing required fields' });
    }

    const telegramMessage = [
        'New message from deliba-art.com',
        '',
        'Name: ' + name,
        'Email: ' + email,
        'Message:',
        message
    ].join('\n');

    try {
        const telegramResponse = await fetch('https://api.telegram.org/bot' + botToken + '/sendMessage', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: telegramMessage
            })
        });

        const telegramResult = await telegramResponse.json();

        if (!telegramResponse.ok || !telegramResult.ok) {
            return res.status(502).json({ ok: false, error: 'Telegram delivery failed' });
        }

        return res.status(200).json({ ok: true });
    } catch (error) {
        return res.status(500).json({ ok: false, error: 'Unexpected server error' });
    }
};
