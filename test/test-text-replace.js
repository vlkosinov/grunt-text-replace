"use strict";

var grunt = require('grunt');
var fs = require('fs');

exports['test-text-replace'] = {

  'Test core replacement functionality': {
    'Test string replacements': function (test) {
      test.equal(grunt.helper('text-replace', 'Hello world', 'Hello', 'Goodbye'), 'Goodbye world');
      test.notEqual(grunt.helper('text-replace', 'Hello w000rld', 'w0*rld', 'world'), 'Hello world');
      test.equal(grunt.helper('text-replace', 'Hello (*foo.)', '(*foo.)', 'world'), 'Hello world');
      test.equal(grunt.helper('text-replace', 'Hello \\foo', '\\', ''), 'Hello foo');
      test.equal(grunt.helper('text-replace', 'Foo bar bar', 'bar', 'foo'), 'Foo foo foo');
      test.equal(grunt.helper('text-replace', 'Foo bar bar', 'bar', 'Foo bar'), 'Foo Foo bar Foo bar');
      test.done();
    },

    'Test regex replacements': function (test) {
      test.equal(grunt.helper('text-replace', 'Hello world', /Hello/, 'Goodbye'), 'Goodbye world');
      test.equal(grunt.helper('text-replace', 'Hello world', /(Hello) (world)/, '$2 $1'), 'world Hello');
      test.equal(grunt.helper('text-replace', 'Foo bar bar', /bar/, 'foo'), 'Foo foo bar');
      test.equal(grunt.helper('text-replace', 'Foo bar bar', /bar/g, 'foo'), 'Foo foo foo');
      test.done();
    },  

    'Test grunt.template replacements': function (test) {
      test.equal(grunt.helper('text-replace', 'Hello world', 'world', 
        '<%= grunt.template.date("20 Nov 2012 11:30:00 GMT", "dd/mm/yy") %>'), 'Hello 20/11/12');
      test.done();
    },

    'Test function replacements': function (test) {
      test.equal(grunt.helper('text-replace', 'Hello world', 'world', 
        function (matchedWord, index, fullText, regexMatches) {
          return new Array(4).join(matchedWord);
        }), 'Hello worldworldworld');
      test.equal(grunt.helper('text-replace', 'Hello world', 'world', 
        function (matchedWord, index, fullText, regexMatches) {
          return index;
        }), 'Hello 6');
      test.equal(grunt.helper('text-replace', 'Hello world', 'Hello', 
        function (matchedWord, index, fullText, regexMatches) {
          return index;
        }), '0 world');
      test.equal(grunt.helper('text-replace', 'Hello world', 'foo', 
        function (matchedWord, index, fullText, regexMatches) {
          return index;
        }), 'Hello world');
      test.equal(grunt.helper('text-replace', 'Hello world', 'world', 
        function (matchedWord, index, fullText, regexMatches) {
          return fullText;
        }), 'Hello Hello world');
      test.equal(grunt.helper('text-replace', 'Hello world', /(Hello) (world)/g, 
        function (matchedWord, index, fullText, regexMatches) {
          return 'Place: ' + regexMatches[1] + ', Greeting: ' + regexMatches[0];
        }), 'Place: world, Greeting: Hello');
      test.equal(grunt.helper('text-replace', 'Hello world', /(Hello) (world)/g, 
        function (matchedWord, index, fullText, regexMatches) {
          return regexMatches[0] + ' <%= grunt.template.date("20 Nov 2012 11:30:00 GMT", "dd/mm/yy") %>';
        }), 'Hello 20/11/12');
      test.done();
    },

    'Test multiple replacements': function (test) {
      test.equal(grunt.helper('text-replace-multiple', 'Hello world',
        [{
          from: 'Hello',
          to: 'Hi'
        }, {
          from: 'world',
          to: 'planet'
        }]), 'Hi planet');
      test.done();
    }
  },

  'Test file handling': {
    setUp: function (done) {
      grunt.file.copy('test/text_files/test.txt', 'test/temp/testA.txt');
      grunt.file.copy('test/text_files/test.txt', 'test/temp/testB.txt');
      done();
    },
    
    tearDown: function (done) {
      fs.unlinkSync('test/temp/testA.txt');
      fs.unlinkSync('test/temp/testB.txt');
      fs.rmdirSync('test/temp');
      done();
    },

    'Test change to file specifying destination file': function (test) {
      var originalText, replacedText;
      originalText = grunt.file.read('test/temp/testA.txt');
      grunt.helper('text-replace-file', 'test/temp/testA.txt', 'test/temp/testA.txt', [{from: 'world', to: 'planet'}]);
      replacedText = grunt.file.read('test/temp/testA.txt');
      test.equal(originalText, 'Hello world');
      test.equal(replacedText, 'Hello planet');
      test.done();
    },

    'Test change to file specifying destination directory': function (test) {
      var originalText, replacedText;
      originalText = grunt.file.read('test/temp/testA.txt');
      grunt.helper('text-replace-file', 'test/temp/testA.txt', 'test/temp/', [{from: 'world', to: 'planet'}]);
      replacedText = grunt.file.read('test/temp/testA.txt');
      test.equal(originalText, 'Hello world');
      test.equal(replacedText, 'Hello planet');
      test.done();
    },

    'Test change to multiple files specifying paths': function (test) {
      var originalText, replacedTextA, replacedTextB;
      originalText = grunt.file.read('test/temp/testA.txt');
      grunt.helper('text-replace-file-multiple', ['test/temp/testA.txt', 'test/temp/testB.txt'], 'test/temp/', [{from: 'world', to: 'planet'}]);
      replacedTextA = grunt.file.read('test/temp/testA.txt');
      replacedTextB = grunt.file.read('test/temp/testB.txt');
      test.equal(originalText, 'Hello world');
      test.equal(replacedTextA, 'Hello planet');
      test.equal(replacedTextB, 'Hello planet');
      test.done();
    },

    'Test change to multiple files specifying minimatch paths': function (test) {
      var originalText, replacedTextA, replacedTextB;
      originalText = grunt.file.read('test/temp/testA.txt');
      grunt.helper('text-replace-file-multiple', ['test/temp/test*.txt'], 'test/temp/', [{from: 'world', to: 'planet'}]);
      replacedTextA = grunt.file.read('test/temp/testA.txt');
      replacedTextB = grunt.file.read('test/temp/testB.txt');
      test.equal(originalText, 'Hello world');
      test.equal(replacedTextA, 'Hello planet');
      test.equal(replacedTextB, 'Hello planet');
      test.done();
    }
  }

};