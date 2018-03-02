const is = require('@barchart/common-js/lang/is'),
	assert = require('@barchart/common-js/lang/assert');

module.exports = (() => {
	'use strict';

	/**
	 * Manages compilation and transmission of the response to from a
	 * Lambda function bound to the API Gateway.
	 *
	 * @public
	 */
	class LambdaResponder {
		/**
		 * @public
		 * @param {Function} callback - The Lambda's callback.
		 */
		constructor(callback) {
			assert.argumentIsRequired(callback, 'callback', Function);

			this._headers = { };

			this.setHeader('Access-Control-Allow-Origin', '*')
				.setHeader('Access-Control-Allow-Credentials', true)
				.setHeader('Content-Type', 'application/json');

			this._callback = callback;
			this._complete = false;
		}

		/**
		 * If true, the response has already been transmitted.
		 *
		 * @public
		 * @returns {Boolean}
		 */
		get complete() {
			return this._complete;
		}

		/**
		 * Sets an HTTP header.
		 *
		 * @public
		 * @param {String} key
		 * @param {String|Number|Boolean} value
		 * @returns {LambdaResponder}
		 */
		setHeader(key, value) {
			assert.argumentIsRequired(key, 'key', String);

			if (!this.complete) {
				this._headers[key] = value;
			}

			return this;
		}

		/**
		 * Sets a response header for plain text.
		 *
		 * @public
		 * @returns {LambdaResponder}
		 */
		setPlainText() {
			return this.setHeader('Content-Type', 'text/plain');
		}

		/**
		 * Sets an error and transmit the response.
		 *
		 * @public
		 * @param {Object|String} response
		 * @param {Number=} code
		 */
		sendError(response, code) {
			if (!this.complete) {
				this.send(response, code || 500);
			}
		}

		/**
		 * Sets and transmits the response.
		 *
		 * @public
		 * @param {Object|String} response
		 * @param {Number=} code
		 */
		send(response, code) {
			if (this.complete) {
				return;
			}

			let serialized;

			if (is.object(response)) {
				serialized = JSON.stringify(response);
			} else {
				serialized = response;
			}

			const payload = {
				statusCode: code || 200,
				headers: this._headers,
				body: serialized
			};

			this._complete = true;

			this._callback(null, payload);
		}
	}

	return LambdaResponder;
})();