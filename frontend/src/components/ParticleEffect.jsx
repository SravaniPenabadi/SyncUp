import { useEffect, useRef } from "react";

const ParticleEffect = ({ emojis = ["✨"] }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const particles = [];

    const createParticle = () => {
      const el = document.createElement("div");
      el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      el.style.cssText = `
        position: absolute;
        font-size: ${Math.random() * 16 + 10}px;
        left: ${Math.random() * 100}%;
        top: 100%;
        opacity: 0.8;
        pointer-events: none;
        animation: floatUp ${Math.random() * 3 + 3}s ease-in forwards;
        z-index: 0;
      `;
      container.appendChild(el);
      particles.push(el);
      setTimeout(() => {
        el.remove();
        particles.splice(particles.indexOf(el), 1);
      }, 6000);
    };

    const interval = setInterval(createParticle, 800);

    // Add keyframe animation if not already added
    if (!document.getElementById("particle-style")) {
      const style = document.createElement("style");
      style.id = "particle-style";
      style.textContent = `
        @keyframes floatUp {
          0%   { transform: translateY(0) rotate(0deg); opacity: 0.8; }
          100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }

    return () => {
      clearInterval(interval);
      particles.forEach((p) => p.remove());
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none z-0"
    />
  );
};

export default ParticleEffect;