const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' },
  });
}

async function safetyId(req: Request) {
  const source = req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for') || 'anonymous';
  const bytes = new TextEncoder().encode(`retina-lab:${source.split(',')[0].trim()}`);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest)).map(v => v.toString(16).padStart(2, '0')).join('').slice(0, 48);
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Método não permitido.' }, 405);

  const apiKey = Deno.env.get('OPENAI_API_KEY');
  const model = Deno.env.get('OPENAI_MODEL') || 'gpt-5.6-luna';
  if (!apiKey) return json({ error: 'OPENAI_API_KEY não configurada.' }, 503);

  let body: any;
  try { body = await req.json(); } catch { return json({ error: 'JSON inválido.' }, 400); }

  const question = String(body.question || '').slice(0, 900);
  const answer = String(body.answer || '').slice(0, 1800);
  const reference = String(body.reference || '').slice(0, 1600);
  const requiredConcepts = Array.isArray(body.requiredConcepts) ? body.requiredConcepts.map(String).slice(0, 10) : [];
  if (!question || !answer) return json({ error: 'Pergunta e resposta são obrigatórias.' }, 400);

  const schema = {
    type: 'object',
    properties: {
      score: { type: 'number', minimum: 0, maximum: 10 },
      correct: { type: 'boolean' },
      feedback: { type: 'string', maxLength: 420 },
      strengths: { type: 'array', items: { type: 'string' }, maxItems: 6 },
      missing: { type: 'array', items: { type: 'string' }, maxItems: 6 },
      mode: { type: 'string', enum: ['ai'] },
    },
    required: ['score', 'correct', 'feedback', 'strengths', 'missing', 'mode'],
    additionalProperties: false,
  };

  const prompt = `Avalie uma resposta escolar de Ensino Médio em português do Brasil.
Use SOMENTE a pergunta, a resposta de referência e os conceitos esperados abaixo.
Não exija palavras idênticas: aceite paráfrases corretas.
Se houver um pequeno erro, reduza a nota proporcionalmente em vez de zerar.
O feedback deve ser curto, didático e respeitoso. Não dê diagnóstico médico.

PERGUNTA: ${question}
RESPOSTA DE REFERÊNCIA: ${reference}
CONCEITOS ESPERADOS: ${requiredConcepts.join(' | ')}
RESPOSTA DO ALUNO: ${answer}`;

  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        store: false,
        safety_identifier: await safetyId(req),
        reasoning: { effort: 'low' },
        input: [
          { role: 'system', content: 'Você é um avaliador escolar. Julgue apenas a qualidade conceitual da resposta e retorne o JSON solicitado.' },
          { role: 'user', content: prompt },
        ],
        text: {
          format: {
            type: 'json_schema',
            name: 'retina_exam_grade',
            strict: true,
            schema,
          },
        },
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error('OpenAI error:', response.status, detail.slice(0, 800));
      return json({ error: 'Avaliador de IA indisponível no momento.' }, 502);
    }

    const data = await response.json();
    const outputText = (data.output || [])
      .filter((item: any) => item.type === 'message')
      .flatMap((item: any) => item.content || [])
      .find((content: any) => content.type === 'output_text')?.text;

    if (!outputText) return json({ error: 'Resposta vazia do avaliador.' }, 502);
    const grade = JSON.parse(outputText);
    grade.mode = 'ai';
    return json(grade);
  } catch (error) {
    console.error(error);
    return json({ error: 'Erro interno no avaliador.' }, 500);
  }
});
