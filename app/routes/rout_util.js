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
 * convertSpacesToDivisor(str); // -> 'hell+world'
 */
 function convertSpacesToDivisor(str) {
  let convertedString = '';

  for (let i = 0; i < str.length; i++) {
  convertedString += str[i] === SP ? DIVISOR : str[i];
  }

  return convertedString;
 }

 exports.getPathToCategory = function(str) {
  let path = str.slice(5);
  if (path.lastIndexOf('/') != path.length - 1)
    path += '/'
  return path;
 }