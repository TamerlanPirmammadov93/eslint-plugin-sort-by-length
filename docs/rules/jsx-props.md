# sort-by-length/jsx-props

Sorts JSX props by the length of the whole prop as written, shortest first.

- Recommended config: yes (`warn`)
- Fixable: yes
- Options: none

## Rule details

A prop is measured as `name={value}` collapsed to one line. A boolean shorthand (`disabled`) counts by its name only. Props of equal length keep their original order.

A spread (`{...props}`) is a boundary. Props are sorted separately before and after it, because the position of a spread decides which prop wins.

Examples of **incorrect** code:

```jsx
<StatCard label="Total unpaid fines (AZN)" icon={EBaseIcons.SCHEDULE} value="12,842" />
```

Examples of **correct** code:

```jsx
<StatCard value="12,842" icon={EBaseIcons.SCHEDULE} label="Total unpaid fines (AZN)" />

<Input id="a" {...rest} disabled={isLoading} onChange={handleChange} />
```

## Fixing

A fix is not applied when a comment sits inside the sorted range. The problem is still reported.

## When not to use it

If your team orders props by meaning (for example `key` and `ref` first) or alphabetically, do not enable this rule.
