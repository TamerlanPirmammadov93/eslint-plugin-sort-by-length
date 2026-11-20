# sort-by-length/const-declarations

Sorts a run of consecutive single-declaration `const` statements by line length, shortest first. A declaration that uses an earlier name of the run stays after it: dependency wins over length.

- Recommended config: no (included in `all`)
- Fixable: yes
- Options: `isBlankLineBoundary`, `unsafeFix`

## Rule details

Examples of **correct** code:

```js
const currentVehicles = data?.vehicles;
const isChanged = !!version && isFieldChanged(['vehicles']);
const comparedVehicles = isChanged ? (currentVehicles ?? []) : undefined;
```

`comparedVehicles` uses `isChanged`, so it stays after it.

A blank line starts a new run, so groups you separated on purpose stay separate.

## Options

```js
'sort-by-length/const-declarations': ['warn', {
  isBlankLineBoundary: true,
  unsafeFix: false,
}]
```

| Option | Default | Meaning |
|---|---|---|
| `isBlankLineBoundary` | `true` | A blank line ends the current run. Set to `false` to let a run continue across blank lines |
| `unsafeFix` | `false` | Also fix runs whose initializers contain calls |

## Fixing

By default the rule reports but does not fix when an initializer has side effects (hook calls, function calls), because the call order would change. This matters especially for React hooks, which must keep a stable order. A fix is also skipped when a comment sits inside the run.
