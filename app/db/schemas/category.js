'use strict';

const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;

const CategorySchema = new Schema({
	name: { type: String, trim: true, required: true },
	description: { type: String },

	path: { type: String, required: true },

	_parent: { type: Schema.Types.ObjectId, ref: 'category' },
	_children: [{ type: Schema.Types.ObjectId, ref: 'category' }],
	_articles: [{ type: Schema.Types.ObjectId, ref: 'article' }],

	childrenNames: [{ type: String, default: [] }],
	articlesNames: [{ type: String, default: [] }],

	domainKnowledge: { type: String }
});

const CategoryModel = Mongoose.model('category', CategorySchema);

module.exports = CategoryModel;