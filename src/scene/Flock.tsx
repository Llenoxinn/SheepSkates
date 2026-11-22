import { useEffect } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useAppPhase } from '../game/appPhase';
import { BOUNDS } from '../game/config';
import type { ParkProp } from '../game/props';
import { Sfx } from '../game/sfx';
import type { Sheep } from '../game/sheep';
import { useUI } from '../game/store';
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
    let down: { x: number; y: number; prop: ParkProp | null; startX: number; startZ: number; dragging: boolean; offsetX: number; offsetZ: number } | null = null;

    const aim = (e: PointerEvent | MouseEvent) => {
      const r = el.getBoundingClientRect();
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, camera);
    };
    const pickSheep = (): Sheep | null => (ray.intersectObjects(world.hitTargets, false)[0]?.object.userData.sheep as Sheep | undefined) ?? null;
    const pickProp = (): ParkProp | null => (ray.intersectObjects(world.propHitTargets, false)[0]?.object.userData.prop as ParkProp | undefined) ?? null;
    const rayGround = () => ray.ray.intersectPlane(ground, hit) !== null;

    const pickEntity = (): { sheep: Sheep | null; prop: ParkProp | null } => {
      if (useUI.getState().buildMode) {
        const prop = pickProp();
        if (prop) return { sheep: null, prop };
        return { sheep: pickSheep(), prop: null };
      }
      const sheep = pickSheep();
      if (sheep) return { sheep, prop: null };
      return { sheep: null, prop: pickProp() };
    };

    const isInteractive = () => useAppPhase.getState().phase === 'playing' && !useAppPhase.getState().howToPlayOpen;

    const onMove = (e: PointerEvent) => {
      if (!isInteractive()) {
        el.style.cursor = 'default';
        return;
      }
      if (useUI.getState().draggingPalette) return;
      if (down?.prop && (useUI.getState().buildMode || down.prop === world.selectedProp)) {
        const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
        if (moved > 4 || down.dragging) {
          down.dragging = true;
          aim(e);
          if (rayGround()) {
            world.movePropLive(down.prop, hit.x - down.offsetX, hit.z - down.offsetZ);
          }
          el.style.cursor = 'grabbing';
          return;
        }
      }
      aim(e);
      const { sheep, prop } = pickEntity();
      world.setHovered(sheep);
      world.setHoveredProp(prop);
      if (world.selectedProp && world.moveMode) el.style.cursor = 'move';
      else if (sheep || prop) el.style.cursor = 'pointer';
      else if (world.selected) el.style.cursor = 'crosshair';
      else el.style.cursor = 'grab';
    };

    const onDown = (e: PointerEvent) => {
      if (!isInteractive()) return;
      Sfx.unlock();
      if (useUI.getState().draggingPalette) return;
      aim(e);
      const { prop } = pickEntity();
      const canDragProp = prop && (useUI.getState().buildMode || prop === world.selectedProp);
      let offsetX = 0, offsetZ = 0;
      if (canDragProp && rayGround()) {
        offsetX = hit.x - prop.x;
        offsetZ = hit.z - prop.z;
        world.setOrbitEnabled?.(false);
      }
      down = { x: e.clientX, y: e.clientY, prop, startX: prop?.x ?? 0, startZ: prop?.z ?? 0, dragging: false, offsetX, offsetZ };
    };

    const onUp = (e: PointerEvent) => {
      if (!down) return;
      if (!isInteractive()) {
        down = null;
        world.setOrbitEnabled?.(true);
        return;
      }
      const cur = down;
      down = null;
      world.setOrbitEnabled?.(true);

      if (cur.dragging && cur.prop) {
        world.selectProp(cur.prop);
        world.movePropCommit(cur.prop, cur.startX, cur.startZ, cur.prop.x, cur.prop.z);
        return;
      }

      const moved = Math.hypot(e.clientX - cur.x, e.clientY - cur.y);
      if (moved > 6) return; // that was an orbit drag

      aim(e);
      if (world.selectedProp && world.moveMode) {
        if (rayGround() && Math.abs(hit.x) <= BOUNDS.x && Math.abs(hit.z) <= BOUNDS.z) {
          const p = world.selectedProp;
          world.movePropCommit(p, p.x, p.z, hit.x, hit.z);
          world.toggleMoveMode(false);
          return;
        }
      }

      const { sheep, prop } = pickEntity();
      if (sheep) { world.select(sheep); return; }
      if (prop) { world.selectProp(prop); return; }

      if (world.selected && rayGround() && Math.abs(hit.x) < BOUNDS.x && Math.abs(hit.z) < BOUNDS.z) {
        world.sendTo(hit.x, hit.z);
      } else if (world.selected || world.selectedProp) {
        world.deselect();
      }
    };

    const onWinMove = (e: PointerEvent) => {
      if (!isInteractive() || !useUI.getState().draggingPalette) return;
      const r = el.getBoundingClientRect();
      const insideCanvas = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      const overUi = (e.target as HTMLElement | null)?.closest?.('.palette, .hud, #bar');
      if (!insideCanvas || overUi) {
        world.hidePalettePreview();
        return;
      }
      aim(e);
      if (rayGround() && Math.abs(hit.x) <= BOUNDS.x + 1.5 && Math.abs(hit.z) <= BOUNDS.z + 1.5) {
        world.updatePalettePreview(hit.x, hit.z);
      } else {
        world.hidePalettePreview();
      }
    };

    const onWinUp = (e: PointerEvent) => {
      if (!useUI.getState().draggingPalette) return;
      if (!isInteractive()) {
        world.cancelPaletteDrag();
        return;
      }
      const target = e.target as HTMLElement | null;
      if (target?.closest?.('.palette-item')) {
        world.finishPaletteDrag();
        return;
      }
      if (e.target === el) {
        aim(e);
        if (rayGround()) {
          world.finishPaletteDrag(hit.x, hit.z);
          return;
        }
      }
      world.cancelPaletteDrag();
    };

    const onDbl = (e: MouseEvent) => { if (!isInteractive()) return; aim(e); pickSheep()?.doTrick('spin'); };

    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest?.('input, textarea')) return;
      const app = useAppPhase.getState();
      const k = e.key.toLowerCase(), mod = e.ctrlKey || e.metaKey;
      if (app.howToPlayOpen) {
        if (k === 'escape' || k === 'h' || e.key === '?') {
          e.preventDefault();
          Sfx.unlock();
          Sfx.tick();
          app.closeHowToPlay();
        }
        return;
      }
      if (app.phase !== 'playing') return;
      Sfx.unlock();
      if (mod && k === 'z') { e.preventDefault(); if (e.shiftKey) world.redo(); else world.undo(); return; }
      if (mod && k === 'y') { e.preventDefault(); world.redo(); return; }
      if (mod && k === 'd') { e.preventDefault(); world.duplicate(); return; }
      if (mod) return;
      if (k === 'h' || e.key === '?') { e.preventDefault(); Sfx.tick(); app.toggleHowToPlay(); return; }
      if (k === 'b') { world.toggleBuildMode(); return; }
      if (k === 'm') { useUI.setState({ sound: Sfx.toggle() }); return; }
      if (k === 'n') { world.spawn(); return; }

      if (world.selectedProp) {
        switch (k) {
          case 'q': case '[': e.preventDefault(); world.rotateProp(-Math.PI / 4); break;
          case 'r': case 'e': case ']': e.preventDefault(); world.rotateProp(Math.PI / 4); break;
          case 'g': e.preventDefault(); world.toggleMoveMode(); break;
          case 'w': case 'arrowup': e.preventDefault(); world.nudgeSelectedProp(0, -0.5); break;
          case 's': case 'arrowdown': e.preventDefault(); world.nudgeSelectedProp(0, 0.5); break;
          case 'a': case 'arrowleft': e.preventDefault(); world.nudgeSelectedProp(-0.5, 0); break;
          case 'd': case 'arrowright': e.preventDefault(); world.nudgeSelectedProp(0.5, 0); break;
          case 'delete': case 'backspace': e.preventDefault(); world.remove(); break;
          case 'escape': if (world.moveMode) world.toggleMoveMode(false); else world.deselect(); break;
        }
        return;
      }

      if (!world.selected) {
        if (k === 'escape' && useUI.getState().buildMode) world.toggleBuildMode(false);
        return;
      }
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
    const onBlur = () => {
      for (const k in world.keys) world.keys[k] = false;
      down = null;
      world.setOrbitEnabled?.(true);
      world.cancelPaletteDrag();
    };

    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerdown', onDown, true);
    el.addEventListener('pointerup', onUp);
    el.addEventListener('dblclick', onDbl);
    addEventListener('pointermove', onWinMove);
    addEventListener('pointerup', onWinUp);
    addEventListener('keydown', onKey);
    addEventListener('keyup', onKeyUp);
    addEventListener('blur', onBlur);
    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerdown', onDown, true);
      el.removeEventListener('pointerup', onUp);
      el.removeEventListener('dblclick', onDbl);
      removeEventListener('pointermove', onWinMove);
      removeEventListener('pointerup', onWinUp);
      removeEventListener('keydown', onKey);
      removeEventListener('keyup', onKeyUp);
      removeEventListener('blur', onBlur);
    };
  }, [gl, camera]);

  return <primitive object={world.group} />;
}
