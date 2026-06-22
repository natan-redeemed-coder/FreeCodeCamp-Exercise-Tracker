const cors = require("cors");
require("dotenv").config();
const express = require("express");


const app = express();

const users = ["test"];
const exercises = [
  [
    {
      description: "blah",
      duration: 100,
      date: new Date("2025").toDateString()
    },
    {
      description: "blah",
      duration: 100,
      date: new Date("2026").toDateString()
    },
    {
      description: "blah",
      duration: 100,
      date: new Date("2027").toDateString()
    }
  ]
];


app.use(cors());

app.use(express.urlencoded({extended: true}));

app.use(express.static("public"));


app.get("/", (request, response) => {
  response.sendFile(__dirname + "/views/index.html");
});


app.post(
  "/api/users",
  (request, response) => {
    const userIndex = users.indexOf(request.body.username);
    if (userIndex === -1) {
      users.push(request.body.username);
      exercises.push([]);
      response.json({
        username: request.body.username,
        _id: users.length - 1
      });
    } else {
      response.json({
        username: request.body.username,
        _id: userIndex
      });
    }
  }
);

app.get(
  "/api/users",
  (request, response) => {
    response.json(users.map((item, index) => ({username: item, _id: index.toString()})));
  }
);

app.post(
  "/api/users/:_id/exercises",
  (request, response) => {
    if (Number(request.params._id) >= 0 && Number(request.params._id) < users.length) {
      const oldExercisesForUser = exercises[Number(request.params._id)];
      const newEntry = {
        description: request.body.description,
        duration: Number(request.body.duration),
        date: new Date(request.body.date || new Date()).toDateString()
      };
      const newExercisesForUser = [
        ...oldExercisesForUser,
        newEntry
      ]
      exercises[Number(request.params._id)] = newExercisesForUser;
      response.json({
        username: users[Number(request.params._id)],
        _id: request.params._id,
        ...newEntry
      });
    } else {
      response.json({
        error: "unknown id"
      });
    }
  }
);

app.get(
  "/api/users/:_id/logs",
  (request, response) => {
    if (Number(request.params._id) >= 0 && Number(request.params._id) < users.length) {
      let exercisesForUser = exercises[Number(request.params._id)];
      if (Object.hasOwn(request.query, "from")) {
        exercisesForUser = exercisesForUser.filter((item) => new Date(item.date) >= new Date(request.query.from));
      }
      if (Object.hasOwn(request.query, "to")) {
        exercisesForUser = exercisesForUser.filter((item) => new Date(item.date) <= new Date(request.query.to));
      }
      if (Object.hasOwn(request.query, "limit")) {
        exercisesForUser = exercisesForUser.slice(0, Number(request.query.limit));
      }
      response.json({
        username: users[Number(request.params._id)],
        _id: request.params._id,
        count: exercisesForUser.length,
        log: exercisesForUser
      });
    } else {
      response.json({
        error: "unknown id"
      });
    }
  }
);


const listener = app.listen(
  process.env.PORT || 3000,
  () => {
    console.log("Your app is listening on port " + listener.address().port);
  }
);