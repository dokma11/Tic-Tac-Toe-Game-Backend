import express from "express";
const app = express();
const port = 3000; // ovo cu morati samo da dodam u .env fajl

app.get('/', (req, res) => {
    res.send('index');
});

app.listen(port, () => {
    console.log(`listening on port ${port}`);
});
