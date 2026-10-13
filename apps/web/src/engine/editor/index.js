// The editorial instruments, in one place. See each module for what it measures and what it refuses to say.
import { analyseText, analysisKey, ANALYSIS_VERSION, fragment } from './analysis.js';
import { editorialEvidence, topicsOf } from './evidence.js';
import { readbackFrame } from './readback.js';
import { groundNames, clearGroundingCache, groundingCacheSize } from './ground.js';
import { speaksAboutTheWriter, findThirdPerson } from './voice.js';
import { standouts, listSections, castLine, styleLine } from './findings.js';

export { analyseText, analysisKey, ANALYSIS_VERSION, fragment, editorialEvidence, topicsOf, readbackFrame, groundNames, clearGroundingCache, groundingCacheSize, speaksAboutTheWriter, findThirdPerson, standouts, listSections, castLine, styleLine };

export default { analyseText, analysisKey, editorialEvidence, readbackFrame, groundNames, clearGroundingCache, clearGroundingCache, groundingCacheSize, speaksAboutTheWriter, findThirdPerson };
