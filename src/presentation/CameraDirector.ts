import type { Camera } from '../render/Camera';
import type { PresentationEvent } from './events';

export class CameraDirector {
  private time = 0;
  private manualUntil = 0;
  private nextShot = 0;
  private queue: { event: PresentationEvent; expires: number }[] = [];
  private caption = 'Observing the realm';
  suspend(seconds = 12): void {
    this.manualUntil = this.time + seconds;
    this.queue = [];
  }
  ingest(events: PresentationEvent[]): void {
    if (this.time < this.manualUntil) return;
    for (const event of events)
      if (event.target && event.priority >= 45) this.queue.push({ event, expires: this.time + 10 });
    this.queue.sort((a, b) => b.event.priority - a.event.priority);
    this.queue.length = Math.min(this.queue.length, 12);
  }
  update(
    dt: number,
    camera: Camera,
    enabled: boolean,
    following: boolean,
    blocked: boolean,
    reducedMotion: boolean
  ): string {
    this.time += dt;
    this.queue = this.queue.filter((e) => e.expires > this.time);
    // Yield the in-flight shot too; stopping suggestions alone still lets an old pan run.
    if (!enabled || following || blocked || reducedMotion || this.time < this.manualUntil)
      camera.cancelDirectorShot();
    if (!enabled) {
      this.queue = [];
      return 'Manual camera';
    }
    if (following) return 'Following selected';
    if (blocked) {
      this.queue = [];
      return 'Director held · workspace open';
    }
    if (reducedMotion) {
      this.queue = [];
      return 'Director held · reduced motion';
    }
    if (this.time < this.manualUntil)
      return `Manual priority · ${Math.ceil(this.manualUntil - this.time)}s`;
    if (this.time < this.nextShot) return this.caption;
    const candidate = this.queue.shift();
    if (candidate?.event.target) {
      const { x, y } = candidate.event.target;
      const distance = Math.hypot(x - camera.x, y - camera.y);
      // Avoid reframing an event already near center or repeatedly crossing the realm for routine activity.
      if (distance > 3 && (distance < 24 || candidate.event.priority >= 80))
        camera.easeTo(x, y, true);
      this.nextShot = this.time + 7;
      this.caption = candidate.event.title;
      return this.caption;
    }
    return 'Observing the realm';
  }
}
