require('dotenv').config();

console.log("--- DEBUG START ---");
console.log("Full Env Object:", process.env.MONGO_URI ? "Found URI" : "URI NOT FOUND");
console.log("Your Port is:", process.env.PORT);
console.log("--- DEBUG END ---");