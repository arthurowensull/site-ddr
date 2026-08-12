import { CONFIG, hasSupabase } from './config.js';
function normalize(text) { return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim(); }
export function localGrade(question, answer) {
    const clean = normalize(answer);
    const concepts = question.requiredConcepts || question.keywords || [];
    const hits = concepts.filter(concept => {
        const words = normalize(concept).split(' ').filter(w => w.length > 3);
        return words.some(word => clean.includes(word));
    });
    const ratio = concepts.length ? hits.length / concepts.length : 0;
    const score = Math.round(Math.min(10, Math.max(0, ratio * 10)));
    return {
        score,
        correct: score >= 7,
        feedback: score >= 7 ? 'Sua resposta contém a maior parte dos conceitos esperados.' : 'A ideia está a caminho, mas faltam conceitos importantes da resposta esperada.',
        strengths: hits,
        missing: concepts.filter(c => !hits.includes(c)),
        mode: 'local'
    };
}
export async function gradeLongAnswer(question, answer) {
    if (!hasSupabase)
        return localGrade(question, answer);
    try {
        const endpoint = `${CONFIG.supabaseUrl}/functions/v1/${CONFIG.evaluateFunction}`;
        const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', 'apikey': CONFIG.supabasePublishableKey, 'Authorization': `Bearer ${CONFIG.supabasePublishableKey}` }, body: JSON.stringify({ questionId: question.id, question: question.title, answer, reference: question.reference, requiredConcepts: question.requiredConcepts, points: question.points }) });
        if (!response.ok)
            throw new Error('Falha ao chamar avaliador');
        return await response.json();
    }
    catch (error) {
        console.warn('Avaliador remoto indisponível; usando correção local.', error);
        return localGrade(question, answer);
    }
}
export async function loadQuestions() {
    if (hasSupabase) {
        try {
            const response = await fetch(`${CONFIG.supabaseUrl}/rest/v1/questions?select=payload&active=eq.true&order=position.asc`, { headers: { apikey: CONFIG.supabasePublishableKey, Authorization: `Bearer ${CONFIG.supabasePublishableKey}` } });
            if (response.ok) {
                const rows = await response.json();
                if (rows.length)
                    return rows.map(r => r.payload);
            }
        }
        catch (error) {
            console.warn('Banco indisponível; usando perguntas locais.', error);
        }
    }
    const response = await fetch('assets/data/questions.json');
    return await response.json();
}
export async function saveAttempt(score, answers) {
    if (!hasSupabase)
        return;
    try {
        await fetch(`${CONFIG.supabaseUrl}/rest/v1/exam_attempts`, { method: 'POST', headers: { 'Content-Type': 'application/json', Prefer: 'return=minimal', apikey: CONFIG.supabasePublishableKey, Authorization: `Bearer ${CONFIG.supabasePublishableKey}` }, body: JSON.stringify({ score, answers, user_agent: navigator.userAgent.slice(0, 180) }) });
    }
    catch (error) {
        console.warn('Não foi possível salvar tentativa.', error);
    }
}
