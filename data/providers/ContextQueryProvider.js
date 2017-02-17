var log4js = require('log4js');

var attributes = require('common/lang/attributes');
var is = require('common/lang/is');

var QueryProvider = require('./../QueryProvider');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('data/providers/ContextQueryProvider');

	class ContextQueryProvider extends QueryProvider {
		constructor(configuration) {
			super(configuration);
		}

		_runQuery(criteria) {
			const configuration = this._getConfiguration();

			let returnRef;

			if (is.array(configuration.properties)) {
				returnRef = configuration.properties.reduce((map, property) => {
					if (attributes.has(criteria, property)) {
						attributes.write(map, property, attributes.read(criteria, property));
					}

					return map;
				}, { });
			} else if (is.string(configuration.property)) {
				returnRef = attributes.read(criteria, configuration.property);
			} else {
				returnRef = criteria;
			}

			return returnRef;
		}

		toString() {
			return '[ContextQueryProvider]';
		}
	}

	return ContextQueryProvider;
})();