# sort-by-length/imports

Splits the import block into groups and sorts each group by the length of the full statement, shortest first. Named specifiers inside `{ }` are sorted the same way.

- Recommended config: yes (`warn`)
- Fixable: yes

## Rule details

Groups are separated by one blank line. By default the order is:

1. external packages
2. aliased paths (`~/...`, `@/...`)
3. relative paths (`./`, `../`)
4. `import type` statements, in the same group order, after all value imports

Examples of **correct** code:

```js
import { z } from 'zod';
import { useState } from 'react';

import Button from '~/ui/Button';

import PrisonerForm from './PrisonerForm';

import type { TableColumnsType } from 'antd';

import type { IUserProps } from './User.types';
```

## Options

```js
'sort-by-length/imports': ['warn', {
  groups: ['external', ['^~/packages'], ['^~/app'], 'relative'],
  lastPatterns: ['\.styles$'],
  separateTypeImports: true,
}]
```

| Option | Default | Meaning |
|---|---|---|
| `groups` | `['external', ['^[~@]/'], 'relative']` | Group order. `'external'` is every other package, `'relative'` is `./` and `../`, an array is a list of regex patterns. The first matching group wins, so put the more specific pattern first |
| `lastPatterns` | `[]` | Regex patterns of value imports that must come last, after the type-import groups |
| `separateTypeImports` | `true` | Put `import type` statements in their own groups after all value imports |

## Limitations

- Only the import block at the top of the file is checked.
- The rule does nothing when the block contains a side-effect import (`import './a.css'`) or an import attribute.
- When a comment sits between imports, the problem is reported without a fix.
- A split-off `import type` ends up in the right group only when this rule runs together with `code-conventions/no-inline-type-import`. Enable both.
