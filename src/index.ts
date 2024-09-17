import express from "express";
import path from "path";

const app = express();

app.use(express.static(path.resolve(__dirname + "/../public")));
app.use(express.static(path.resolve(__dirname + "/../assets")));
app.use("/boards", express.static(path.resolve(__dirname + "/../data/boards")));

app.get("/", (req, res) => {
    res.sendFile(path.resolve(__dirname + "/../views/index.html"));
});

app.listen(80);