export function initDetachmentLab() {
    const canvas = document.querySelector('#retinaMapCanvas');
    const shadow = document.querySelector('#fieldShadow');
    const floaters = document.querySelector('#floaters');
    const flashes = document.querySelector('#flashLayer');
    const field = document.querySelector('#fieldView');
    if (!canvas || !shadow || !field)
        return;
    const ctx = canvas.getContext('2d');
    if (!ctx)
        return;
    let point = { x: .72, y: .24 };
    let dragging = false;
    function draw() {
        const w = canvas.width, h = canvas.height, cx = w * .48, cy = h * .5, rx = w * .39, ry = h * .39;
        ctx.clearRect(0, 0, w, h);
        const grd = ctx.createRadialGradient(cx, cy, 30, cx, cy, rx);
        grd.addColorStop(0, '#2b0634');
        grd.addColorStop(1, '#100012');
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, w, h);
        ctx.strokeStyle = 'rgba(177,81,255,.5)';
        ctx.lineWidth = 14;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = '#d8ff00';
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.arc(cx, cy, rx, -1.05, 1.05);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(79,247,255,.4)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.moveTo(cx + 80, cy);
            ctx.quadraticCurveTo(cx + 160, cy + (i - 2) * 50, cx + rx - 20, cy + (i - 2) * 80);
            ctx.stroke();
        }
        const px = cx + (point.x - .5) * rx * 1.4, py = cy + (point.y - .5) * ry * 1.4;
        ctx.fillStyle = '#ff2dd1';
        ctx.shadowColor = '#ff2dd1';
        ctx.shadowBlur = 25;
        ctx.beginPath();
        ctx.arc(px, py, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#ff2dd1';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(px, py, 48, -.9, .9);
        ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,.75)';
        ctx.font = '700 13px monospace';
        ctx.fillText('REGIÃO SIMULADA', 22, 36);
        ctx.fillStyle = '#d8ff00';
        ctx.fillText('ARRASTE', 22, 58);
    }
    function setPointFromEvent(event) {
        const rect = canvas.getBoundingClientRect();
        point.x = Math.max(.08, Math.min(.92, (event.clientX - rect.left) / rect.width));
        point.y = Math.max(.08, Math.min(.92, (event.clientY - rect.top) / rect.height));
        // Inversão didática do campo: eixo horizontal e vertical opostos.
        const sx = (1 - point.x) * 78;
        const sy = (1 - point.y) * 78;
        shadow.style.left = `${sx}%`;
        shadow.style.top = `${sy}%`;
        draw();
    }
    canvas.addEventListener('pointerdown', e => { dragging = true; canvas.setPointerCapture(e.pointerId); setPointFromEvent(e); });
    canvas.addEventListener('pointermove', e => { if (dragging)
        setPointFromEvent(e); });
    canvas.addEventListener('pointerup', () => dragging = false);
    draw();
    document.querySelectorAll('[data-visual]').forEach(button => button.addEventListener('click', () => {
        document.querySelectorAll('[data-visual]').forEach(b => b.classList.remove('active'));
        button.classList.add('active');
        const mode = button.dataset.visual;
        shadow.style.opacity = mode === 'map' ? '1' : '0';
        if (floaters)
            floaters.style.opacity = mode === 'floaters' ? '1' : '0';
        if (flashes)
            flashes.classList.toggle('active', mode === 'flashes');
    }));
    const scanner = document.querySelector('#imageScanner');
    const image = document.querySelector('#scanImage');
    const loupe = document.querySelector('#scannerLoupe');
    const scans = { compare: 'assets/images/retina-saudavel-vs-descolada.jpg', cut: 'assets/images/retina-corte.png' };
    document.querySelectorAll('[data-scan]').forEach(button => button.addEventListener('click', () => {
        document.querySelectorAll('[data-scan]').forEach(b => b.classList.remove('active'));
        button.classList.add('active');
        if (image)
            image.src = scans[button.dataset.scan || 'compare'];
    }));
    scanner?.addEventListener('pointermove', e => {
        if (!image || !loupe)
            return;
        const rect = scanner.getBoundingClientRect();
        const x = e.clientX - rect.left, y = e.clientY - rect.top;
        loupe.style.display = 'block';
        loupe.style.left = `${x}px`;
        loupe.style.top = `${y}px`;
        const scale = 2.15;
        loupe.style.backgroundImage = `url(${image.src})`;
        loupe.style.backgroundSize = `${rect.width * scale}px ${rect.height * scale}px`;
        loupe.style.backgroundPosition = `${-x * scale + 75}px ${-y * scale + 75}px`;
    });
    scanner?.addEventListener('pointerleave', () => { if (loupe)
        loupe.style.display = 'none'; });
}
