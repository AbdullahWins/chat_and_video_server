// Init the default routes for the server
const express = require("express");
const path = require("path");
const DefaultRouter = require("express").Router();
const { getMetrics } = require("../../../config/monitorings/prometheus.config");
const { logger } = require("../../services/logHandlers/HandleWinston");
const {
  sendResponse,
  sendError,
} = require("../../services/responseHandlers/HandleResponse");

// Default route
DefaultRouter.get("/", (req, res) => {
  logger.log("info", "welcome to the server!");
  sendResponse(res, 200, "Welcome to the server!");
});

// Expose metrics endpoint for Prometheus to scrape
DefaultRouter.get("/metrics", getMetrics);

// Serve uploaded files statically
DefaultRouter.use(
  "/uploads",
  express.static(path.join(__dirname, "../../../uploads"))
);

//not found route
DefaultRouter.use((req, res) => {
  sendError(res, 404, "Route not found");
});

module.exports = DefaultRouter;
