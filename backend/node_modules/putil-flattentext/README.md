# putil-flattentext

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![Build Status][travis-image]][travis-url]
[![Test Coverage][coveralls-image]][coveralls-url]
[![Dependencies][dependencies-image]][dependencies-url]
[![DevDependencies][devdependencies-image]][devdependencies-url]

Simple utility that manipulates \t \b \r characters and converts it to space characters, or ignores them and results single line text.
Very useful for pretty printing support. 


## Installation

  - `npm install putil-flattentext --save`

## Usage

`flattentext(str, options)`


```javascript
const flattenText = require('./');
let text =
    'aaa\n'+
    '\tbbb\n'+
    '\t\tccc\n'+
    '\bddd\r'+
    'eee';
console.log(flattenText(text, {
  indent: 2, // default
  noWrap: false, // default
}));
```
Result output
```
aaa
  bbb
      ccc
    ddd
eee
```

```javascript
const flattenText = require('./');
let text =
    'select \n\t(\n\t'+
    'name,\n'+
    'address\n'+
    '\b) from x \r'+
    'where ...';
console.log(flattenText(text, {
  noWrap: true, // default
}));
```
Result output
```
select (name, address) from x where ...
```

## Node Compatibility

  - node `>= 6.x`;
  
### License
[MIT](LICENSE)

[npm-image]: https://img.shields.io/npm/v/putil-flattentext.svg
[npm-url]: https://npmjs.org/package/putil-flattentext
[travis-image]: https://img.shields.io/travis/panates/putil-flattentext/master.svg
[travis-url]: https://travis-ci.org/panates/putil-flattentext
[coveralls-image]: https://img.shields.io/coveralls/panates/putil-flattentext/master.svg
[coveralls-url]: https://coveralls.io/r/panates/putil-flattentext
[downloads-image]: https://img.shields.io/npm/dm/putil-flattentext.svg
[downloads-url]: https://npmjs.org/package/putil-flattentext
[gitter-image]: https://badges.gitter.im/panates/putil-flattentext.svg
[gitter-url]: https://gitter.im/panates/putil-flattentext?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge
[dependencies-image]: https://david-dm.org/panates/putil-flattentext/status.svg
[dependencies-url]:https://david-dm.org/panates/putil-flattentext
[devdependencies-image]: https://david-dm.org/panates/putil-flattentext/dev-status.svg
[devdependencies-url]:https://david-dm.org/panates/putil-flattentext?type=dev
[quality-image]: http://npm.packagequality.com/shield/putil-flattentext.png
[quality-url]: http://packagequality.com/#?package=putil-flattentext
