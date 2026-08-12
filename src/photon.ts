type Ray = { t:number; y:number; offset:number };

export function initPhotonLab() {
  const canvas = document.querySelector<HTMLCanvasElement>('#photonCanvas');
  const power = document.querySelector<HTMLInputElement>('#lensPower');
  const launch = document.querySelector<HTMLButtonElement>('#launchPhoton');
  const clear = document.querySelector<HTMLButtonElement>('#clearPhoton');
  const refraction = document.querySelector<HTMLElement>('#refractionValue');
  const focus = document.querySelector<HTMLElement>('#focusValue');
  if (!canvas || !power) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  let rays:Ray[] = [];
  let raf = 0;

  const retinaX = 1050;
  const lensX = 440;
  const centerY = canvas.height / 2;

  function drawEye() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = '#050006'; ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.strokeStyle = 'rgba(177,81,255,.45)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.ellipse(720,centerY,380,245,0,0,Math.PI*2); ctx.stroke();
    ctx.strokeStyle = '#4ff7ff'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(355,centerY,150,-1.1,1.1); ctx.stroke();
    const p = Number(power.value);
    ctx.strokeStyle = '#d8ff00'; ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.bezierCurveTo(lensX,210-p,lensX+55,245-p/2,lensX,centerY);
    ctx.bezierCurveTo(lensX+55,375+p/2,lensX,410+p,lensX,410+p);
    ctx.stroke();
    ctx.strokeStyle = '#ff2dd1'; ctx.lineWidth = 8;
    ctx.beginPath(); ctx.arc(720,centerY,380,-.75,.75); ctx.stroke();
    ctx.fillStyle = 'rgba(216,255,0,.9)'; ctx.font = '700 14px monospace';
    ctx.fillText('CÓRNEA', 290, 95); ctx.fillText('CRISTALINO', 395, 140); ctx.fillText('RETINA', 1030, 125);
    ctx.setLineDash([4,8]); ctx.strokeStyle='rgba(255,255,255,.08)'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(60,centerY);ctx.lineTo(1120,centerY);ctx.stroke();ctx.setLineDash([]);
  }

  function targetY(inputY:number) {
    const p = Number(power.value);
    const strength = .88 + p/120;
    return centerY + (centerY - inputY) * strength;
  }

  function pathAt(x:number, inputY:number) {
    if (x <= lensX) return inputY + (centerY-inputY) * ((x-60)/(lensX-60)) * .12;
    const atLens = inputY + (centerY-inputY) * .12;
    const endY = targetY(inputY);
    const u = (x-lensX)/(retinaX-lensX);
    return atLens + (endY-atLens) * u;
  }

  function render() {
    drawEye();
    const now = performance.now();
    rays.forEach(ray => {
      const travel = Math.min(1, (now-ray.t)/1150);
      const xEnd = 60 + (retinaX-60)*travel;
      const steps = 80;
      ctx.beginPath();
      for (let i=0;i<=steps;i++) {
        const x = 60 + (xEnd-60)*(i/steps);
        const y = pathAt(x,ray.y);
        if (i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
      }
      ctx.strokeStyle = '#d8ff00'; ctx.shadowColor='#d8ff00'; ctx.shadowBlur=10;ctx.lineWidth=2;ctx.stroke();ctx.shadowBlur=0;
      const py = pathAt(xEnd,ray.y);
      ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(xEnd,py,4,0,Math.PI*2);ctx.fill();
    });
    rays = rays.filter(r => now-r.t < 5000);
    raf = requestAnimationFrame(render);
  }

  launch?.addEventListener('click', () => {
    const now = performance.now();
    [centerY-125, centerY-62, centerY, centerY+62, centerY+125].forEach((y,i) => rays.push({t:now+i*55,y,offset:i}));
  });
  clear?.addEventListener('click', () => rays=[]);
  power.addEventListener('input', () => {
    const p = Number(power.value);
    if (refraction) refraction.textContent = (1 + p/180).toFixed(2);
    if (focus) focus.textContent = Math.abs(p-8) < 12 ? 'RETINA' : (p > 8 ? 'ANTES' : 'DEPOIS');
  });
  cancelAnimationFrame(raf); render();
}
