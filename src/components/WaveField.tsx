import { Canvas, Picture, Skia, useClock } from '@shopify/react-native-skia';
import { useMemo } from 'react';
import { useDerivedValue } from 'react-native-reanimated';

const SPACING = 12;
const BAND = 118;
const PAUSE = 280;
const STRIDE = 6;

function buildWaves(width: number, height: number) {
  const packed: number[] = [];
  let cursor = 0;
  for (let pass = 0; pass < 12; pass += 1) {
    const theta = Math.random() * Math.PI * 2;
    const dirX = Math.cos(theta);
    const dirY = Math.sin(theta);
    const min = Math.min(0, width * dirX, height * dirY, width * dirX + height * dirY);
    const max = Math.max(0, width * dirX, height * dirY, width * dirX + height * dirY);
    const duration = 3400 + Math.random() * 400;
    packed.push(dirX, dirY, min - BAND * 1.5, max - min + BAND * 3, duration, cursor);
    cursor += duration + PAUSE;
  }
  return { packed, cycle: cursor };
}

export function WaveField({
  width,
  height,
  centerY,
}: {
  width: number;
  height: number;
  centerY: number;
}) {
  const clock = useClock();
  const dots = useMemo(() => {
    const centerX = width / 2;
    const startX = (width - Math.floor(width / SPACING) * SPACING) / 2;
    const points: number[] = [];
    for (let y = SPACING / 2; y < height; y += SPACING) {
      for (let x = startX; x <= width; x += SPACING) {
        if (Math.hypot(x - centerX, y - centerY) > 42) points.push(x, y);
      }
    }
    return points;
  }, [width, height, centerY]);
  const waves = useMemo(() => buildWaves(width, height), [width, height]);

  const picture = useDerivedValue(() => {
    const recorder = Skia.PictureRecorder();
    const canvas = recorder.beginRecording(Skia.XYWHRect(0, 0, width, height));
    const paint = Skia.Paint();
    const color = new Float32Array(4);
    paint.setAntiAlias(true);

    const time = clock.value % waves.cycle;
    let dirX = 0;
    let dirY = 0;
    let wavePos = 0;
    let active = false;
    for (let index = 0; index < waves.packed.length; index += STRIDE) {
      const startAt = waves.packed[index + 5];
      const duration = waves.packed[index + 4];
      if (time < startAt || time >= startAt + duration) continue;
      dirX = waves.packed[index];
      dirY = waves.packed[index + 1];
      const start = waves.packed[index + 2];
      const distance = waves.packed[index + 3];
      wavePos = start + distance * ((time - startAt) / duration);
      active = true;
      break;
    }

    for (let index = 0; index < dots.length; index += 2) {
      const baseX = dots[index];
      const baseY = dots[index + 1];
      let intensity = 0;
      if (active) {
        const distance = Math.abs(baseX * dirX + baseY * dirY - wavePos);
        if (distance < BAND) {
          const norm = distance / BAND;
          intensity = Math.exp(-(norm * 2) * (norm * 2));
        }
      }
      color[0] = (140 + (38 - 140) * intensity) / 255;
      color[1] = (166 + (122 - 166) * intensity) / 255;
      color[2] = (158 + (99 - 158) * intensity) / 255;
      color[3] = 0.22 + (0.6 - 0.22) * intensity;
      paint.setColor(color);
      canvas.drawCircle(
        baseX + dirX * intensity * 0.45,
        baseY + dirY * intensity * 0.45,
        0.95 + intensity * 0.62,
        paint
      );
    }

    return recorder.finishRecordingAsPicture();
  });

  return (
    <Canvas style={{ width, height }} pointerEvents="none">
      <Picture picture={picture} />
    </Canvas>
  );
}
