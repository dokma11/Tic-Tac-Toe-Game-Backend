import express from "express";
const app = express();
app.use(express.json());

import cors from "cors"
const corsOptions = {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
};
app.use(cors(corsOptions));

import dotenv from 'dotenv';
dotenv.config();
const port = process.env.PORT as string;

require("./config/routes")(app);

app.listen(port, () => {
    console.log(`listening on port ${port}`);
});
