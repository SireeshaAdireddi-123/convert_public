var Serializer = require('./../../../../../../aws/dynamo/schema/serialization/Serializer');

var TableBuilder = require('./../../../../../../aws/dynamo/schema/builders/TableBuilder');
var DataType = require('./../../../../../../aws/dynamo/schema/definitions/DataType');
var KeyType = require('./../../../../../../aws/dynamo/schema/definitions/KeyType');

describe('When a Serializer with a table that has "firstName" and "age" attributes', function() {
	'use strict';

	var table;

	beforeEach(function() {
		table = TableBuilder.withName('irrelevant')
			.withAttribute('firstName', DataType.STRING, KeyType.HASH)
			.withAttribute('age', DataType.NUMBER)
			.table;
	});

	describe('and { firstName: "Imogen", age: 3 } is serialized', function() {
		var serialized;

		beforeEach(function() {
			serialized = Serializer.serialize({firstName: 'Imogen', age: 3}, table);
		});

		it('the result should have an "firstName.S" property with a value of "Imogen"', function() {
			expect(serialized.firstName && serialized.firstName.S).toEqual("Imogen");
		});

		it('the result should have an "age.N" property with a value of "3"', function() {
			expect(serialized.age && serialized.age.N).toEqual("3");
		});
	});

	describe('and { firstName: { S: "Imogen" }, age: { N: "3" } } is deserialized', function() {
		var deserialized;

		beforeEach(function() {
			deserialized = Serializer.deserialize({ firstName: { S: 'Imogen' }, age: { N: '3' } }, table);
		});

		it('the result "firstName" property with a value of "Imogen"', function() {
			expect(deserialized && deserialized.firstName).toEqual("Imogen");
		});

		it('the result an "age" property with a value of 3', function() {
			expect(deserialized && deserialized.age).toEqual(3);
		});
	});
});


describe('When a Serializer with a table that has "person.name" and "person.age" attributes', function() {
	'use strict';

	var table;

	beforeEach(function() {
		table = TableBuilder.withName('irrelevant')
			.withAttribute('person.firstName', DataType.STRING, KeyType.HASH)
			.withAttribute('person.age', DataType.NUMBER)
			.table;
	});

	describe('and { person: { firstName: "Imogen", age: 3  } } is serialized', function() {
		var serialized;

		beforeEach(function() {
			serialized = Serializer.serialize({ person: { firstName: 'Imogen', age: 3} }, table);
		});

		it('the result should have an "firstName.S" property with a value of "Imogen"', function() {
			expect(serialized['person.firstName'] && serialized['person.firstName'].S).toEqual("Imogen");
		});

		it('the result should have an "age.N" property with a value of "3"', function() {
			expect(serialized['person.age'] && serialized['person.age'].N).toEqual("3");
		});
	});

	describe('and { "person.firstName": { S: "Imogen" }, "person.age": { N: "3" } } is deserialized', function() {
		var deserialized;

		beforeEach(function() {
			deserialized = Serializer.deserialize({ 'person.firstName': { S: 'Imogen' }, 'person.age': { N: '3' } }, table);
		});

		it('the result should have a "person" property', function() {
			expect(deserialized.hasOwnProperty('person')).toEqual(true);
		});

		it('the result "person.firstName" property with a value of "Imogen"', function() {
			expect(deserialized && deserialized.person && deserialized.person.firstName).toEqual("Imogen");
		});

		it('the result an "age" property with a value of 3', function() {
			expect(deserialized && deserialized.person && deserialized.person.age).toEqual(3);
		});
	});
});