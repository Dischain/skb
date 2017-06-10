'use strict';

const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;

const ArticleSchema = new Schema({
	name: { type: String, trim: true, required: true },
	body: { type: String },

	path: { type: String, required: true },

	tags: [{ type: String }],

	_parent: { type: Schema.Types.ObjectId, ref: 'category', required: true }
});

const  ArticleModel = Mongoose.model('article', ArticleSchema);

module.exports = ArticleModel;