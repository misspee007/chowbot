const app = require("./app");
const config = require("./src/config");

app.listen(config.PORT || 3000, () => {
  console.log(`Server running on port ${config.PORT || 3000}`);
});
