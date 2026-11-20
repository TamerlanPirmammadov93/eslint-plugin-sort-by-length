# sort-by-length/enum-members

Sorts TypeScript enum members by the length of the **member name**, shortest first.

- Recommended config: yes (`warn`)
- Fixable: yes
- Options: none
- Requires `@typescript-eslint/parser`

## Rule details

Only the name counts, not the initializer.

Examples of **incorrect** code:

```ts
enum Status {
  Archived = 'archived',
  Open = 'open',
  Closed = 'closed',
}
```

Examples of **correct** code:

```ts
enum Status {
  Open = 'open',
  Closed = 'closed',
  Archived = 'archived',
}
```

## Skipped enums

The rule skips an enum when any member has no initializer or an initializer that is not a literal (string, number, a template without expressions, or a negated literal). Reordering such an enum would change its values.
