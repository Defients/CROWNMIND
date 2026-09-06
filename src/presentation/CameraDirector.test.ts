import { describe, it, expect, vi } from 'vitest';
import { CameraDirector } from './CameraDirector';
import type { Camera } from '../render/Camera';
import type { PresentationEvent } from './events';
const event = (priority: number, x: number): PresentationEvent => ({
  id: `${priority}`,
  kind: 'raid',
  priority,
  title: `event-${priority}`,
  detail: '',
  day: 1,
  target: { x, y: 10 },
});
const camera = () =>
  ({ x: 0, y: 0, easeTo: vi.fn(), cancelDirectorShot: vi.fn() }) as unknown as Camera;
describe('camera authority', () => {
  it('chooses higher priority and observes a shot cooldown', () => {
    const d = new CameraDirector(),
      c = camera();
    d.ingest([event(45, 10), event(90, 20)]);
    expect(d.update(0.01, c, true, false, false, false)).toBe('event-90');
    expect(c.easeTo).toHaveBeenCalledWith(20, 10, true);
    d.update(1, c, true, false, false, false);
    expect(c.easeTo).toHaveBeenCalledTimes(1);
  });
  it('manual control discards pending events and prevents camera takeover for 12 seconds', () => {
    const d = new CameraDirector(),
      c = camera();
    d.ingest([event(90, 20)]);
    d.suspend();
    d.ingest([event(100, 30)]);
    expect(d.update(11, c, true, false, false, false)).toContain('Manual priority');
    d.update(2, c, true, false, false, false);
    expect(c.easeTo).not.toHaveBeenCalled();
    d.ingest([event(90, 20)]);
    d.update(0.1, c, true, false, false, false);
    expect(c.easeTo).toHaveBeenCalledOnce();
  });
  it.each(['follow', 'workspace', 'reduced', 'manual'])('does not reframe during %s', (mode) => {
    const d = new CameraDirector(),
      c = camera();
    d.ingest([event(90, 20)]);
    d.update(1, c, mode !== 'manual', mode === 'follow', mode === 'workspace', mode === 'reduced');
    expect(c.easeTo).not.toHaveBeenCalled();
    expect(c.cancelDirectorShot).toHaveBeenCalledOnce();
  });
  it('discards stale suggestions instead of revisiting an old event', () => {
    const d = new CameraDirector(),
      c = camera();
    d.ingest([event(90, 20)]);
    d.update(11, c, true, false, false, false);
    expect(c.easeTo).not.toHaveBeenCalled();
  });
});
