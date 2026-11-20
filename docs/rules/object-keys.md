# sort-by-length/object-keys

Sorts object literal properties by the length of the whole property, shortest first.

- Recommended config: no (included in `all`)
- Fixable: yes
- Options: `unsafeFix`

## Rule details

A property is measured as written (`key: value`, shorthand, method), collapsed to one line.

Examples of **incorrect** code:

```js
const user = { name: 'Ann', id: 1, active: true };
```

Examples of **correct** code:

```js
const user = { id: 1, name: 'Ann', active: true };
```

Spread elements and computed keys are boundaries. Properties are sorted separately before and after them.

## Options

```js
'sort-by-length/object-keys': ['warn', { unsafeFix: true }]
```

| Option | Default | Meaning |
|---|---|---|
| `unsafeFix` | `false` | Also fix objects whose property values have side effects |

## Fixing

By default the rule reports but does not fix when a property value has side effects (calls, `new`, `await`, assignments), because the evaluation order would change. A fix is also skipped when a comment sits inside the sorted range.
