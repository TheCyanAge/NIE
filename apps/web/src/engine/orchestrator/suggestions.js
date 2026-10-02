/**
 * Prompt suggestions for the Brainstorm composer.
 * The "Try: …" starter appears only while the conversation is empty. Once NIE has replied, suggestions are
 * contextual to what was just said, so the UI never looks stuck in a demo state.
 */

export const STARTER = { label: "Try: A magician's murder mystery set in a failing theatre", text: "A magician is murdered backstage at a failing theatre, and everyone in the cast had a reason." };

export function nextSuggestions({ intent, project }) {
  const wp = project.conversation.workingPremise ?? {};
  const who = wp.characters?.[0];
  const hasRules = (project.rules ?? []).length > 0;
  const add = { label: 'Add more details', text: 'Let me add more details: ' };

  switch (intent?.type) {
    case 'start-from-zero':
      return [{ label: 'It starts with a person', text: 'It starts with a person: ' }, { label: 'It starts with a place', text: 'It starts with a place: ' }, { label: 'It starts with a feeling', text: 'It starts with a feeling: ' }];
    case 'share-premise':
      return [add, who ? { label: `What does the ${who} want?`, text: `The ${who} wants ` } : { label: 'Who is it about?', text: 'It is about ' }, { label: 'What goes wrong?', text: 'What goes wrong is ' }];
    case 'direction-change':
      return [{ label: 'Keep the earlier emotional core', text: 'I want to keep the emotional core: ' }, { label: 'Who knows first?', text: 'Who should find out first, the character or the reader?' }, add];
    case 'craft-question':
      return [{ label: 'How would that work in my story?', text: 'How would that work in my story?' }, { label: 'When is it a bad idea?', text: 'When is that a bad idea?' }];
    case 'request-edit':
    case 'request-write':
      return [{ label: 'Talk it through instead', text: "Here's what's bothering me about it: " }, hasRules ? { label: 'Check my rules', text: '' } : { label: 'Add a rule in Full Scan', text: '' }];
    case 'feedback-request':
      return [{ label: 'What should the reader feel?', text: 'I want the reader to feel ' }, add];
    default:
      return [add, { label: 'What if…', text: 'What if ' }];
  }
}
