'use strict';

const SP = ' ';
const DIVISOR = '+'

/**
 * Reduce and trim spaces at string.
 *
 * Example: let str = '  hello    world  ';
 * reduceSpaces(str); // -> 'hello world'
 */
function trimSpaces(str) {
  let trimedStrig = '';
  let temp = str.trim();

  for (let i = 0; i < temp.length; i++) {
    if (temp[i] === SP) {
      if (temp[i - 1] === SP && i > 0) {
        continue;
      } else {
        trimedStrig += SP;
      }
    } else {
      trimedStrig += temp[i];
    }
  }

  return trimedStrig;
}

/**
 * Convert spaces to specified divisor symbol
 *
 * Example: let str = 'hello world';
 * convertSpacesToDivisor(str); // -> 'hello+world'
 */
 function convertSpacesToDivisor(str) {
  let convertedString = '';

  for (let i = 0; i < str.length; i++) {
  convertedString += str[i] === SP ? DIVISOR : str[i];
  }

  return convertedString;
 }

 function sanitizeName(str) {
  let trimmed = trimSpaces(str);
  let converted = convertSpacesToDivisor(trimmed);

  return converted;
 }

 function getPathToCategory(str) {
  let path = str.slice(5);
  if (path.lastIndexOf('/') != path.length - 1)
    path += '/'
  return path;
 }

function getPathToArticle(str) {
  let path = str.slice(9);
  if (path.lastIndexOf('/') != path.length - 1)
    path += '/'
  return path;
 }

 module.exports = {
  sanitizeName: sanitizeName,
  getPathToCategory: getPathToCategory,
  getPathToArticle: getPathToArticle
 }