# sort-by-length/interface-fields

Sorts the members of an `interface` and of an object type literal (`type T = { ... }`) by length, shortest first.

- Recommended config: yes (`warn`)
- Fixable: yes
- Options: none
- Requires `@typescript-eslint/parser`

## Rule details

A member is measured as `name: Type`, without the trailing `;` or `,`. Multi-line members are measured collapsed to one line. Members of equal length keep their original order.

Examples of **incorrect** code:

```ts
interface IUser {
  fullName: string;
  id: number;
  roles: Array<string>;
}
```

Examples of **correct** code:

```ts
interface IUser {
  id: number;
  fullName: string;
  roles: Array<string>;
}
```

## Fixing

Members with overload signatures are reported but not fixed. A fix is also skipped when a comment sits inside the sorted range.
