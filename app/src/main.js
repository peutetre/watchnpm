/*
 * main.js
 */

'use strict';

var Q = require('q'),
    Qstart = require('qstart'),
    Zanimo = require('zanimo');

function main() {
    console.log('ok');
}

Qstart.then(main);
