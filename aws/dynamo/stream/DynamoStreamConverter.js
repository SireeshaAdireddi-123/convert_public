const log4js = require('log4js'),
	Stream = require('stream');

const assert = require('common/lang/assert'),
	is = require('common/lang/is');

const DataType = require('./../schema/definitions/DataType'),
	Serializer = require('./../schema/serialization/Serializer'),
	Table = require('./../schema/definitions/Table');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('common-node/aws/dynamo/stream/DynamoStreamConverter');

	/**
	 * A Node.js stream transform which maps an object into the form
	 * needed to save it to a DynamoDB table. Specifically, the
	 * transformation outputs object with renamed properties and
	 * coerced values.
	 *
	 * @public
	 */
	class DynamoStreamConverter extends Stream.Transform {
		/**
		 * @public
		 * @param {Table} table - The desired schema.
		 * @param {Object} map - A map of property names to {@link Attribute} names.
		 * @param {Boolean=} silent - If true, errors will be suppressed, instead warnings will be written to the logs.
		 */
		constructor(table, map, silent) {
			super({ objectMode: true });

			assert.argumentIsRequired(table, 'table', Table, 'Table');
			assert.argumentIsRequired(map, 'map', Object);
			assert.argumentIsOptional(silent, 'silent', Boolean);

			this._table = table;

			const attributes = table.attributes;

			this._transforms = Object.keys(map).map((incoming) => {
				const outgoing = map[incoming];

				return {
					incoming: incoming,
					attribute: attributes.find(a => a.name === outgoing)
				};
			});

			this._silent = is.boolean(silent) && silent;
			this._counter = 0;
		}

		_transform(chunk, encoding, callback) {
			this._counter = this._counter + 1;

			let transformed = { };
			let error = null;

			if (is.object(chunk)) {
				this._transforms.every((transform) => {
					const incoming = transform.incoming;
					const outgoing = transform.attribute.name;
					const type = transform.attribute.dataType;

					if (chunk.hasOwnProperty(incoming)) {
						try {
							transformed[outgoing] = Serializer.coerce(chunk[incoming], type);
						} catch (e) {
							error = e;
						}
					} else {
						error = new Error(`Transformation [ ${this._counter} ] for [ ${this._table.name} ] failed, expected property missing.`);
					}

					return error === null;
				}, { });
			} else {
				error = new Error(`Transformation [ ${this._counter} ] for [ ${this._table.name} ] failed, unexpected input type.`);
			}

			if (error === null) {
				callback(null, transformed);
			} else {
				if (this._silent) {
					logger.warn(`Transformation [ ${this._counter} ] for [ ${this._table.name} ] failed.`);

					if (logger.isTraceEnabled() && chunk) {
						logger.trace(chunk);
					}
				} else {
					callback(error);
				}
			}
		}

		toString() {
			return '[DynamoStreamConverter]';
		}
	}

	return DynamoStreamConverter;
})();