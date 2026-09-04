// GiveForward — Particles Background Component
// Canvas-based floating particles with connections — creates a "network" feel

export function initParticles(canvas) {
  const ctx = canvas.getContext('2d');
  let particles = [];
  let animationId = null;
  let width, height;

  const CONFIG = {
    count: 60,
    maxSpeed: 0.3,
    minRadius: 1,
    maxRadius: 2.5,
    connectionDistance: 140,
    connectionOpacity: 0.06,
    particleOpacity: 0.25,
    colors: ['108, 92, 231', '162, 155, 254', '255, 107, 107', '0, 184, 148'],
  };

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  function createParticle() {
    const colorIdx = Math.floor(Math.random() * CONFIG.colors.length);
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * CONFIG.maxSpeed,
      vy: (Math.random() - 0.5) * CONFIG.maxSpeed,
      radius: CONFIG.minRadius + Math.random() * (CONFIG.maxRadius - CONFIG.minRadius),
      color: CONFIG.colors[colorIdx],
      opacity: 0.1 + Math.random() * CONFIG.particleOpacity,
    };
  }

  function initializeParticles() {
    particles = [];
    for (let i = 0; i < CONFIG.count; i++) {
      particles.push(createParticle());
    }
  }

  function update() {
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;

      // Wrap around edges
      if (p.x < -10) p.x = width + 10;
      if (p.x > width + 10) p.x = -10;
      if (p.y < -10) p.y = height + 10;
      if (p.y > height + 10) p.y = -10;
    }
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONFIG.connectionDistance) {
          const opacity = (1 - dist / CONFIG.connectionDistance) * CONFIG.connectionOpacity;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(${particles[i].color}, ${opacity})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    // Draw particles
    for (const p of particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color}, ${p.opacity})`;
      ctx.fill();
    }
  }

  function animate() {
    update();
    draw();
    animationId = requestAnimationFrame(animate);
  }

  function start() {
    resize();
    initializeParticles();
    animate();
    window.addEventListener('resize', resize);
  }

  function stop() {
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
    window.removeEventListener('resize', resize);
  }

  return { start, stop };
}

// Mount particles to the page
export function mountParticles() {
  // Check if already mounted
  if (document.getElementById('particles-canvas')) return;

  const canvas = document.createElement('canvas');
  canvas.id = 'particles-canvas';
  canvas.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 0;
    opacity: 0.7;
  `;
  document.body.appendChild(canvas);

  const particles = initParticles(canvas);
  particles.start();

  return particles;
}
