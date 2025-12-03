// api/chat.js – Your secure backend proxy
export const config = { runtime: 'edge' }; // Fast Edge runtime

export default async function handler(req) {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  
  const { message } = await req.json();
  
  // Use OpenAI (or swap to Groq below)
  const url = 'https://api.openai.com/v1/chat/completions';
  const key = process.env.OPENAI_API_KEY; // Hidden! From Vercel env vars
  const model = 'gpt-4o-mini'; // Cheap & fast
  
  // For Groq (faster/cheaper): Uncomment these 2 lines, comment the above
  // const url = 'https://api.groq.com/openai/v1/chat/completions';
  // const key = process.env.GROQ_API_KEY;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: message }],
        stream: true,
      }),
    });
    
    if (!response.ok) throw new Error(`OpenAI error: ${response.statusText}`);
    
    // Stream the response back to frontend
    return new Response(response.body, {
      headers: { 'Content-Type': 'text/event-stream' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Chat service unavailable' }), { status: 500 });
  }
}