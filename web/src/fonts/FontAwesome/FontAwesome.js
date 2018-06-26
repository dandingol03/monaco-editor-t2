/**
 * FontAwesome icon set component.
 * Usage: <FontAwesome name="icon-name" size={20} color="#4F8EF7" />
 */

import createIconSet from './lib/create-icon-set';
import glyphMap from './FontAwesome.json';

const FontAwesome = createIconSet(glyphMap, 'font-awesome', 'FontAwesome.ttf');

export default FontAwesome;

