import { gradeLongAnswer, loadQuestions, saveAttempt } from './supabase.js';
function normalize(text) { return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim(); }
function escapeHtml(value) { return value.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] || c)); }
export async function initExam() {
    const questions = await loadQuestions();
    const start = document.querySelector('#examStart');
    const running = document.querySelector('#examRunning');
    const result = document.querySelector('#examResult');
    const area = document.querySelector('#examQuestionArea');
    const submit = document.querySelector('#submitAnswer');
    const next = document.querySelector('#nextQuestion');
    const feedback = document.querySelector('#examFeedback');
    const progressText = document.querySelector('#examProgressText');
    const progressBar = document.querySelector('#examProgressBar');
    const scoreEl = document.querySelector('#examScore');
    if (!start || !running || !result || !area || !submit || !next || !feedback)
        return;
    let index = 0, score = 0, checked = false, currentAnswer = null;
    const report = [];
    function updateTop() {
        if (progressText)
            progressText.textContent = `QUESTÃO ${String(index + 1).padStart(2, '0')} / ${String(questions.length).padStart(2, '0')}`;
        if (progressBar)
            progressBar.style.width = `${((index + 1) / questions.length) * 100}%`;
        if (scoreEl)
            scoreEl.textContent = String(score).padStart(3, '0');
    }
    function renderVisual() {
        return `<div class="visual-question"><svg class="visual-eye-svg" viewBox="0 0 700 380" aria-label="Corte esquemático do olho para identificação">
      <path d="M140 190C140 85 255 32 430 45c142 11 220 78 227 145-7 67-85 134-227 145-175 13-290-40-290-145Z" fill="#29112f" stroke="#9762a2" stroke-width="10"/>
      <path d="M140 126c-60 12-88 37-88 64s28 52 88 64c-22-38-22-90 0-128Z" fill="rgba(79,247,255,.2)" stroke="#4ff7ff" stroke-width="4"/>
      <ellipse cx="205" cy="190" rx="34" ry="67" fill="rgba(216,255,0,.08)" stroke="#d8ff00" stroke-width="4"/>
      <path d="M360 63c168-6 285 55 296 127-11 72-128 133-296 127" fill="none" stroke="#ff2dd1" stroke-width="8"/>
      <path d="M654 170c55 2 72 8 92 20-20 12-37 18-92 20" fill="#2d1633" stroke="#a78cb5" stroke-width="3"/>
      <path class="visual-zone" data-zone="cornea" d="M140 117c-72 9-105 37-105 73s33 64 105 73c-25-42-25-104 0-146Z"/>
      <ellipse class="visual-zone" data-zone="cristalino" cx="205" cy="190" rx="48" ry="82"/>
      <path class="visual-zone" data-zone="retina" d="M345 47c190-8 316 59 327 143-11 84-137 151-327 143l8-45c150 4 254-43 263-98-9-55-113-102-263-98Z"/>
      <path class="visual-zone" data-zone="nervo" d="M635 145c83 3 109 15 140 45-31 30-57 42-140 45Z"/>
      <text x="26" y="34" fill="#d8ff00" font-size="13" font-family="monospace">SELECIONE UMA REGIÃO</text>
    </svg></div>`;
    }
    function renderQuestion() {
        const q = questions[index];
        checked = false;
        currentAnswer = null;
        feedback.hidden = true;
        feedback.className = 'exam-feedback';
        next.hidden = true;
        submit.hidden = false;
        submit.disabled = false;
        submit.textContent = 'VERIFICAR RESPOSTA';
        updateTop();
        let input = '';
        if (q.type === 'choice')
            input = `<div class="answer-options">${(q.options || []).map((o, i) => `<button class="answer-option" data-choice="${i}"><b>${String.fromCharCode(65 + i)}</b>&nbsp;&nbsp;${escapeHtml(o)}</button>`).join('')}</div>`;
        if (q.type === 'short')
            input = `<input class="text-answer" id="textAnswer" type="text" maxlength="240" placeholder="${escapeHtml(q.placeholder || 'Digite sua resposta...')}" />`;
        if (q.type === 'long')
            input = `<textarea class="text-answer" id="textAnswer" maxlength="1500" placeholder="${escapeHtml(q.placeholder || 'Digite sua resposta...')}"></textarea><p class="question-hint">A correção considera conceitos, não exige que o texto seja idêntico à resposta de referência.</p>`;
        if (q.type === 'order')
            input = `<div class="order-board" id="orderBoard">${(q.items || []).map((o, i) => `<button class="order-chip" data-order="${i}" data-value="${escapeHtml(o)}">${escapeHtml(o)}</button>`).join('')}</div><p class="question-hint" id="orderPreview">Clique nos itens na ordem correta.</p>`;
        if (q.type === 'visual')
            input = renderVisual();
        if (q.type === 'match')
            input = `<div class="match-board">${(q.pairs || []).map((pair, i) => `<div class="match-row"><div class="match-label">${escapeHtml(pair.label)}</div><select class="match-select" data-match="${i}"><option value="">Selecione...</option>${(q.options || []).map(o => `<option>${escapeHtml(o)}</option>`).join('')}</select></div>`).join('')}</div>`;
        area.innerHTML = `<span class="question-kicker">${escapeHtml(q.category)} / ${q.type.toUpperCase()}</span><h3 class="question-title">${escapeHtml(q.title)}</h3>${q.hint ? `<p class="question-hint">${escapeHtml(q.hint)}</p>` : ''}${input}`;
        bindInputs(q);
    }
    function bindInputs(q) {
        if (q.type === 'choice')
            area.querySelectorAll('[data-choice]').forEach(button => button.addEventListener('click', () => { area.querySelectorAll('[data-choice]').forEach(b => b.classList.remove('selected')); button.classList.add('selected'); currentAnswer = Number(button.dataset.choice); }));
        if (q.type === 'short' || q.type === 'long')
            area.querySelector('#textAnswer')?.addEventListener('input', e => currentAnswer = e.target.value);
        if (q.type === 'visual')
            area.querySelectorAll('[data-zone]').forEach(zone => zone.addEventListener('click', () => { area.querySelectorAll('[data-zone]').forEach(z => z.classList.remove('selected')); zone.classList.add('selected'); currentAnswer = zone.dataset.zone; }));
        if (q.type === 'order') {
            const selected = [];
            const preview = area.querySelector('#orderPreview');
            area.querySelectorAll('[data-order]').forEach(button => button.addEventListener('click', () => {
                const value = button.dataset.value || '';
                if (button.classList.contains('selected')) {
                    const i = selected.indexOf(value);
                    if (i >= 0)
                        selected.splice(i, 1);
                    button.classList.remove('selected');
                }
                else {
                    selected.push(value);
                    button.classList.add('selected');
                }
                currentAnswer = [...selected];
                if (preview)
                    preview.textContent = selected.length ? selected.map((v, i) => `${i + 1}. ${v}`).join('  →  ') : 'Clique nos itens na ordem correta.';
            }));
        }
        if (q.type === 'match') {
            const values = (q.pairs || []).map(() => '');
            area.querySelectorAll('[data-match]').forEach(select => select.addEventListener('change', () => { values[Number(select.dataset.match)] = select.value; currentAnswer = [...values]; }));
        }
    }
    function showFeedback(correct, title, text) { feedback.hidden = false; feedback.classList.toggle('error', !correct); feedback.innerHTML = `<strong>${escapeHtml(title)}</strong>${escapeHtml(text)}`; }
    function arraysEqual(a, b) { return a.length === b.length && a.every((v, i) => v === b[i]); }
    async function evaluate() {
        if (checked)
            return;
        const q = questions[index];
        if (currentAnswer === null || currentAnswer === '' || (Array.isArray(currentAnswer) && currentAnswer.some(v => v === ''))) {
            showFeedback(false, 'RESPOSTA PENDENTE', 'Preencha ou selecione uma resposta antes de verificar.');
            return;
        }
        checked = true;
        submit.disabled = true;
        submit.textContent = q.type === 'long' ? 'ANALISANDO RESPOSTA...' : 'VERIFICANDO...';
        let earned = 0, correct = false, message = '';
        if (q.type === 'choice' || q.type === 'visual') {
            correct = currentAnswer === q.answer;
            earned = correct ? q.points : 0;
            message = correct ? 'Resposta correta. O conceito foi identificado.' : `Ainda não. Revise a seção ${q.category.toLowerCase()} do laboratório.`;
        }
        if (q.type === 'order') {
            correct = arraysEqual(currentAnswer, q.answer);
            earned = correct ? q.points : Math.round(q.points * (currentAnswer.filter((v, i) => v === q.answer[i]).length / q.answer.length));
            message = correct ? 'Sequência correta.' : 'Parte da sequência não está na posição esperada.';
        }
        if (q.type === 'match') {
            const expected = (q.pairs || []).map(p => p.answer);
            const hits = currentAnswer.filter((v, i) => v === expected[i]).length;
            earned = Math.round(q.points * (hits / expected.length));
            correct = hits === expected.length;
            message = correct ? 'As três áreas foram conectadas corretamente.' : `${hits} de ${expected.length} relações estão corretas.`;
        }
        if (q.type === 'short') {
            const clean = normalize(String(currentAnswer));
            const keys = q.keywords || [];
            correct = keys.some(k => clean.includes(normalize(k)));
            earned = correct ? q.points : 0;
            message = correct ? `Correto. Resposta de referência: ${q.answerText || ''}` : `A resposta esperada se aproxima de: ${q.answerText || 'reveja o conceito'}.`;
        }
        if (q.type === 'long') {
            const grade = await gradeLongAnswer(q, String(currentAnswer));
            earned = Math.round(q.points * (grade.score / 10));
            correct = grade.correct;
            const missing = grade.missing?.length ? ` Faltou mencionar: ${grade.missing.join(', ')}.` : '';
            message = `${grade.feedback}${missing} Correção: ${grade.mode === 'ai' ? 'IA' : 'rubrica local'}.`;
        }
        score += earned;
        report.push({ id: q.id, score: earned, category: q.category, answer: currentAnswer });
        if (scoreEl)
            scoreEl.textContent = String(score).padStart(3, '0');
        showFeedback(correct, `${correct ? 'APROVADO' : 'REVISAR'} · +${earned}/${q.points}`, message);
        submit.hidden = true;
        next.hidden = false;
        next.textContent = index === questions.length - 1 ? 'VER RELATÓRIO FINAL →' : 'PRÓXIMA QUESTÃO →';
    }
    async function finish() {
        running.hidden = true;
        result.hidden = false;
        const final = document.querySelector('#finalScore');
        const title = document.querySelector('#resultTitle');
        const text = document.querySelector('#resultText');
        const breakdown = document.querySelector('#resultBreakdown');
        if (final)
            final.textContent = String(score);
        if (title)
            title.textContent = score >= 80 ? 'PROTOCOLO DOMINADO' : score >= 60 ? 'PROTOCOLO CONCLUÍDO' : 'PROTOCOLO PRECISA DE REVISÃO';
        if (text)
            text.textContent = score >= 80 ? 'Você conectou anatomia, óptica, robótica e programação com consistência.' : score >= 60 ? 'Boa base. Use o relatório para revisar os pontos que ficaram para trás.' : 'Revisite os laboratórios e tente novamente depois de explorar as interações.';
        if (breakdown) {
            const groups = new Map();
            questions.forEach(q => { const g = groups.get(q.category) || { sum: 0, max: 0 }; g.max += q.points; g.sum += report.find(r => r.id === q.id)?.score || 0; groups.set(q.category, g); });
            breakdown.innerHTML = [...groups.entries()].map(([k, v]) => `<span>${escapeHtml(k)} ${v.sum}/${v.max}</span>`).join('');
        }
        await saveAttempt(score, report);
    }
    document.querySelector('#startExam')?.addEventListener('click', () => { start.hidden = true; running.hidden = false; result.hidden = true; index = 0; score = 0; report.length = 0; renderQuestion(); });
    submit.addEventListener('click', () => void evaluate());
    next.addEventListener('click', () => { if (index >= questions.length - 1) {
        void finish();
        return;
    } index++; renderQuestion(); });
    document.querySelector('#restartExam')?.addEventListener('click', () => { result.hidden = true; start.hidden = false; index = 0; score = 0; report.length = 0; });
}
