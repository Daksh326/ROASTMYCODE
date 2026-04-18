export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const body = req.body;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20240620", // ✅ stable model
        max_tokens: body.max_tokens || 1000,
        system: body.system,
        messages: body.messages,
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    // 🔥 CRITICAL: handle API errors properly
    if (!response.ok) {
      console.error("Anthropic error:", data);
      return res.status(500).json({
        error: data.error?.message || "Anthropic API failed",
        raw: data,
      });
    }

    res.status(200).json(data);

  } catch (err) {
    console.error("Server crash:", err);
    res.status(500).json({ error: err.message });
  }
}
