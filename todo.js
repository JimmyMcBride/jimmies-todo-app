#!/bin/node

require("colors");
const db = require("./data/dbConfig");
const inquirer = require("inquirer");
const clear = require("clear");
const shell = require("shelljs");

function exit() {
  console.log("Thanks! Have a nice day! 🚀".cyan);
  return process.exit();
}

async function main() {
  // if (db("tables").whereNotExists()) {
  //   db.migrate.latest();
  //   db.seed.run();
  //   console.log("Database initialized! 🚀".green);
  // }

  clear();

  const todos = await db("todos");

  const coloredTodos = todos.map((todo) =>
    todo.complete ? `${todo.name}`.dim.red : `${todo.name}`.yellow
  );

  const myTodos = todos.map((todo) => todo.name);

  myTodos.push("Back To Main Menu");
  myTodos.push("Quit");

  const mainMenu = [
    {
      type: "list",
      name: "menu",
      message:
        "\nWelcome to FireNinja's Todo app! 🔥".red +
        "\n What would you like to do?".green,
      choices: ["View Todos", "Add Todo", "Quit"],
    },
  ];

  const viewTodo = [
    {
      type: "list",
      name: "view",
      message: "Which todo would you like to view? 👀".green,
      choices: myTodos,
    },
  ];

  console.log("Todos:".rainbow);
  coloredTodos.forEach((i) => console.log(i));
  // console.log(coloredTodos[0]);

  const command = await inquirer.prompt(mainMenu);

  if (command.menu === "View Todos") {
    const viewCommand = await inquirer.prompt(viewTodo);

    if (viewCommand.view === "Back To Main Menu") {
      main();
      console.log("Back To Main Menu".magenta);
    } else if (viewCommand.view === "Quit") {
      exit();
    } else {
      const thisTodo = await db("todos")
        .where({ name: viewCommand.view })
        .first();

      console.log("Todo".rainbow);
      console.log("Name:".blue + " " + `${thisTodo.name}`.cyan);
      console.log("Description:".blue + " " + `${thisTodo.description}`.cyan);
      const todoOptions = [
        {
          type: "list",
          name: "options",
          message: "What would you like to do?".green,
          choices: [
            "Edit Todo",
            "Toggle Complete",
            "Delete Todo",
            "Back To Main Menu",
            "Quit",
          ],
        },
      ];
      const optionCommand = await inquirer.prompt(todoOptions);

      if (optionCommand.options === "Edit Todo") {
        const editName = [
          {
            type: "input",
            name: "name",
            message: "Please enter new name for todo: ".green,
          },
        ];
        const editDescription = [
          {
            type: "input",
            name: "description",
            message: "Please enter new description for todo: ".green,
          },
        ];
        const editNameCommand = await inquirer.prompt(editName);
        const editDescriptionCommand = await inquirer.prompt(editDescription);
        const todoEdit = {
          name: editNameCommand.name,
          description: editDescriptionCommand.description,
        };
        await db("todos").where({ id: thisTodo.id }).update(todoEdit);
        main();
        console.log("Todo successfully updated! 🚀".magenta);
      } else if (optionCommand.options === "Toggle Complete") {
        await db("todos")
          .where({ id: thisTodo.id })
          .update({ complete: !thisTodo.complete });
        main();
        console.log("Todo successfully updated! 🚀".magenta);
      } else if (optionCommand.options === "Delete Todo") {
        await db("todos").where({ id: thisTodo.id }).del();
        main();
        console.log("Todo successfully deleted! 💀".magenta);
      } else if (optionCommand.options === "Back To Main Menu") {
        main();
        console.log("Back To Main Menu".magenta);
      } else if (optionCommand.options === "Quit") {
        exit();
      }
    }
  } else if (command.menu === "Add Todo") {
    const addTodoName = [
      {
        type: "input",
        name: "name",
        message: "What's the name of your todo? ".green,
      },
    ];
    const addTodoDescription = [
      {
        type: "input",
        name: "description",
        message: "Give your todo a description: ".green,
      },
    ];
    const addTodoNameCommand = await inquirer.prompt(addTodoName);
    const addTodoDescriptionCommand = await inquirer.prompt(addTodoDescription);

    const newTodo = {
      name: addTodoNameCommand.name,
      description: addTodoDescriptionCommand.description,
    };
    try {
      await db("todos").insert(newTodo);
    } catch {
      await db("todos").insert(newTodo);
    }

    main();

    console.log("Todo successfully added!".magenta);
  } else if (command.menu === "Quit") {
    exit();
  }
}

(async function initDatabase() {
  try {
    // await db.migrate.latest();
    // await db.seed.run();
    const todos = await db("todos");

    console.log(todos);

    main();
  } catch {
    shell.exec(`psql -U postgres -f remakeDatabase.sql`);
    await db.migrate.latest();
    await db.seed.run();
    console.log("Database initialized! 🚀".green);
    main();
  }
})();
