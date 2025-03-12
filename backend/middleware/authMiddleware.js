const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const path = require("path");

// ✅ Load .env from root directory
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// ✅ Middleware to Protect Routes
const protect = (req, res, next) => {
  let token = req.headers.authorization;

  if (!token || !token.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized - No Token Provided" });
  }

  try {
    // 🔑 Extract token from "Bearer <token>"
    token = token.split(" ")[1];

    // 🔍 Verify Token using JWT_SECRET
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🛠 Attach User Data to Request
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized - Invalid Token" });
  }
};

module.exports = { protect };
