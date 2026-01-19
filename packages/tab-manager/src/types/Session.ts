import type { SessionWindow } from "./SessionWindow";

export type Session = {
  windows: Record<number, SessionWindow>;
};
