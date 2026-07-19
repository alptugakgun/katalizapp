'use strict';

const TEST_REGEX = /^\$|\./;
const REPLACE_REGEX = /^\$|\./g;

function isPlainObject(obj) {
  return typeof obj === 'object' && obj !== null && !Array.isArray(obj);
}

function withEach(target, cb) {
  (function act(obj) {
    if (Array.isArray(obj)) {
      obj.forEach(act);
    } else if (isPlainObject(obj)) {
      Object.keys(obj).forEach(function (key) {
        const val = obj[key];
        const resp = cb(obj, val, key);
        if (resp.shouldRecurse) {
          act(obj[resp.key || key]);
        }
      });
    }
  })(target);
}

function _sanitize(target, replaceWith) {
  let isSanitized = false;

  withEach(target, function (obj, val, key) {
    let shouldRecurse = true;

    if (TEST_REGEX.test(key)) {
      isSanitized = true;
      delete obj[key];
      if (replaceWith) {
        key = key.replace(REPLACE_REGEX, replaceWith);
        if (key !== '__proto__' && key !== 'constructor' && key !== 'prototype') {
          obj[key] = val;
        }
      } else {
        shouldRecurse = false;
      }
    }

    return { shouldRecurse, key };
  });

  return { isSanitized, target };
}

function mongoSanitizeSafe(options = {}) {
  return function (req, res, next) {
    ['body', 'params', 'headers', 'query'].forEach(function (key) {
      if (req[key]) {
        const { target, isSanitized } = _sanitize(req[key], options.replaceWith);
        // CRITICAL FIX: Do not reassign req.query directly as it throws in newer Node/Express versions.
        // Instead, the _sanitize function mutates the object in-place.
        // If we strictly need to replace it, we would use a custom property.
        // Since express-mongo-sanitize mutates the object in-place, we just omit the assignment.
        // req[key] = target; <-- This line caused the crash.
      }
    });
    next();
  };
}

module.exports = mongoSanitizeSafe;
