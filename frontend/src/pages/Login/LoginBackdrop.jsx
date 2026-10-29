import { useEffect, useRef } from "react";

// Animated IT background for the sign-in page (42xacademy.com colours), drawn on a canvas:
// a slowly turning globe with a network, light waves spreading from it, data pulses running up
// circuit lines and flickering binary digits. Decorative only, hidden from screen readers.

const BRAND_STOPS = [[0, 180, 255], [107, 92, 255], [214, 67, 245]];

function brandColor(t, alpha) {
  const k = Math.min(1.999, Math.max(0, t) * 2);
  const i = Math.floor(k);
  const f = k - i;
  const [r, g, b] = [0, 1, 2].map((j) => Math.round(BRAND_STOPS[i][j] + (BRAND_STOPS[i + 1][j] - BRAND_STOPS[i][j]) * f));
  return `rgba(${r},${g},${b},${alpha})`;
}

// Same layout on every visit (seeded), new layout only when the window size changes.
function seededRandom(seed) {
  let value = seed;
  return () => (value = (value * 16807) % 2147483647) / 2147483647;
}

function buildScene(width, height) {
  const random = seededRandom(7);
  // phones: centred globe and lines spread across the full width, fewer of them
  const narrow = width < 700;
  // small globe low at the bottom: only its top cap shows
  const radius = narrow ? width * 0.42 : Math.min(height * 0.42, width * 0.3);
  const globe = { x: width * (narrow ? 0.5 : 0.36), y: height + radius * 0.6, r: radius };

  const traces = Array.from({ length: narrow ? 16 : 34 }, () => {
    let x = narrow ? width * (0.04 + random() * 0.92) : width * 0.05 + random() * width * 0.62;
    let y = height * (0.35 + random() * 0.25);
    const points = [[x, y]];
    const top = height * (0.02 + random() * 0.25);
    while (y > top) {
      y -= 12 + random() * 30;
      if (random() < 0.3) x += (random() < 0.5 ? -1 : 1) * 12;
      points.push([x, y]);
    }
    const lengths = points.slice(1).map((p, i) => Math.hypot(p[0] - points[i][0], p[1] - points[i][1]));
    return { points, lengths, total: lengths.reduce((a, b) => a + b, 0), color: random() * 0.5, offset: random(), speed: 0.6 + random() * 0.8 };
  });

  // only the top of the globe is on screen, so the network lives there
  const nodes = Array.from({ length: 40 }, () => ({ lat: 38 + random() * 46, lon: random() * 360 }));
  const digits = Array.from({ length: narrow ? 3 : 6 }, () => ({ x: width * (narrow ? 0.04 + random() * 0.92 : 0.04 + random() * 0.6), seed: Math.floor(random() * 1000) }));
  const sparks = Array.from({ length: narrow ? 16 : 36 }, () => ({ x: random() * width, y: random() * height, r: 1 + random() * 2.6, color: random(), speed: 4 + random() * 10 }));

  return { width, height, globe, traces, nodes, digits, sparks };
}

function project(globe, lat, lon) {
  const la = (lat * Math.PI) / 180;
  const lo = (lon * Math.PI) / 180;
  return { x: globe.x + globe.r * Math.cos(la) * Math.sin(lo), y: globe.y - globe.r * Math.sin(la), depth: Math.cos(la) * Math.cos(lo) };
}

function pointAlong(trace, distance) {
  let left = distance;
  for (let i = 0; i < trace.lengths.length; i += 1) {
    if (left <= trace.lengths[i]) {
      const f = left / trace.lengths[i];
      const [x1, y1] = trace.points[i];
      const [x2, y2] = trace.points[i + 1];
      return [x1 + (x2 - x1) * f, y1 + (y2 - y1) * f];
    }
    left -= trace.lengths[i];
  }
  return trace.points[trace.points.length - 1];
}

function glowDot(ctx, x, y, r, color, blur) {
  ctx.shadowColor = color;
  ctx.shadowBlur = blur;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
}

function drawFrame(ctx, scene, time) {
  const { width, height, globe } = scene;
  const seconds = time / 1000;
  const turn = seconds * 3; // globe rotation, degrees
  ctx.clearRect(0, 0, width, height);

  // circuit lines with data pulses running upwards
  ctx.lineWidth = 1;
  scene.traces.forEach((trace) => {
    ctx.strokeStyle = brandColor(trace.color, 0.3);
    ctx.beginPath();
    trace.points.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.stroke();
    const [ex, ey] = trace.points[trace.points.length - 1];
    glowDot(ctx, ex, ey, 2, "rgba(120,210,255,0.85)", 10);

    const progress = ((seconds * trace.speed) / 4 + trace.offset) % 1;
    const [px, py] = pointAlong(trace, progress * trace.total);
    glowDot(ctx, px, py, 2.4, "rgba(170,235,255,0.95)", 14);
  });

  // flickering binary digits
  ctx.font = "12px Consolas, monospace";
  scene.digits.forEach((column) => {
    for (let k = 0; k < 8; k += 1) {
      const bit = (Math.floor(seconds * 1.5) + column.seed + k * 7) % 3 === 0 ? "1" : "0";
      ctx.fillStyle = `rgba(90,170,255,${0.05 + ((column.seed + k) % 5) * 0.025})`;
      ctx.fillText(bit, column.x, height * 0.08 + k * 16);
    }
  });

  // halo and light waves spreading from the globe
  const halo = ctx.createRadialGradient(globe.x, globe.y, globe.r * 0.85, globe.x, globe.y, globe.r * 1.15);
  halo.addColorStop(0, "rgba(0,180,255,0)");
  halo.addColorStop(0.5, "rgba(0,180,255,0.22)");
  halo.addColorStop(1, "rgba(0,180,255,0)");
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(globe.x, globe.y, globe.r * 1.15, 0, Math.PI * 2);
  ctx.fill();

  for (let w = 0; w < 3; w += 1) {
    const phase = (seconds / 6 + w / 3) % 1;
    ctx.strokeStyle = brandColor(phase, (1 - phase) * 0.35);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(globe.x, globe.y, globe.r * (1 + phase * 0.45), 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.strokeStyle = "rgba(90,200,255,0.75)";
  ctx.lineWidth = 2;
  ctx.shadowColor = "#00b4ff";
  ctx.shadowBlur = 18;
  ctx.beginPath();
  ctx.arc(globe.x, globe.y, globe.r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // dotted, turning surface (front half only)
  for (let lat = -80; lat <= 84; lat += 6) {
    for (let lon = -180; lon < 180; lon += 6) {
      const p = project(globe, lat, lon + turn);
      if (p.depth > 0 && p.y < height + 10) {
        ctx.fillStyle = `rgba(90,190,255,${(0.12 + p.depth * 0.55).toFixed(2)})`;
        ctx.fillRect(p.x, p.y, 1.8, 1.8);
      }
    }
  }

  // network on the globe
  const visible = scene.nodes.map((n) => project(globe, n.lat, n.lon + turn)).filter((p) => p.depth > 0.05 && p.y < height);
  ctx.lineWidth = 1;
  visible.forEach((p, i) => {
    const q = visible[(i + 3) % visible.length];
    if (q && Math.hypot(p.x - q.x, p.y - q.y) < globe.r * 0.5) {
      ctx.strokeStyle = `rgba(120,210,255,${(0.15 + Math.min(p.depth, q.depth) * 0.3).toFixed(2)})`;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(q.x, q.y);
      ctx.stroke();
    }
    const pulse = 0.6 + 0.4 * Math.sin(seconds * 2 + i);
    glowDot(ctx, p.x, p.y, 2.2, `rgba(140,220,255,${(p.depth * pulse).toFixed(2)})`, 10);
  });

  // slow rising sparks
  scene.sparks.forEach((spark) => {
    const y = (((spark.y - seconds * spark.speed) % height) + height) % height;
    ctx.fillStyle = brandColor(spark.color, 0.28);
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(spark.x, y, spark.r, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.shadowBlur = 0;
}

function LoginBackdrop() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let scene = null;
    let frame = 0;

    function resize() {
      const { width, height } = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      scene = buildScene(width, height);
      if (reduceMotion) drawFrame(ctx, scene, 0);
    }

    function loop(time) {
      drawFrame(ctx, scene, time);
      frame = requestAnimationFrame(loop);
    }

    resize();
    window.addEventListener("resize", resize);
    if (!reduceMotion) frame = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="login-backdrop" aria-hidden="true">
      <div className="login-backdrop-grid" />
      <canvas ref={canvasRef} className="login-backdrop-canvas" />
    </div>
  );
}

export default LoginBackdrop;
