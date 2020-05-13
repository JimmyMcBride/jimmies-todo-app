module.exports = {
  development: {
    // client: "sqlite3",
    // connection: {
    //   filename: "./my_todos.sqlite",
    // },
    client: "pg",
    connection: "postgres://postgres:password@localhost:5432/todo_app",
    migrations: {
      directory: "./data/migrations",
    },
    seeds: {
      directory: "./data/seeds",
    },
  },
};
