# eslint-plugin-sort-by-length

ESLint rules that sort imports, JSX props, interface fields, enum members, object keys,
destructuring and `const` declarations by **length, shortest first**.

Prettier and the core ESLint rules do not check any of these orderings, so a green lint run proves
nothing about them. This plugin does, and every rule can fix the code automatically.

For naming and structure rules (handler and boolean naming, separate type imports, component file
structure) see the companion package `eslint-plugin-code-conventions`.

- 7 rules, all with auto-fix
- Works with ESLint 8.57+ (legacy `.eslintrc`) and ESLint 9 (flat config)
- Works with `@typescript-eslint/parser` (TypeScript and TSX)
- No runtime dependencies

## Installation

```bash
npm install --save-dev eslint eslint-plugin-sort-by-length
```

## Usage

### Flat config (`eslint.config.js`)

```js
const sortByLength = require('eslint-plugin-sort-by-length');

module.exports = [
  sortByLength.configs['flat/recommended'],
  {
    rules: {
      'sort-by-length/object-keys': 'warn',
    },
  },
];
```

### Legacy config (`.eslintrc.js`)

```js
module.exports = {
  extends: ['plugin:sort-by-length/recommended'],
  rules: {
    'sort-by-length/object-keys': 'warn',
  },
};
```

### Configs

| Config | Rules |
|---|---|
| `recommended` / `flat/recommended` | `jsx-props`, `imports`, `enum-members`, `interface-fields` (all `warn`) |
| `all` / `flat/all` | all 7 rules (all `warn`) |

## How "length" is measured

Rules measure the **whole item as written**, not only the name. A JSX prop is measured as
`name={value}`, an interface field as `name: Type`, an import as the full statement. Multi-line
items are measured collapsed to one line. Items of equal length keep their original order.

```tsx
// Sorted: "value" (14) < "icon={...}" (26) < "label=..." (40)
<StatCard value="12,842" icon={EBaseIcons.SCHEDULE} label="Total unpaid fines (AZN)" />
```

A fix is never applied when a comment sits inside the sorted range or when reordering could change
behavior (see each rule). Those cases are still reported.

## Rules

| Rule | What it checks |
|---|---|
| [`imports`](docs/rules/imports.md) | Groups imports and sorts each group by statement length |
| [`jsx-props`](docs/rules/jsx-props.md) | JSX props by `name={value}` length |
| [`interface-fields`](docs/rules/interface-fields.md) | Interface and type literal members by length |
| [`enum-members`](docs/rules/enum-members.md) | Enum members by member name length |
| [`object-keys`](docs/rules/object-keys.md) | Object literal properties by length |
| [`destructuring`](docs/rules/destructuring.md) | Object destructuring entries by length |
| [`const-declarations`](docs/rules/const-declarations.md) | Consecutive `const` statements by line length, dependencies first |

### imports

Imports are split into groups separated by one blank line, and each group is sorted by the length
of the full statement. Named specifiers inside `{ }` are sorted the same way.

```js
import { z } from 'zod';
import { useState } from 'react';

import Button from '~/ui/Button';

import PrisonerForm from './PrisonerForm';

import type { TableColumnsType } from 'antd';

import type { IUserProps } from './User.types';
```

Options:

| Option | Default | Meaning |
|---|---|---|
| `groups` | `['external', ['^[~@]/'], 'relative']` | Group order. `'external'` is every other package, `'relative'` is `./` and `../`, an array is a list of regex patterns. The first matching group wins, so put the more specific pattern first |
| `lastPatterns` | `[]` | Regex patterns of value imports that must come last, after the type-import groups (for example `['\\.styles$']`) |
| `separateTypeImports` | `true` | Put `import type` statements in their own groups after all value imports |

```js
'sort-by-length/imports': ['warn', {
  groups: ['external', ['^~/packages'], ['^~/app'], 'relative'],
  lastPatterns: ['\\.styles$'],
}]
```

The rule only looks at the import block at the top of the file. It does nothing when the block has
a side-effect import (`import './a.css'`) or an import attribute, and it reports without fixing
when a comment sits between imports.

A split-off `import type` ends up in the right group only when this rule runs together with
`code-conventions/no-inline-type-import`, so enable both.

### jsx-props

Props are sorted by the collapsed length of `name={value}`. A boolean shorthand (`disabled`) counts
by its name only. A spread (`{...props}`) is a boundary: props are sorted separately before and
after it, because a spread's position changes which prop wins.

### interface-fields

Sorts the members of an `interface` and of an object type literal (`type T = { ... }`) by
`name: Type`, ignoring the trailing `;` or `,`. Members with overload signatures are reported but not
fixed.

### enum-members

Sorts enum members by **member name** length. Enums where a member has no initializer, or an
initializer that is not a literal, are skipped, because reordering would change the values.

### object-keys

Sorts object literal properties. Spread elements and computed keys are boundaries. Not fixed when a
property value has side effects (calls, `new`, `await`, assignments), because evaluation order
would change.

Option `unsafeFix: true` fixes those too.

### destructuring

Sorts object destructuring entries, in declarations and in function parameters. The rest element
(`...rest`) is a boundary. Not fixed when a default value references another destructured name or
has side effects. Option `unsafeFix: true` allows the latter.

### const-declarations

Sorts a run of consecutive single-declaration `const` statements by line length. A declaration that
uses an earlier name of the run stays after it: dependency wins over length.

```js
const currentVehicles = data?.vehicles;
const isChanged = !!version && isFieldChanged(['vehicles']);
const comparedVehicles = isChanged ? (currentVehicles ?? []) : undefined;
```

A blank line starts a new run, so groups you separated on purpose stay separate. Not fixed when an
initializer has side effects (hook calls, function calls), because the call order would change.

| Option | Default | Meaning |
|---|---|---|
| `isBlankLineBoundary` | `true` | A blank line ends the current run |
| `unsafeFix` | `false` | Also fix runs whose initializers contain calls |

## Not covered

CSS declaration order inside styled-components is not an ESLint concern. Use `stylelint` for it.

## Development

```bash
npm install
npm test
```

Tests use ESLint's `RuleTester` with `@typescript-eslint/parser` and Node's built-in test runner.

## License

MIT
