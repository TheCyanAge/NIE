import { h } from './dom.js';

/** "NIE is thinking 🪶📜..." with the three dots rising in a wave (pure CSS; respects reduced motion). */
export function createThinking(label = 'NIE is thinking') {
  return h(
    'div',
    { class: 'nie-thinking', role: 'status', 'aria-live': 'polite', 'data-testid': 'thinking' },
    h('span', { class: 'nie-thinking-text' }, `${label} 🪶📜`),
    h('span', { class: 'nie-dots', 'aria-hidden': 'true' }, h('i', {}, '.'), h('i', {}, '.'), h('i', {}, '.'))
  );
}
