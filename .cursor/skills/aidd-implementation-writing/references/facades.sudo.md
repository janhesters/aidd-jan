# Facade Functions

Facades abstract the database layer. Apply only to functions in
`*-model.server.ts` files.

FacadeNaming {
  Pattern: `<action><Entity><OptionalWith...><DataSource><OptionalBy...>()`

  Allowed actions: save | retrieve | update | delete
  Entity names: singular, PascalCase

  "With...": included relations, placed before DataSource. Chain with "And".
  "By...": lookup key(s), placed last. Key names must match schema fields
  exactly. Chain with "And".

  DataSource => match (action) {
    case save     => "ToDatabase"
    case retrieve => "FromDatabase"
    case update   => "InDatabase"
    case delete   => "FromDatabase"
  }

  Examples:
    saveUserToDatabase({ name, email })
    retrieveUserWithPostsFromDatabaseById(userId)
    updateOrganizationInDatabaseByIdAndSlug(id, slug, data)
    deleteCommentFromDatabaseById(commentId)
}

FacadeConstraints {
  Facades must perform a single database operation (no business logic).
  Facades must always return raw Prisma results (no transformations).
  Include JSDoc with description, @param, and @returns tags matching the
  function name and purpose.
  Prefer explicit Prisma includes/selects; avoid `include: { *: true }`.
  Function bodies must use the `prisma.<entity>.<operation>` pattern directly.
}
