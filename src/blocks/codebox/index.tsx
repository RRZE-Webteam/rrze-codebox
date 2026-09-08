import { registerBlockType } from '@wordpress/blocks';
import Edit from './edit';
import metadata from './block.json';

import './style.scss';
import './editor.scss';

registerBlockType(metadata as any, {
	edit: Edit,
	save: (): null => null,
} as any);

