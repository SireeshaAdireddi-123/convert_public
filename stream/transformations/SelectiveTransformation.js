const assert = require('common/lang/assert'),
	attributes = require('common/lang/attributes');

const Transformation = require('./Transformation');

module.exports = (() => {
	'use strict';

	/**
	 * A transformation that maintains an ordered list of {@link Transformations} and can
	 * either execute all transformations that pass the {@link Transformations#canTransform}
	 * test, or executes the first transformations that pass the {@link Transformations#canTransform}
	 * test
	 *
	 * @public
	 */
	class SelectiveTransformation extends Transformation {
		constructor(transformations, first, silent, description) {
			super((description || 'Selector Transformation'));

			assert.argumentIsArray(transformations, 'transformations', Transformation, 'Transformation');
			assert.argumentIsOptional(first, 'first', Boolean);
			assert.argumentIsOptional(silent, 'silent', Boolean);

			this._transformations = transformations;

			this._first = is.boolean(first) && boolean;
			this._silent = is.boolean(silent) && silent;

			this._synchronous = this._transformations.every(t => t.synchronous);
		}

		get synchronous() {
			return this._synchronous;
		}

		_canTransform(input) {
			return this._silent || this._transformations.some(t => t.canTransform(input));
		}

		_transform(input) {
			if (this._first) {
				const transformation = this._transformations.find(t => t.canTransform(input));

				if (transformation) {
					transformation.transform(input);
				}
			} else {
				this._transformations.filter(t => t.canTransform(input)).forEach(t => t.transform(input));
			}
		}

		toString() {
			return '[SelectiveTransformation]';
		}
	}


	return SelectiveTransformation;
})();
