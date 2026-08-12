const parts:Record<string,string> = {
  controlador:'Arduino ou ESP32: recebe as leituras dos sensores, executa a lógica e controla a saída do protótipo.',
  sensores:'LDRs ou outros fotossensores: ficam distribuídos na região que representa a retina e convertem luz em valores elétricos.',
  lente:'Lente do kit escolar: cria um caminho óptico simples para discutir foco, refração e formação de imagem.',
  led:'LED branco com resistor adequado: fonte luminosa segura e controlável para o experimento escolar.',
  servo:'Microservo: pode mover um trecho da superfície sensora para representar a mudança de posição no modelo físico.',
  estrutura:'Estrutura do olho: pode ser feita com peças de kit, impressão 3D, EVA, acrílico ou material disponível na escola.',
  saida:'Display OLED ou conjunto de LEDs: apresenta as leituras ou destaca diferenças entre as condições testadas.'
};

export function initSignalAndBuild() {
  const consoleEl=document.querySelector<HTMLElement>('.signal-console');
  const run=document.querySelector<HTMLButtonElement>('#runSignal');
  const light=document.querySelector<HTMLElement>('#lightValue');
  const sensor=document.querySelector<HTMLElement>('#sensorValue');
  const code=document.querySelector<HTMLElement>('#codeValue');
  const log=document.querySelector<HTMLElement>('#signalLog');
  const stages=[...document.querySelectorAll<HTMLElement>('.signal-stage')];
  let busy=false;
  const wait=(ms:number)=>new Promise(r=>setTimeout(r,ms));

  run?.addEventListener('click', async()=>{
    if(busy)return;busy=true;consoleEl?.classList.add('running');stages.forEach(s=>s.classList.remove('active'));
    if(log)log.textContent='[01] Fonte luminosa ativada → propagação iniciada';stages[0]?.classList.add('active');
    if(light)light.textContent=String(520+Math.round(Math.random()*45));await wait(850);
    stages[0]?.classList.remove('active');stages[1]?.classList.add('active');
    const raw=580+Math.round(Math.random()*330);if(sensor)sensor.textContent=String(raw);if(log)log.textContent=`[02] Fotossensor converteu luz → leitura ADC ${raw}`;await wait(850);
    stages[1]?.classList.remove('active');stages[2]?.classList.add('active');if(code)code.textContent=raw>710?'ALTO':'MÉDIO';if(log)log.textContent=`[03] Código comparou o valor → estado ${raw>710?'ALTO':'MÉDIO'}`;await wait(900);
    stages[2]?.classList.remove('active');consoleEl?.classList.remove('running');busy=false;
  });

  const partInfo=document.querySelector<HTMLElement>('#partInfo');
  document.querySelectorAll<HTMLButtonElement>('[data-part]').forEach(button=>button.addEventListener('click',()=>{
    document.querySelectorAll('[data-part]').forEach(b=>b.classList.remove('active'));button.classList.add('active');
    const key=button.dataset.part || '';if(partInfo)partInfo.textContent=parts[key] || '';
  }));

  const steps=[...document.querySelectorAll<HTMLElement>('.build-step')];
  const buildObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(!entry.isIntersecting)return;const target=entry.target as HTMLElement;steps.forEach(s=>s.classList.toggle('active',s===target));
  }),{threshold:.75});
  steps.forEach(step=>buildObserver.observe(step));
}
