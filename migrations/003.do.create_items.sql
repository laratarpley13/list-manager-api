CREATE TABLE items (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    name TEXT NOT NULL,
    listId INTEGER REFERENCES lists(id) ON DELETE CASCADE NOT NULL,
    userId INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    active BOOLEAN NOT NULL DEFAULT FALSE,
    editItemActive BOOLEAN NOT NULL DEFAULT FALSE
);