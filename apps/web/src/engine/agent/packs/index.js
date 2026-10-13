import story from './story.js';
import character from './character.js';
import world from './world.js';
import article from './article.js';
import essay from './essay.js';
import poem from './poem.js';
import script from './script.js';
import other from './other.js';
import forms from './forms.js';
import genres from './genres.js';

/**
 * Everything NIE knows about WHAT to ask, as data: one pack per kind of project, plus add-ons for forms (a song, a picture book, a speech...) and genres
 * (a locked-room mystery, a space opera...) that are merged in when the writer's words match (`agent/detect.js#slotsFor`). The shapes are checked by
 * `packs/schema.js` and `tests/agent-packs.test.js`.
 */
export const kinds = Object.freeze({ story, character, world, article, essay, poem, script, other });
export const packs = { kinds, forms, genres };
export default packs;
