'use strict';

const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;

const CategorySchema = new Schema({
	name: { type: String, trim: true, required: true },
	description: { type: String },

	path: { type: String, required: true },

	_parent: { type: Schema.Types.ObjectId, ref: 'CategorySchema', require: true },
	_children: [{ type: Schema.Types.ObjectId, ref: 'CategorySchema' }],
	_articles: [{ type: Schema.Types.ObjectId, ref: 'ArticleSchema' }],

	_usersMerged: [{ type: Schema.Types.ObjectId, ref: 'UserSchema' }],

	childrenNames: [{ type: String, default: [] }],
	artilesTitles: [{ type: String }],

	domainKnowledge: { type: String }
});

var CategoryModel = Mongoose.model('category', CategorySchema);

module.exports = CategoryModel;