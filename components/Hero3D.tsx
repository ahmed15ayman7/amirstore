"use client";
import { useEffect, useRef } from "react";

/* Three.js hero: big spinning gold coin, coin pile and raining coins (same scene as the design) */
export default function Hero3D() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let disposed = false;
    let cleanup = () => {};
    import("three").then((THREE) => {
      if (disposed || !ref.current) return;
      const canvas = ref.current;
      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
      camera.position.set(0, 0, 14);

      function faceTex() {
        const c = document.createElement("canvas");
        c.width = c.height = 512;
        const g = c.getContext("2d")!;
        const grd = g.createRadialGradient(190, 170, 20, 256, 256, 260);
        grd.addColorStop(0, "#fff4c0");
        grd.addColorStop(0.45, "#ffc21a");
        grd.addColorStop(0.85, "#e89a00");
        grd.addColorStop(1, "#a86600");
        g.fillStyle = grd;
        g.fillRect(0, 0, 512, 512);
        g.strokeStyle = "rgba(120,70,0,.55)";
        g.lineWidth = 18;
        g.beginPath();
        g.arc(256, 256, 222, 0, 7);
        g.stroke();
        g.strokeStyle = "rgba(255,240,170,.6)";
        g.lineWidth = 6;
        g.beginPath();
        g.arc(256, 256, 196, 0, 7);
        g.stroke();
        g.fillStyle = "#7a4800";
        g.font = "bold 230px Lalezar, Cairo, sans-serif";
        g.textAlign = "center";
        g.textBaseline = "middle";
        g.fillText("A", 256, 270);
        g.font = "bold 44px Cairo, sans-serif";
        g.fillText("AMIR STORE", 256, 410);
        const t = new THREE.CanvasTexture(c);
        t.anisotropy = 8;
        return t;
      }
      const edgeMat = new THREE.MeshStandardMaterial({ color: 0xe9a000, metalness: 0.45, roughness: 0.35, emissive: 0x1a0f00 });
      const faceMat = new THREE.MeshStandardMaterial({ map: faceTex(), metalness: 0.3, roughness: 0.38, emissive: 0x120a00 });
      document.fonts?.ready.then(() => {
        if (disposed) return;
        faceMat.map = faceTex();
        faceMat.needsUpdate = true;
      });
      const geo = new THREE.CylinderGeometry(1, 1, 0.16, 64);

      const big = new THREE.Mesh(geo, [edgeMat, faceMat, faceMat]);
      big.scale.set(2.6, 2.6, 2.6);
      big.rotation.x = Math.PI / 2;
      const spin = new THREE.Group();
      spin.add(big);
      const bigGroup = new THREE.Group();
      bigGroup.add(spin);
      scene.add(bigGroup);

      const smallGeo = new THREE.CylinderGeometry(1, 1, 0.16, 28);
      const N = innerWidth < 700 ? 28 : 60;
      const coins: { x: number; y: number; z: number; s: number; rx: number; ry: number; vy: number; vrx: number; vry: number }[] = [];
      const dummy = new THREE.Object3D();
      const rain = new THREE.InstancedMesh(smallGeo, [edgeMat, faceMat, faceMat], N);
      scene.add(rain);
      for (let i = 0; i < N; i++) {
        const s = 0.25 + Math.random() * 0.45;
        coins.push({
          x: (Math.random() - 0.5) * 26, y: Math.random() * 20 - 10, z: -Math.random() * 10 - 1, s,
          rx: Math.random() * 6, ry: Math.random() * 6, vy: 0.7 + Math.random() * 1.8,
          vrx: (Math.random() - 0.5) * 3, vry: (Math.random() - 0.5) * 3,
        });
      }
      const PN = 70,
        pile = new THREE.Group();
      const pileMesh = new THREE.InstancedMesh(smallGeo, [edgeMat, faceMat, faceMat], PN);
      pile.add(pileMesh);
      for (let i = 0; i < PN; i++) {
        const a = Math.random() * Math.PI * 2,
          r = Math.pow(Math.random(), 0.7) * 2.6;
        dummy.position.set(Math.cos(a) * r, (2.6 - r) * 0.55 + Math.random() * 0.2, Math.sin(a) * r * 0.6);
        dummy.rotation.set(Math.random() * 0.8, Math.random() * 6, Math.random() * 0.8);
        dummy.scale.setScalar(0.35);
        dummy.updateMatrix();
        pileMesh.setMatrixAt(i, dummy.matrix);
      }
      pile.position.y = -3.6;
      bigGroup.add(pile);

      scene.add(new THREE.AmbientLight(0xffffff, 0.4));
      scene.add(new THREE.HemisphereLight(0xfff4d0, 0x221500, 0.35));
      const key = new THREE.DirectionalLight(0xfff1c4, 1.1);
      key.position.set(5, 6, 8);
      scene.add(key);
      const p1 = new THREE.PointLight(0xffc21a, 2.2, 30);
      p1.position.set(-6, 2, 6);
      scene.add(p1);
      const p2 = new THREE.PointLight(0x5fb3ec, 1.2, 30);
      p2.position.set(6, -4, 4);
      scene.add(p2);

      let mx = 0,
        my = 0;
      const onMove = (e: PointerEvent) => {
        mx = e.clientX / innerWidth - 0.5;
        my = e.clientY / innerHeight - 0.5;
      };
      addEventListener("pointermove", onMove, { passive: true });
      function resize() {
        const w = canvas.parentElement!.offsetWidth,
          h = canvas.parentElement!.offsetHeight;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        const mobile = w < 980;
        bigGroup.position.set(mobile ? 0 : -4.4, mobile ? 2.4 : 0.6, 0);
        bigGroup.scale.setScalar(mobile ? 0.75 : 1);
      }
      resize();
      addEventListener("resize", resize);

      let t = 0,
        visible = true,
        last = performance.now(),
        raf = 0;
      const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
      io.observe(canvas);
      const loop = (now: number) => {
        raf = requestAnimationFrame(loop);
        const dt = Math.min(0.1, Math.max(0, (now - last) / 1000));
        last = now;
        if (!visible) return;
        t += dt;
        spin.rotation.y = t * 0.7;
        spin.position.y = Math.sin(t * 1.4) * 0.25 + 0.4;
        pile.rotation.y = t * 0.15;
        const k = Math.min(1, dt * 3);
        bigGroup.rotation.y += (mx * 0.6 - bigGroup.rotation.y) * k;
        bigGroup.rotation.x += (my * 0.3 - bigGroup.rotation.x) * k;
        coins.forEach((c, i) => {
          c.y -= c.vy * dt;
          c.rx += c.vrx * dt;
          c.ry += c.vry * dt;
          if (c.y < -11) {
            c.y = 11;
            c.x = (Math.random() - 0.5) * 26;
          }
          dummy.position.set(c.x, c.y, c.z);
          dummy.rotation.set(c.rx, c.ry, 0);
          dummy.scale.setScalar(c.s);
          dummy.updateMatrix();
          rain.setMatrixAt(i, dummy.matrix);
        });
        rain.instanceMatrix.needsUpdate = true;
        camera.position.x += (mx * 1.2 - camera.position.x) * k * 0.8;
        camera.position.y += (-my * 0.8 - camera.position.y) * k * 0.8;
        camera.lookAt(0, 0, 0);
        renderer.render(scene, camera);
      };
      raf = requestAnimationFrame(loop);

      cleanup = () => {
        cancelAnimationFrame(raf);
        io.disconnect();
        removeEventListener("pointermove", onMove);
        removeEventListener("resize", resize);
        renderer.dispose();
      };
    });
    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return <canvas id="hero3d" ref={ref} />;
}
