import express from "express";
import dotenv from 'dotenv';
const app = express();
app.use(express.json());

dotenv.config();
const port = process.env.PORT as string;

require("./config/routes")(app);

app.listen(port, () => {
    console.log(`listening on port ${port}`);
});
