# sort-by-length/destructuring

Sorts object destructuring entries by length, shortest first. It works in declarations and in function parameters.

- Recommended config: no (included in `all`)
- Fixable: yes
- Options: `unsafeFix`

## Rule details

An entry is measured as written, including rename and default value (`name: alias = 'x'`).

Examples of **incorrect** code:

```js
const { description, id, title = 'none' } = props;
```

Examples of **correct** code:

```js
const { id, title = 'none', description } = props;
```

The rest element (`...rest`) is a boundary.

## Options

```js
'sort-by-length/destructuring': ['warn', { unsafeFix: true }]
```

| Option | Default | Meaning |
|---|---|---|
| `unsafeFix` | `false` | Also fix patterns whose default values have side effects |

## Fixing

The rule reports but does not fix when:

- a default value references another destructured name, because reordering could break the reference. `unsafeFix` does not change this
- a default value has side effects, unless `unsafeFix` is `true`
- a comment sits inside the sorted range
