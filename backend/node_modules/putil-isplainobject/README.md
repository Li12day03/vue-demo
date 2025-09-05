# putil-isplainobject

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![Build Status][travis-image]][travis-url]
[![Test Coverage][coveralls-image]][coveralls-url]
[![Dependencies][dependencies-image]][dependencies-url]
[![DevDependencies][devdependencies-image]][devdependencies-url]

Simple and lightweight utility for checking given object is plain

## Installation

  - `npm install putil-isplainobject --save`

## Usage


```javascript
const isplainobject = require('putil-isplainobject');


console.log( isplainobject({a: 1})); // true
console.log( isplainobject(1)); // false
console.log( isplainobject('a')); // false
console.log( isplainobject(new MyClass())); // false
console.log( isplainobject(MyClass)); // false
```

## Node Compatibility

  - node `>= 6.x`;
  
### License
[MIT](LICENSE)

[npm-image]: https://img.shields.io/npm/v/putil-isplainobject.svg
[npm-url]: https://npmjs.org/package/putil-isplainobject
[travis-image]: https://img.shields.io/travis/panates/putil-isplainobject/master.svg
[travis-url]: https://travis-ci.org/panates/putil-isplainobject
[coveralls-image]: https://img.shields.io/coveralls/panates/putil-isplainobject/master.svg
[coveralls-url]: https://coveralls.io/r/panates/putil-isplainobject
[downloads-image]: https://img.shields.io/npm/dm/putil-isplainobject.svg
[downloads-url]: https://npmjs.org/package/putil-isplainobject
[gitter-image]: https://badges.gitter.im/panates/putil-isplainobject.svg
[gitter-url]: https://gitter.im/panates/putil-isplainobject?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge
[dependencies-image]: https://david-dm.org/panates/putil-isplainobject/status.svg
[dependencies-url]:https://david-dm.org/panates/putil-isplainobject
[devdependencies-image]: https://david-dm.org/panates/putil-isplainobject/dev-status.svg
[devdependencies-url]:https://david-dm.org/panates/putil-isplainobject?type=dev
[quality-image]: http://npm.packagequality.com/shield/putil-isplainobject.png
[quality-url]: http://packagequality.com/#?package=putil-isplainobject
