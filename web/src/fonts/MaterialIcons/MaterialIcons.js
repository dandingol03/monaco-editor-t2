/**
 * MaterialCommunityIcons icon set component.
 * Usage: <MaterialCommunityIcons name="icon-name" size={20} color="#4F8EF7" />
 */

import createIconSet from './lib/create-icon-set';
import glyphMap from './MaterialIcons.json';

const FontAwesome = createIconSet(glyphMap, 'Material Icons', 'MaterialIcons.ttf');

export default FontAwesome;

