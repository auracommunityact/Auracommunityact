require('dotenv').config();
const key = process.env.KITS_AI_API_KEY;
if (key) {
  console.log("Length:", key.length);
  console.log("Prefix:", key.substring(0, 4));
} else {
  console.log("Key not found");
}
