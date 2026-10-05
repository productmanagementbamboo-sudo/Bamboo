import type { CSSProperties } from 'react';
import { ICON_PATHS, type IconName } from './iconPaths';

export type { IconName };

export function Icon({ name, size = 18, style }: { name: IconName; size?: number; style?: CSSProperties }) {
  return (
    <svg
      className="i"
      viewBox="0 0 24 24"
      style={{ width: size, height: size, ...style }}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: ICON_PATHS[name] }}
    />
  );
}
