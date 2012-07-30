# TOC
   - [Given foo requires module bar with bar() that returns "bar" and the path module](#given-foo-requires-module-bar-with-bar-that-returns-bar-and-the-path-module)
     - [When I resolve foo with original bar as foo and resolve foo with barber stub as foober.](#given-foo-requires-module-bar-with-bar-that-returns-bar-and-the-path-module-when-i-resolve-foo-with-original-bar-as-foo-and-resolve-foo-with-barber-stub-as-foober)
       - [foo's bar is unchanged](#given-foo-requires-module-bar-with-bar-that-returns-bar-and-the-path-module-when-i-resolve-foo-with-original-bar-as-foo-and-resolve-foo-with-barber-stub-as-foober-foos-bar-is-unchanged)
       - [only stubbed modules have overrides in foober](#given-foo-requires-module-bar-with-bar-that-returns-bar-and-the-path-module-when-i-resolve-foo-with-original-bar-as-foo-and-resolve-foo-with-barber-stub-as-foober-only-stubbed-modules-have-overrides-in-foober)
       - [when I override keys of stubs after resolve](#given-foo-requires-module-bar-with-bar-that-returns-bar-and-the-path-module-when-i-resolve-foo-with-original-bar-as-foo-and-resolve-foo-with-barber-stub-as-foober-when-i-override-keys-of-stubs-after-resolve)
         - [and then delete overrides of stubs after resolve](#given-foo-requires-module-bar-with-bar-that-returns-bar-and-the-path-module-when-i-resolve-foo-with-original-bar-as-foo-and-resolve-foo-with-barber-stub-as-foober-when-i-override-keys-of-stubs-after-resolve-and-then-delete-overrides-of-stubs-after-resolve)
     - [When foo.bigExt() returns capitalized path.extname and foo.bigBas() returns capitalized path.basename](#given-foo-requires-module-bar-with-bar-that-returns-bar-and-the-path-module-when-foobigext-returns-capitalized-pathextname-and-foobigbas-returns-capitalized-pathbasename)
       - [and path.extname(file) is stubbed to return "override " + file](#given-foo-requires-module-bar-with-bar-that-returns-bar-and-the-path-module-when-foobigext-returns-capitalized-pathextname-and-foobigbas-returns-capitalized-pathbasename-and-pathextnamefile-is-stubbed-to-return-override---file)
         - [and callThru was not changed globally or for path module](#given-foo-requires-module-bar-with-bar-that-returns-bar-and-the-path-module-when-foobigext-returns-capitalized-pathextname-and-foobigbas-returns-capitalized-pathbasename-and-pathextnamefile-is-stubbed-to-return-override---file-and-callthru-was-not-changed-globally-or-for-path-module)
         - [and callThru is turned off for path module](#given-foo-requires-module-bar-with-bar-that-returns-bar-and-the-path-module-when-foobigext-returns-capitalized-pathextname-and-foobigbas-returns-capitalized-pathbasename-and-pathextnamefile-is-stubbed-to-return-override---file-and-callthru-is-turned-off-for-path-module)
         - [and callThru was turned off globally](#given-foo-requires-module-bar-with-bar-that-returns-bar-and-the-path-module-when-foobigext-returns-capitalized-pathextname-and-foobigbas-returns-capitalized-pathbasename-and-pathextnamefile-is-stubbed-to-return-override---file-and-callthru-was-turned-off-globally)
           - [and not changed for path module](#given-foo-requires-module-bar-with-bar-that-returns-bar-and-the-path-module-when-foobigext-returns-capitalized-pathextname-and-foobigbas-returns-capitalized-pathbasename-and-pathextnamefile-is-stubbed-to-return-override---file-and-callthru-was-turned-off-globally-and-not-changed-for-path-module)
           - [and turned back on for path module](#given-foo-requires-module-bar-with-bar-that-returns-bar-and-the-path-module-when-foobigext-returns-capitalized-pathextname-and-foobigbas-returns-capitalized-pathbasename-and-pathextnamefile-is-stubbed-to-return-override---file-and-callthru-was-turned-off-globally-and-turned-back-on-for-path-module)
           - [and turned back on globally](#given-foo-requires-module-bar-with-bar-that-returns-bar-and-the-path-module-when-foobigext-returns-capitalized-pathextname-and-foobigbas-returns-capitalized-pathbasename-and-pathextnamefile-is-stubbed-to-return-override---file-and-callthru-was-turned-off-globally-and-turned-back-on-globally)
<a name="" />
 
<a name="given-foo-requires-module-bar-with-bar-that-returns-bar-and-the-path-module" />
# Given foo requires module bar with bar() that returns "bar" and the path module
<a name="given-foo-requires-module-bar-with-bar-that-returns-bar-and-the-path-module-when-i-resolve-foo-with-original-bar-as-foo-and-resolve-foo-with-barber-stub-as-foober" />
## When I resolve foo with original bar as foo and resolve foo with barber stub as foober.
foo is required 2 times.

```js
assert.equal(stats.fooRequires(), 2);
```

<a name="given-foo-requires-module-bar-with-bar-that-returns-bar-and-the-path-module-when-i-resolve-foo-with-original-bar-as-foo-and-resolve-foo-with-barber-stub-as-foober-foos-bar-is-unchanged" />
### foo's bar is unchanged
foo.bigBar() == "BAR".

```js
assert.equal(foo.bigBar(), 'BAR');
```

<a name="given-foo-requires-module-bar-with-bar-that-returns-bar-and-the-path-module-when-i-resolve-foo-with-original-bar-as-foo-and-resolve-foo-with-barber-stub-as-foober-only-stubbed-modules-have-overrides-in-foober" />
### only stubbed modules have overrides in foober
foober.bigBar() == "BARBER".

```js
assert.equal(foober.bigBar(), 'BARBER');
```

foober.bigExt("/folder/test.ext") == ".EXT".

```js
assert.equal(foober.bigExt(file), '.EXT');
```

foober.bigBas("/folder/test.ext") == "TEST.EXT".

```js
assert.equal(foober.bigBas(file), 'TEST.EXT');
```

<a name="given-foo-requires-module-bar-with-bar-that-returns-bar-and-the-path-module-when-i-resolve-foo-with-original-bar-as-foo-and-resolve-foo-with-barber-stub-as-foober-when-i-override-keys-of-stubs-after-resolve" />
### when I override keys of stubs after resolve
overrides behavior when module is required inside function call.

```js
assert.equal(foober.bigBar(), 'FRISEUR');
```

overrides behavior when module is required on top of file.

```js
assert.equal(foober.bigRab(), 'RABARBER');
```

<a name="given-foo-requires-module-bar-with-bar-that-returns-bar-and-the-path-module-when-i-resolve-foo-with-original-bar-as-foo-and-resolve-foo-with-barber-stub-as-foober-when-i-override-keys-of-stubs-after-resolve-and-then-delete-overrides-of-stubs-after-resolve" />
#### and then delete overrides of stubs after resolve
reverts to original behavior when module is required inside function call.

```js
assert.equal(foober.bigBar(), 'BAR');
```

doesn't properly revert to original behavior when module is required on top of file .

```js
assert.throws(foober.bigRab);
```

<a name="given-foo-requires-module-bar-with-bar-that-returns-bar-and-the-path-module-when-foobigext-returns-capitalized-pathextname-and-foobigbas-returns-capitalized-pathbasename" />
## When foo.bigExt() returns capitalized path.extname and foo.bigBas() returns capitalized path.basename
<a name="given-foo-requires-module-bar-with-bar-that-returns-bar-and-the-path-module-when-foobigext-returns-capitalized-pathextname-and-foobigbas-returns-capitalized-pathbasename-and-pathextnamefile-is-stubbed-to-return-override---file" />
### and path.extname(file) is stubbed to return "override " + file
<a name="given-foo-requires-module-bar-with-bar-that-returns-bar-and-the-path-module-when-foobigext-returns-capitalized-pathextname-and-foobigbas-returns-capitalized-pathbasename-and-pathextnamefile-is-stubbed-to-return-override---file-and-callthru-was-not-changed-globally-or-for-path-module" />
#### and callThru was not changed globally or for path module
foo.bigExt(file) == "OVERRIDE /FOLDER/TEST.EXT".

```js
assert.equal(foo.bigExt(file), 'OVERRIDE /FOLDER/TEST.EXT');
```

foo.bigBas(file) == "TEST.EXT".

```js
assert.equal(foo.bigBas(file), 'TEST.EXT');
```

<a name="given-foo-requires-module-bar-with-bar-that-returns-bar-and-the-path-module-when-foobigext-returns-capitalized-pathextname-and-foobigbas-returns-capitalized-pathbasename-and-pathextnamefile-is-stubbed-to-return-override---file-and-callthru-is-turned-off-for-path-module" />
#### and callThru is turned off for path module
foo.bigExt(file) == "OVERRIDE /FOLDER/TEST.EXT".

```js
assert.equal(foo.bigExt(file), 'OVERRIDE /FOLDER/TEST.EXT');
```

foo.bigBas(file) throws.

```js
assert.throws(foo.bigBas);
```

<a name="given-foo-requires-module-bar-with-bar-that-returns-bar-and-the-path-module-when-foobigext-returns-capitalized-pathextname-and-foobigbas-returns-capitalized-pathbasename-and-pathextnamefile-is-stubbed-to-return-override---file-and-callthru-was-turned-off-globally" />
#### and callThru was turned off globally
<a name="given-foo-requires-module-bar-with-bar-that-returns-bar-and-the-path-module-when-foobigext-returns-capitalized-pathextname-and-foobigbas-returns-capitalized-pathbasename-and-pathextnamefile-is-stubbed-to-return-override---file-and-callthru-was-turned-off-globally-and-not-changed-for-path-module" />
##### and not changed for path module
foo.bigExt(file) == "OVERRIDE /FOLDER/TEST.EXT".

```js
assert.equal(foo.bigExt(file), 'OVERRIDE /FOLDER/TEST.EXT');
```

foo.bigBas(file) throws.

```js
assert.throws(foo.bigBas);
```

<a name="given-foo-requires-module-bar-with-bar-that-returns-bar-and-the-path-module-when-foobigext-returns-capitalized-pathextname-and-foobigbas-returns-capitalized-pathbasename-and-pathextnamefile-is-stubbed-to-return-override---file-and-callthru-was-turned-off-globally-and-turned-back-on-for-path-module" />
##### and turned back on for path module
foo.bigExt(file) == "OVERRIDE /FOLDER/TEST.EXT".

```js
assert.equal(foo.bigExt(file), 'OVERRIDE /FOLDER/TEST.EXT');
```

foo.bigBas(file) == "TEST.EXT".

```js
assert.equal(foo.bigBas(file), 'TEST.EXT');
```

<a name="given-foo-requires-module-bar-with-bar-that-returns-bar-and-the-path-module-when-foobigext-returns-capitalized-pathextname-and-foobigbas-returns-capitalized-pathbasename-and-pathextnamefile-is-stubbed-to-return-override---file-and-callthru-was-turned-off-globally-and-turned-back-on-globally" />
##### and turned back on globally
foo.bigExt(file) == "OVERRIDE /FOLDER/TEST.EXT".

```js
assert.equal(foo.bigExt(file), 'OVERRIDE /FOLDER/TEST.EXT');
```

foo.bigBas(file) == "TEST.EXT".

```js
assert.equal(foo.bigBas(file), 'TEST.EXT');
```

