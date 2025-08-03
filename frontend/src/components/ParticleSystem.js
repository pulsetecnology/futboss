/**
 * Sistema de Partículas - FutBoss
 * Partículas animadas para tela de boas-vindas
 */

export class ParticleSystem {
  constructor(container, options = {}) {
    this.container = container;
    this.canvas = null;
    this.ctx = null;
    this.particles = [];
    this.animationId = null;
    
    // Configurações
    this.config = {
      particleCount: options.particleCount || 50,
      particleSize: options.particleSize || { min: 1, max: 3 },
      particleSpeed: options.particleSpeed || { min: 0.5, max: 2 },
      particleColor: options.particleColor || '#6B46C1',
      particleOpacity: options.particleOpacity || { min: 0.3, max: 0.8 },
      connectionDistance: options.connectionDistance || 100,
      connectionOpacity: options.connectionOpacity || 0.2,
      mouseInteraction: options.mouseInteraction !== false,
      mouseRadius: options.mouseRadius || 150,
      ...options
    };
    
    this.mouse = { x: 0, y: 0 };
    this.init();
  }

  init() {
    this.createCanvas();
    this.createParticles();
    this.bindEvents();
    this.animate();
  }

  createCanvas() {
    this.canvas = document.createElement('canvas');
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.zIndex = '1';
    
    this.container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
    
    this.resize();
  }

  createParticles() {
    this.particles = [];
    
    for (let i = 0; i < this.config.particleCount; i++) {
      this.particles.push(this.createParticle());
    }
  }

  createParticle() {
    return {
      x: Math.random() * this.canvas.width,
      y: Math.random() * this.canvas.height,
      vx: (Math.random() - 0.5) * this.randomBetween(this.config.particleSpeed.min, this.config.particleSpeed.max),
      vy: (Math.random() - 0.5) * this.randomBetween(this.config.particleSpeed.min, this.config.particleSpeed.max),
      size: this.randomBetween(this.config.particleSize.min, this.config.particleSize.max),
      opacity: this.randomBetween(this.config.particleOpacity.min, this.config.particleOpacity.max),
      originalOpacity: 0,
      hue: Math.random() * 60 + 240, // Tons de roxo/azul
      pulsePhase: Math.random() * Math.PI * 2,
      pulseSpeed: 0.02 + Math.random() * 0.02
    };
  }

  randomBetween(min, max) {
    return Math.random() * (max - min) + min;
  }

  bindEvents() {
    window.addEventListener('resize', () => this.resize());
    
    if (this.config.mouseInteraction) {
      this.container.addEventListener('mousemove', (e) => {
        const rect = this.container.getBoundingClientRect();
        this.mouse.x = e.clientX - rect.left;
        this.mouse.y = e.clientY - rect.top;
      });
      
      this.container.addEventListener('mouseleave', () => {
        this.mouse.x = -1000;
        this.mouse.y = -1000;
      });
    }
  }

  resize() {
    const rect = this.container.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
    
    // Reposicionar partículas que saíram da tela
    this.particles.forEach(particle => {
      if (particle.x > this.canvas.width) particle.x = 0;
      if (particle.y > this.canvas.height) particle.y = 0;
      if (particle.x < 0) particle.x = this.canvas.width;
      if (particle.y < 0) particle.y = this.canvas.height;
    });
  }

  updateParticles() {
    this.particles.forEach(particle => {
      // Movimento básico
      particle.x += particle.vx;
      particle.y += particle.vy;
      
      // Wrap around nas bordas
      if (particle.x > this.canvas.width) particle.x = 0;
      if (particle.x < 0) particle.x = this.canvas.width;
      if (particle.y > this.canvas.height) particle.y = 0;
      if (particle.y < 0) particle.y = this.canvas.height;
      
      // Efeito de pulsação
      particle.pulsePhase += particle.pulseSpeed;
      const pulseFactor = (Math.sin(particle.pulsePhase) + 1) * 0.5;
      particle.opacity = particle.originalOpacity + pulseFactor * 0.3;
      
      // Interação com mouse
      if (this.config.mouseInteraction) {
        const dx = this.mouse.x - particle.x;
        const dy = this.mouse.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.config.mouseRadius) {
          const force = (this.config.mouseRadius - distance) / this.config.mouseRadius;
          const angle = Math.atan2(dy, dx);
          
          particle.vx -= Math.cos(angle) * force * 0.5;
          particle.vy -= Math.sin(angle) * force * 0.5;
          
          // Aumentar brilho próximo ao mouse
          particle.opacity = Math.min(1, particle.opacity + force * 0.5);
        }
      }
      
      // Aplicar atrito
      particle.vx *= 0.99;
      particle.vy *= 0.99;
      
      // Manter velocidade mínima
      const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
      if (speed < 0.1) {
        const angle = Math.random() * Math.PI * 2;
        particle.vx = Math.cos(angle) * 0.5;
        particle.vy = Math.sin(angle) * 0.5;
      }
    });
  }

  drawParticles() {
    this.particles.forEach(particle => {
      this.ctx.save();
      
      // Criar gradiente radial para cada partícula
      const gradient = this.ctx.createRadialGradient(
        particle.x, particle.y, 0,
        particle.x, particle.y, particle.size * 2
      );
      
      const hue = particle.hue + Math.sin(particle.pulsePhase) * 20;
      gradient.addColorStop(0, `hsla(${hue}, 70%, 60%, ${particle.opacity})`);
      gradient.addColorStop(1, `hsla(${hue}, 70%, 60%, 0)`);
      
      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      this.ctx.fill();
      
      this.ctx.restore();
    });
  }

  drawConnections() {
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const particleA = this.particles[i];
        const particleB = this.particles[j];
        
        const dx = particleA.x - particleB.x;
        const dy = particleA.y - particleB.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.config.connectionDistance) {
          const opacity = (1 - distance / this.config.connectionDistance) * this.config.connectionOpacity;
          
          this.ctx.save();
          this.ctx.strokeStyle = `rgba(107, 70, 193, ${opacity})`;
          this.ctx.lineWidth = 1;
          this.ctx.beginPath();
          this.ctx.moveTo(particleA.x, particleA.y);
          this.ctx.lineTo(particleB.x, particleB.y);
          this.ctx.stroke();
          this.ctx.restore();
        }
      }
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.updateParticles();
    this.drawConnections();
    this.drawParticles();
    
    this.animationId = requestAnimationFrame(() => this.animate());
  }

  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
    
    window.removeEventListener('resize', this.resize);
  }

  // Métodos públicos para controle
  pause() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  resume() {
    if (!this.animationId) {
      this.animate();
    }
  }

  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    this.createParticles(); // Recriar partículas com nova configuração
  }

  addParticles(count) {
    for (let i = 0; i < count; i++) {
      this.particles.push(this.createParticle());
    }
  }

  removeParticles(count) {
    this.particles.splice(0, count);
  }
}

// Instância global
window.ParticleSystem = ParticleSystem;

export default ParticleSystem;