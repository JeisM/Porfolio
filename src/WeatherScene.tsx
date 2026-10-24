import type { CSSProperties } from 'react';

export type Scene = 'sunny' | 'clouds' | 'winter' | 'autumn' | 'mist';

const landscapes: { file: string; scenes: Scene[] }[] = [
  { file: 'weather-landscape.png', scenes: ['clouds', 'mist'] },
  { file: 'weather-sunny.jpg', scenes: ['sunny'] },
  { file: 'weather-winter.jpg', scenes: ['winter'] },
  { file: 'weather-autumn.jpg', scenes: ['autumn'] },
];

/** Distinct seasonal backdrops with independent clouds, snow, leaves, and mist. */
export function WeatherScene({ scene, paused }: { scene: Scene; paused: boolean }) {
  return (
    <div className={`weather-scene scene-${scene}${paused ? ' is-paused' : ''}`} aria-hidden="true">
      {landscapes.map(({ file, scenes }) => <div key={file}
        className={`weather-landscape${scenes.includes(scene) ? ' is-active' : ''}`}
        style={{ backgroundImage: `url('/${file}')` }} />)}
      <div className="weather-color" />
      <div className="weather-sun" />
      <div className="weather-cloud cloud-distant" />
      <div className="weather-cloud cloud-near" />
      <div className="weather-snow">
        {Array.from({ length: 64 }, (_, index) => (
          <i key={index} style={{
            '--particle-x': `${(index * 37.71) % 100}%`,
            '--particle-delay': `${-(index * 1.37) % 16}s`,
            '--particle-duration': `${7 + (index % 7) * 1.5}s`,
            '--particle-size': `${2 + (index % 5) * 1.2}px`,
            '--particle-opacity': 0.35 + (index % 4) * 0.18,
          } as CSSProperties} />
        ))}
      </div>
      <div className="weather-leaves">
        {Array.from({ length: 24 }, (_, index) => (
          <i key={index} style={{
            '--particle-x': `${(index * 41.71) % 100}%`,
            '--particle-delay': `${-(index * 1.73) % 20}s`,
            '--particle-duration': `${10 + (index % 6) * 1.8}s`,
            '--particle-size': `${12 + (index % 5) * 4}px`,
            '--leaf-color': ['#d78024', '#b94f21', '#e6aa37', '#bd6c23'][index % 4],
          } as CSSProperties} />
        ))}
      </div>
      <div className="weather-mist mist-distant" />
      <div className="weather-mist mist-near" />
      <div className="weather-readability" />
    </div>
  );
}
