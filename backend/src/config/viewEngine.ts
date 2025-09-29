import express from "express";
import path from "path";

export const configureViewEngine = (app: express.Application) => {
  app.set("view engine", "ejs");
  app.set("views", path.join(__dirname, "..", "views"));
};