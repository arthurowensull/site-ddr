const anatomyInfo = {
    cornea: { title: 'Córnea', text: 'Primeira superfície transparente do olho. Participa fortemente da refração da luz que entra no sistema óptico.', role: 'ÓPTICA', signal: 'ENTRADA', scanner: 13 },
    cristalino: { title: 'Cristalino', text: 'Lente natural flexível que ajuda a ajustar o foco, alterando sua curvatura durante a acomodação.', role: 'FOCO', signal: 'AJUSTE', scanner: 28 },
    retina: { title: 'Retina', text: 'Tecido sensível à luz na parte posterior do olho. Seus fotorreceptores iniciam a conversão da luz em sinais nervosos.', role: 'SENSORIAL', signal: 'CONVERSÃO', scanner: 73 },
    macula: { title: 'Mácula', text: 'Região especializada da retina ligada à visão central de maior detalhe. No esquema, aparece próxima ao polo posterior.', role: 'DETALHE', signal: 'CENTRAL', scanner: 84 },
    nervo: { title: 'Nervo óptico', text: 'Conjunto de fibras que conduz informações da retina em direção ao cérebro.', role: 'TRANSMISSÃO', signal: 'SAÍDA', scanner: 94 }
};
export function initHeroEye() {
    const stage = document.querySelector('#heroEyeStage');
    const iris = document.querySelector('#heroIris');
    const pupil = document.querySelector('#heroPupil');
    const xRead = document.querySelector('#coordX');
    const yRead = document.querySelector('#coordY');
    if (!stage || !iris || !pupil)
        return;
    stage.addEventListener('pointermove', (event) => {
        const rect = stage.getBoundingClientRect();
        const nx = (event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
        const ny = (event.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
        const x = Math.max(-1, Math.min(1, nx));
        const y = Math.max(-1, Math.min(1, ny));
        iris.style.transform = `translate(${x * 18}px, ${y * 12}px)`;
        pupil.style.transform = `translate(${x * 11}px, ${y * 8}px)`;
        if (xRead)
            xRead.textContent = String(Math.round((x + 1) * 50)).padStart(3, '0');
        if (yRead)
            yRead.textContent = String(Math.round((y + 1) * 50)).padStart(3, '0');
    });
    stage.addEventListener('pointerleave', () => {
        iris.style.transform = 'translate(0,0)';
        pupil.style.transform = 'translate(0,0)';
    });
    const note = document.querySelector('#heroAnatomyNote');
    document.querySelectorAll('.anatomy-tag').forEach(button => {
        button.addEventListener('mouseenter', () => {
            const target = button.dataset.anatomy;
            const info = anatomyInfo[target];
            if (note && info)
                note.innerHTML = `<strong>${info.title}</strong> — ${info.text}`;
        });
        button.addEventListener('mouseleave', () => {
            if (note)
                note.textContent = 'Passe o cursor pelos marcadores para revelar a função de cada estrutura.';
        });
    });
}
export function initAnatomyScanner() {
    const slider = document.querySelector('#anatomyScanner');
    const beam = document.querySelector('#scanBeam');
    const coord = document.querySelector('#scanCoord');
    const title = document.querySelector('#anatomyTitle');
    const text = document.querySelector('#anatomyText');
    const role = document.querySelector('#anatomyRole');
    const signal = document.querySelector('#anatomySignal');
    const switches = [...document.querySelectorAll('#anatomySwitches button')];
    if (!slider || !beam)
        return;
    function nearest(value) {
        const entries = Object.entries(anatomyInfo);
        return entries.sort((a, b) => Math.abs(a[1].scanner - value) - Math.abs(b[1].scanner - value))[0][0];
    }
    function update(target) {
        const value = target ? anatomyInfo[target].scanner : Number(slider.value);
        if (target)
            slider.value = String(value);
        beam.style.left = `${value}%`;
        if (coord)
            coord.textContent = String(value).padStart(2, '0');
        const key = target ?? nearest(value);
        const info = anatomyInfo[key];
        if (title)
            title.textContent = info.title;
        if (text)
            text.textContent = info.text;
        if (role)
            role.textContent = info.role;
        if (signal)
            signal.textContent = info.signal;
        switches.forEach(button => button.classList.toggle('active', button.dataset.target === key));
    }
    slider.addEventListener('input', () => update());
    switches.forEach(button => button.addEventListener('click', () => update(button.dataset.target)));
    update('cornea');
}
