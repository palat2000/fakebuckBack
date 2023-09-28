require("dotenv").config();
const cors = require("cors");
const morgan = require("morgan");
const express = require("express");
const app = express();
const notFoundMiddleware = require("./middlewares/not-found");
const errorMiddleware = require("./middlewares/error");
const rateLimitMiddleware = require("./middlewares/rate-limit");

app.use(cors());
app.use(morgan("dev"));
app.use(rateLimitMiddleware);
app.use(express.json());

app.use(notFoundMiddleware);
app.use(errorMiddleware);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`server running on port ${PORT}`));