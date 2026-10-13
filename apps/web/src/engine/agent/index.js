import { createAgent } from './agent.js';
import packs from './packs/index.js';

/** The one idea agent (its state lives in each project, `project.conversation.agent`; this object holds none). */
export const agent = createAgent({ packs });
export { createAgent, packs };
export default agent;
