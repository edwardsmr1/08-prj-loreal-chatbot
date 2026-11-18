const express = require("express");
const path = require("path");

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const HOST = "0.0.0.0";

// Serve static assets from the project root
app.use(
  express.static(__dirname, {
    dotfiles: "ignore",
  })
);

// Serve index.html for unmatched routes
app.use((_req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
});
