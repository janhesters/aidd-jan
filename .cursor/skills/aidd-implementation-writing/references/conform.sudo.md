# Conform Future API Reference

This project uses Conform's **Future API** — an experimental export with
breaking changes possible in minor versions. Always import from `/future` paths.

## Table of Contents

- [Import Paths](#import-paths)
- [React Hooks](#react-hooks)
- [Server Utilities](#server-utilities)
- [Zod Integration](#zod-integration)
- [Common Patterns](#common-patterns)

## Import Paths

constraint FutureImports {
  Always use future imports. Never use stable API imports.

  React:  `@conform-to/react/future`
  Zod v4: `@conform-to/zod/v4/future`

  Project wrapper: `~/utils/conform` (re-exports configureForms-customized hooks)
  Server helper:   `~/utils/validate-form-data.server`
}

## React Hooks

### useForm

Primary hook. Returns `{ form, fields, intent }` — NOT a tuple.

```ts
// Schema-first signature (preferred)
const { form, fields, intent } = useForm(schema, options);

// Options-only signature
const { form, fields, intent } = useForm(options);
```

Options {
  id?: string                    — form identifier (auto-generated via useId if omitted)
  key?: string                   — changes reset form state
  schema?: StandardSchemaV1      — Zod schema for validation
  defaultValue?: DefaultValue    — initial form values
  constraint?: Record<string, ValidationAttributes>
  shouldValidate?: 'onSubmit' | 'onBlur' | 'onInput'  — default: 'onSubmit'
  shouldRevalidate?: 'onSubmit' | 'onBlur' | 'onInput'
  lastResult?: SubmissionResult | null   — server submission result
  onValidate?: ValidateHandler
  onSubmit?: SubmitHandler
  onError?: ErrorHandler
  onInput?: InputHandler
  onBlur?: BlurHandler
}

Returns {
  form: FormMetadata  — spread form.props on <form>, use form.context with FormProvider
  fields: Fieldset    — fields.fieldName gives field metadata
  intent: IntentDispatcher — programmatic form actions
}

constraint FormElement {
  Always spread form.props: `<Form method="POST" {...form.props}>`
}

### useField

Access field metadata from any component within a FormProvider.
Eliminates prop drilling for reusable field components.

```ts
const field = useField(name, { formId? });
```

Field metadata {
  id, name, formId, descriptionId, errorId
  defaultValue: string          — empty string if null/undefined/non-serializable
  defaultOptions: string[]      — for multi-select/checkbox groups
  defaultChecked: boolean       — true if value is 'on'
  touched, valid: boolean
  errors: ErrorShape[] | undefined
  fieldErrors: Record<string, ErrorShape[]>
  ariaInvalid: boolean | undefined
  ariaDescribedBy: string | undefined
  required?, minLength?, maxLength?, pattern?, min?, max?, step?, multiple?
  getFieldset(): Fieldset       — nested object fields
  getFieldList(): Field[]       — array fields
}

constraint Deprecated {
  `invalid` is deprecated — use `valid` instead.
  `inputProps` is stable API — in future API use individual properties
  (id, name, defaultValue, ariaInvalid, ariaDescribedBy, required, etc.)
}

### useFormMetadata

Form-level state from any component within a FormProvider.

```ts
const form = useFormMetadata({ formId? });
```

Returns FormMetadata {
  id, key, errorId, descriptionId
  touched, valid: boolean
  errors: ErrorShape[] | undefined
  fieldErrors: Record<string, ErrorShape[]>
  defaultValue: Record<string, unknown>
  props: FormProps               — spread on <form>
  context: FormContext            — pass to <FormProvider>
  getField(name): Field
  getFieldset(name): Fieldset
  getFieldList(name): Field[]
}

### useIntent

Intent dispatcher for form actions without submitting.

```ts
const intent = useIntent(formRef);  // ref or form ID string
```

IntentDispatcher {
  validate(name?): void         — validate field or entire form
  reset(options?): void         — reset form; options.defaultValue to set specific state
  update(options): void         — options: { name?, index?, value }
  insert(options): void         — options: { name, index?, defaultValue?, from?, onInvalid? }
  remove(options): void         — options: { name, index, onInvalid?, defaultValue? }
  reorder(options): void        — options: { name, from, to }
}

constraint ArrayIntentSync {
  `insert.from` reads value from another field, validates, inserts if valid.
  `insert.onInvalid: 'revert'` cancels insert on validation error.
  `remove.onInvalid: 'revert'` cancels removal; `'insert'` removes but adds blank.
  These require synchronous error availability.
}

### useControl

Bridge custom UI components to Conform via hidden native input.
Use for date pickers, rich selects, toggles, switches from UI libraries.

```ts
const control = useControl({
  defaultValue?,    // string | string[] | File | File[]
  defaultChecked?,  // boolean
  value?,           // string (checkbox/radio value when checked)
  onFocus?,         // () => void — delegate focus to custom input
});
```

Returns {
  value: string | undefined
  options: string[] | undefined     — multi-select/checkbox group
  checked: boolean | undefined      — single checkbox/radio
  files: File[] | undefined
  register: (element) => void       — register hidden input(s)
  change(value): void               — update + emit change/input events
  blur(): void                      — emit blur/focusout events
  focus(): void                     — emit focus/focusin events
}

Pattern: hidden input + custom component {
  ```tsx
  <input type="checkbox" name={fields.name.name} ref={control.register} hidden />
  <CustomSwitch
    checked={control.checked}
    onChange={(checked) => control.change(checked)}
    onBlur={() => control.blur()}
  />
  ```
}

### useFormData

Subscribe to live form values. Updates on every input change but
re-renders only when selector result changes (deep equality).

```ts
const result = useFormData(formRef, selector, { acceptFiles?, fallback? });
```

- `formRef`: ref to form-associated element or form ID string
- `selector(formData, lastResult?)`: derives value from FormData/URLSearchParams
- `acceptFiles: true` → selector receives FormData (else URLSearchParams)
- `fallback`: value when form element unavailable (SSR)

### FormProvider

Provides form context for useField and useFormMetadata in child components.

```tsx
<FormProvider context={form.context}>
  {/* useField/useFormMetadata work here */}
</FormProvider>
```

### configureForms

Factory for customized hooks. Use to integrate schema libraries and UI components.

```ts
const { FormProvider, useForm, useFormMetadata, useField, useIntent } =
  configureForms({
    intentName?,           // default: '__intent__'
    serialize?,
    shouldValidate?,       // default for all forms
    shouldRevalidate?,
    isError?: shape<T>(),  // custom error shape
    isSchema?,
    validateSchema?,
    getConstraints?,       // derive HTML attrs from schema
    extendFormMetadata?,   // add custom props to form metadata
    extendFieldMetadata?,  // add custom props to field metadata
  });
```

constraint ConfigureFormsComposition {
  Use `config` to extend: `configureForms({ ...base.config, ...extensions })`
}

### PreserveBoundary

Preserves field values when React unmounts contents during client navigation.
Use for multi-step wizards, form dialogs, virtualized lists.

```tsx
<PreserveBoundary name="step-1">
  <input name="fieldA" />
</PreserveBoundary>
```

constraint PreserveBoundaryUsage {
  Only for navigational conditions (step changes, dialog open/close).
  NOT for conditional data exclusion — let those fields unmount normally.
  Stale values cleaned up automatically on remount.
}

## Server Utilities

### parseSubmission

Parses FormData/URLSearchParams into structured submission.

```ts
const submission = parseSubmission(formData, { intentName?, skipEntry? });
// Returns { payload, fields, intent }
```

Field naming conventions:
  `name` → `{ name: "value" }`
  `object.property` → `{ object: { property: "value" } }`
  `array[0]` → `{ array: ["value"] }`
  `items[]` → `{ items: ["value1", "value2"] }`

### report

Creates SubmissionResult from submission with errors/options.

```ts
const result = report(submission, {
  error?: { issues?, formErrors?, fieldErrors? } | null,
  value?,
  keepFiles?: boolean,        // default: false (strips files)
  hideFields?: string[],      // e.g. ['password']
  reset?: boolean,
});
```

constraint ReportPattern {
  For validation errors: `report(submission, { error: { fieldErrors: { ... } } })`
  For success with reset: `report(submission, { error: null, reset: true })`
  Hide sensitive fields: `report(submission, { hideFields: ['password'] })`
}

## Zod Integration

All from `@conform-to/zod/v4/future`.

### coerceFormValue

Enhances schema with preprocessing to coerce form string values.

```ts
const enhanced = coerceFormValue(schema, { defaultCoercion?, customize? });
```

Default coercion rules:
  empty string/file → undefined
  z.number() → Number(trimmed)
  z.boolean() → true if 'on'
  z.date() → new Date(value)
  z.bigint() → BigInt(trimmed)

constraint CoerceFormValueUsage {
  Always wrap schema with coerceFormValue when form includes
  non-string types (numbers, booleans, dates, files).
  For default values after coercion, use `.transform(v => v ?? fallback)`.
}

### formatResult

Transforms Zod SafeParseResult into Conform error format.

```ts
const error = formatResult(result, { includeValue?, formatIssues? });
```

### getConstraints

Extracts HTML validation attributes from Zod schema.

```ts
const constraints = getConstraints(schema);
// Pass to useForm: useForm({ constraint: getConstraints(schema) })
// Or configure globally: configureForms({ getConstraints })
```

### isSchema

Type guard: `isSchema(value)` → value is ZodTypeAny.
Use with configureForms to restrict accepted schema types.

## Common Patterns

### isDirty

Check if form data differs from defaults.

```ts
isDirty(formData, { defaultValue?, serialize?, skipEntry?, intentName? })
// Returns: true | false | undefined (if formData is null)
```

Use with useFormData:
```tsx
const dirty = useFormData(formRef,
  (formData) => isDirty(formData, { defaultValue }) ?? false
);
```

### getFieldValue

Extract typed values from FormData.

```ts
getFieldValue(formData, name, { type?, array?, optional? })
// type: 'string' | 'file' | 'object'
```

### memoize

Cache last result for async validation (e.g., username uniqueness).

```ts
const check = useMemo(() => memoize(asyncFn), []);
// Use in onValidate for deduped async checks
```

constraint MemoizeScope {
  Always wrap in useMemo at component level. Never define at module scope.
}
