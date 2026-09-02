import { s } from '../styles/theme';

/** Renders a keyboard key / literal input string as a <kbd>-styled chip. */
export function Key({ k }: { k: string }) {
  return <kbd style={s.code}>{k}</kbd>;
}
