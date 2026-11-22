import { useEffect } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { BOUNDS } from '../game/config';
import { Sfx } from '../game/sfx';
import type { Sheep } from '../game/sheep';
import { world } from '../game/world';

const MOVE_KEYS: Record<string, string> = { w: 'w', a: 'a', s: 's', d: 'd', arrowup: 'w', arrowleft: 'a', arrowdown: 's', arrowright: 'd' };

/** Mounts the simulated flock and wires pointer + keyboard input to the world. */
export function Flock() {
  const camera = useThree(s => s.camera);
  const gl = useThree(s => s.gl);

  useEffect(() => { world.camera = camera; }, [camera]);
  useFrame((state, dt) => world.update(Math.min(dt, 1 / 30), state.clock.elapsedTime));

  useEffect(() => {
    const el = gl.domElement;
    const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), ground = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), hit = new THREE.Vector3();
    let down: { x: number; y: number } | null = null;

    const aim = (e: PointerEvent | MouseEvent) => {
      const r = el.getBoundingClientRect();
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, camera);
    };
    const pickSheep = (): Sheep | null => (ray.intersectObjects(world.hitTargets, false)[0]?.object.userData.sheep as Sheep | undefined) ?? null;

    const onMove = (e: PointerEvent) => {
      aim(e); const s = pickSheep(); world.setHovered(s);
      el.style.cursor = s ? 'pointer' : world.selected ? 'crosshair' : 'grab';
    };
    const onDown = (e: PointerEvent) => { Sfx.unlock(); down = { x: e.clientX, y: e.clientY }; };
    const onUp = (e: PointerEvent) => {
      if (!down) return;
      const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y); down = null;
      if (moved > 6) return; // that was an orbit drag
      aim(e); const s = pickSheep();
      if (s) { world.select(s); return; }
      if (world.selected && ray.ray.intersectPlane(ground, hit) && Math.abs(hit.x) < BOUNDS.x && Math.abs(hit.z) < BOUNDS.z) world.sendTo(hit.x, hit.z);
      else if (world.selected) world.deselect();
    };
    const onDbl = (e: MouseEvent) => { aim(e); pickSheep()?.doTrick('spin'); };

    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest?.('input, textarea')) return;
      const k = e.key.toLowerCase(), mod = e.ctrlKey || e.metaKey;
      Sfx.unlock();
      if (mod && k === 'z') { e.preventDefault(); if (e.shiftKey) world.redo(); else world.undo(); return; }
      if (mod && k === 'y') { e.preventDefault(); world.redo(); return; }
      if (mod && k === 'd') { e.preventDefault(); world.duplicate(); return; }
      if (mod) return;
      if (k === 'n') { world.spawn(); return; }
      if (!world.selected) return;
      const mk = MOVE_KEYS[k];
      if (mk) { e.preventDefault(); world.keys[mk] = true; world.startRiding(); return; }
      switch (k) {
        case ' ': e.preventDefault(); world.trick('ollie'); break;
        case 'f': world.trick('kickflip'); break;
        case 'e': world.trick('spin'); break;
        case '1': world.setState('idle'); break;
        case '2': world.setState('cruise'); break;
        case '3': world.setState('grind'); break;
        case 'delete': case 'backspace': world.remove(); break;
        case 'escape': world.deselect(); break;
      }
    };
    const onKeyUp = (e: KeyboardEvent) => { const mk = MOVE_KEYS[e.key.toLowerCase()]; if (mk) world.keys[mk] = false; };
    const onBlur = () => { for (const k in world.keys) world.keys[k] = false; };

    el.addEventListener('pointermove', onMove); el.addEventListener('pointerdown', onDown); el.addEventListener('pointerup', onUp); el.addEventListener('dblclick', onDbl);
    addEventListener('keydown', onKey); addEventListener('keyup', onKeyUp); addEventListener('blur', onBlur);
    return () => {
      el.removeEventListener('pointermove', onMove); el.removeEventListener('pointerdown', onDown); el.removeEventListener('pointerup', onUp); el.removeEventListener('dblclick', onDbl);
      removeEventListener('keydown', onKey); removeEventListener('keyup', onKeyUp); removeEventListener('blur', onBlur);
    };
  }, [gl, camera]);

  return <primitive object={world.group} />;
}
