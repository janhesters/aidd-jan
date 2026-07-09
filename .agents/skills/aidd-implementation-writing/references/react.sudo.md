# React

Act as a top-tier software engineer with extensive React ecosystem knowledge
to build high-quality fullstack web applications.

constraint BeforeWritingCode {
  Observe the project's relevant existing code.
  Conform to existing code style, patterns, and conventions unless directed
  otherwise. Note: these instructions count as "directed otherwise" unless
  the user explicitly overrides them.
}

ComponentPattern {
  Display/container component pattern:
  - Display components are pure functions that map props to JSX.
  - Container components are (optional) stateful components that wrap one
    display component.
  - Compose them together in the parent or page/route component.
}

Constraints {
  Be concise.
  Using React Router V7 (the successor to Remix).
  Use ShadCN/ui for components. If a component is missing, install it.
  Modularize by feature; one concern per file or component; prefer named exports.
  This project uses TailwindCSS V4 — use container queries and child selectors.
}

NamingConstraints {
  Use clear, descriptive, consistent naming.
  Components: postfix with `Component`. e.g. `UserMenuComponent`.
  Props: component name postfixed with `ComponentProps`.
  e.g. `UserMenuComponentProps`.
}

TypeConstraints {
  Use proper React TypeScript types: MouseEventHandler<HTMLButtonElement>,
  ChangeEventHandler<HTMLInputElement>, ReactNode, React.Ref<T>,
  ComponentProps<'element'>, etc.
  Never use generic `() => void` or `(event: any) => void`.
  When extending HTML elements or existing components, use ComponentProps to
  inherit their props: ComponentProps<'input'>, ComponentProps<'button'>,
  ComponentProps<typeof ExistingComponent>.
  This project uses Prisma. If a prop comes from a database entity, use the
  entity's type:
    type UserMenuProps = Pick<UserAccount, 'id' | 'name' | 'email'> & {
      onLogout: MouseEventHandler<HTMLInputElement>;
      organizationName: Organization['name'];
    }
  When using server/database return types:
  Awaited<ReturnType<typeof serverFunction>>,
  wrap with NonNullable<> if guaranteed to exist.
}

FormConstraints {
  This project uses Conform's **Future API** with Zod for form handling,
  NOT react-hook-form.
  For full Conform API details, read [references/conform.sudo.md](references/conform.sudo.md).
  For schemas:
    - Define Zod schemas in dedicated `*-schemas.ts` files next to the form component
    - Optionally include intent field: `intent: z.literal('actionName')`
    - For multi-action forms, use `z.discriminatedUnion("intent", [...schemas])`
    - Pass translation keys (not translated strings) in validation error messages
    - Use `coerceFormValue()` from `@conform-to/zod/v4/future` when the schema
      includes file uploads
  For the useForm hook:
    - Import useForm from `~/utils/conform` (project-configured via
      configureForms), not from `@conform-to/react` directly
    - Call as: `const { form, fields } = useForm(schema, { lastResult: actionData?.result })`
    - Spread form.props on the Form element: `<Form method="POST" {...form.props}>`
    - Access field metadata via `fields.fieldName.inputProps` (spreads name, id,
      aria-describedby, aria-invalid)
    - Access field errors via `fields.fieldName.errors` and `fields.fieldName.errorId`
    - Use `intent.reset()` from useForm return value to reset forms after
      successful submission
  For server-side actions:
    - Use `validateFormData(request, schema)` from `~/utils/validate-form-data.server`
    - Pattern: `if (!result.success) return result.response;` then use `result.data`
    - For custom server errors, use `report()` from `@conform-to/react/future`
      with fieldErrors/formErrors
    - Return `{ result: report(...) }` so it can be passed as lastResult on the client
  For loading/submission states:
    - Use `useNavigation()` to derive isSubmitting based on navigation.state and intent
    - Disable forms with `<FieldSet disabled={isSubmitting}>` instead of
      individual disabled props
  For form field components:
    - Use the Field/FieldLabel/FieldError/FieldGroup/FieldSet components from
      `~/components/ui/field`
    - Set `data-invalid={fields.fieldName.ariaInvalid}` on Field for error styling
    - Use FieldError with `errors={fields.fieldName.errors}` and
      `id={fields.fieldName.errorId}`
    - Submit intents via `<Button name="intent" type="submit" value={INTENT_CONSTANT}>`
}

AccessibilityConstraints {
  For interactive components, provide aria props with defaults:
    - *AriaLabel props for screen readers
      (e.g., countryAriaLabel = 'Select country')
    - *Placeholder props for empty states
    - Conform's inputProps spread handles aria-describedby and aria-invalid
      automatically via `fields.fieldName.inputProps`
}

InternationalizationConstraints {
  Use useTranslation with namespace and keyPrefix:
    `const { t } = useTranslation('namespace', { keyPrefix: 'section' });`
  Use Trans component for interpolation with links/components.
  FieldError components handle translation of error keys automatically.
}
