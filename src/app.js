const express = require("express");
const morgan = require("morgan");
const { engine } = require("express-handlebars");
const path = require("path");

const app = express();

// Configuracion
app.set("port", process.env.PORT || 3001);
app.set("views", path.join(__dirname, "views"));
app.engine(
  ".hbs",
  engine({
    defaultLayout: "main",
    extname: "hbs",
  })
);
app.set("view engine", ".hbs");

// Middlewares
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: false }));

// Rutas
app.use(require("./routes/index"));

// Statics
app.use(express.static(path.join(__dirname, "public")));

module.exports = app;
