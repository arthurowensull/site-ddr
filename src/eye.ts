import type { AnatomyTarget } from './types.js';

const anatomyInfo: Record<AnatomyTarget, { title:string; text:string; role:string; signal:string; scanner:number }> = {
  cornea: { title:'Córnea', text:'Primeira superfície transparente do olho. Participa fortemente da refração da luz que entra no sistema óptico.', role:'ÓPTICA', signal:'ENTRADA', scanner:13 },
  cristalino: { title:'Cristalino', text:'Lente natural flexível que ajuda a ajustar o foco, alterando sua curvatura durante a acomodação.', role:'FOCO', signal:'AJUSTE', scanner:28 },
  retina: { title:'Retina', text:'Tecido sensível à luz na parte posterior do olho. Seus fotorreceptores iniciam a conversão da luz em sinais nervosos.', role:'SENSORIAL', signal:'CONVERSÃO', scanner:73 },
  macula: { title:'Mácula', text:'Região especializada da retina ligada à visão central de maior detalhe. No esquema, aparece próxima ao polo posterior.', role:'DETALHE', signal:'CENTRAL', scanner:84 },
  nervo: { title:'Nervo óptico', text:'Conjunto de fibras que conduz informações da retina em direção ao cérebro.', role:'TRANSMISSÃO', signal:'SAÍDA', scanner:94 }
};

export function initHeroEye() {
  const stage = document.querySelector<HTMLElement>('#heroEyeStage');
  const iris = document.querySelector<HTMLElement>('#heroIris');
  const pupil = document.querySelector<HTMLElement>('#heroPupil');
  const xRead = document.querySelector<HTMLElement>('#coordX');
  const yRead = document.querySelector<HTMLElement>('#coordY');
  if (!stage || !iris || !pupil) return;

  stage.addEventListener('pointermove', (event) => {
    const rect = stage.getBoundingClientRect();
    const nx = (event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const ny = (event.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
    const x = Math.max(-1, Math.min(1, nx));
    const y = Math.max(-1, Math.min(1, ny));
    iris.style.transform = `translate(${x * 18}px, ${y * 12}px)`;
    pupil.style.transform = `translate(${x * 11}px, ${y * 8}px)`;
    if (xRead) xRead.textContent = String(Math.round((x + 1) * 50)).padStart(3,'0');
    if (yRead) yRead.textContent = String(Math.round((y + 1) * 50)).padStart(3,'0');
  });
  stage.addEventListener('pointerleave', () => {
    iris.style.transform = 'translate(0,0)';
    pupil.style.transform = 'translate(0,0)';
  });

  const note = document.querySelector<HTMLElement>('#heroAnatomyNote');
  document.querySelectorAll<HTMLButtonElement>('.anatomy-tag').forEach(button => {
    button.addEventListener('mouseenter', () => {
      const target = button.dataset.anatomy as AnatomyTarget;
      const info = anatomyInfo[target];
      if (note && info) note.innerHTML = `<strong>${info.title}</strong> — ${info.text}`;
    });
    button.addEventListener('mouseleave', () => {
      if (note) note.textContent = 'Passe o cursor pelos marcadores para revelar a função de cada estrutura.';
    });
  });
}

export function initAnatomyScanner() {
  const slider = document.querySelector<HTMLInputElement>('#anatomyScanner');
  const beam = document.querySelector<HTMLElement>('#scanBeam');
  const coord = document.querySelector<HTMLElement>('#scanCoord');
  const title = document.querySelector<HTMLElement>('#anatomyTitle');
  const text = document.querySelector<HTMLElement>('#anatomyText');
  const role = document.querySelector<HTMLElement>('#anatomyRole');
  const signal = document.querySelector<HTMLElement>('#anatomySignal');
  const switches = [...document.querySelectorAll<HTMLButtonElement>('#anatomySwitches button')];
  if (!slider || !beam) return;

  function nearest(value:number): AnatomyTarget {
    const entries = Object.entries(anatomyInfo) as [AnatomyTarget, typeof anatomyInfo[AnatomyTarget]][];
    return entries.sort((a,b) => Math.abs(a[1].scanner - value) - Math.abs(b[1].scanner - value))[0][0];
  }
  function update(target?:AnatomyTarget) {
    const value = target ? anatomyInfo[target].scanner : Number(slider.value);
    if (target) slider.value = String(value);
    beam.style.left = `${value}%`;
    if (coord) coord.textContent = String(value).padStart(2,'0');
    const key = target ?? nearest(value);
    const info = anatomyInfo[key];
    if (title) title.textContent = info.title;
    if (text) text.textContent = info.text;
    if (role) role.textContent = info.role;
    if (signal) signal.textContent = info.signal;
    switches.forEach(button => button.classList.toggle('active', button.dataset.target === key));
  }
  slider.addEventListener('input', () => update());
  switches.forEach(button => button.addEventListener('click', () => update(button.dataset.target as AnatomyTarget)));
  update('cornea');
}
