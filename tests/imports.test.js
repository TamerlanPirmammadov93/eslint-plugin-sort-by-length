const rule = require('../src/rules/imports');
const { createRuleTester } = require('./ruleTester');

const SORTED_FULL = [
  "import { z } from 'zod';",
  "import { useState } from 'react';",
  '',
  "import Button from '~/packages/ui-kit/components/Button';",
  '',
  "import PrisonerForm from './ui/PrisonerForm';",
  '',
  "import type { TableColumnsType } from 'antd';",
  '',
  "import type { IUser } from '~/app/_shared/api/user/user.types';",
  '',
  "import type { IPrisonerFormProps } from './PrisonerForm.types';",
].join('\n');

const PACKAGES_GROUPS = { groups: ['external', ['^~/packages'], ['^~/app'], 'relative'] };

createRuleTester().run('imports', rule, {
  valid: [
    SORTED_FULL,
    "import './global.css';\nimport b from 'bbbbbb';\nimport a from 'a';",
    "import { a, bb, ccc } from 'x';",
    "import a from 'a';\nconst value = 1;\nimport bbbbbb from 'bbbbbb';",
    {
      code: "import a from '~/packages/y';\n\nimport b from '~/app/x';",
      options: [PACKAGES_GROUPS],
    },
    {
      code: "import x from './x';\n\nimport { S } from './a.styles';",
      options: [{ lastPatterns: ['\\.styles$'] }],
    },
    "import data from './a.json' with { type: 'json' };\nimport b from 'bbbbbb';\nimport a from 'a';",
  ],
  invalid: [
    {
      code: "import { useState } from 'react';\nimport { z } from 'zod';",
      output: "import { z } from 'zod';\nimport { useState } from 'react';",
      errors: [{ messageId: 'unsortedImports' }],
    },
    {
      code: "import type { A } from 'a';\nimport b from 'b';",
      output: "import b from 'b';\n\nimport type { A } from 'a';",
      errors: [{ messageId: 'unsortedImports' }],
    },
    {
      code: "import { ccc, a } from 'x';",
      output: "import { a, ccc } from 'x';",
      errors: [{ messageId: 'unsortedImports' }],
    },
    {
      code: "import b from '~/app/x';\nimport a from '~/packages/y';",
      output: "import a from '~/packages/y';\n\nimport b from '~/app/x';",
      options: [PACKAGES_GROUPS],
      errors: [{ messageId: 'unsortedImports' }],
    },
    {
      code: "import { S } from './a.styles';\nimport x from './x';",
      output: "import x from './x';\n\nimport { S } from './a.styles';",
      options: [{ lastPatterns: ['\\.styles$'] }],
      errors: [{ messageId: 'unsortedImports' }],
    },
    {
      code: "import type { A } from 'a';\nimport b from 'b';",
      output: "import b from 'b';\nimport type { A } from 'a';",
      options: [{ separateTypeImports: false }],
      errors: [{ messageId: 'unsortedImports' }],
    },
    {
      code: "import bbbbbb from 'bbbbbb';\n// keep\nimport a from 'a';",
      output: null,
      errors: [{ messageId: 'unsortedImports' }],
    },
  ],
});
