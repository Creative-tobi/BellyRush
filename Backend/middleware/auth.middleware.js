const jwt = require("jsonwebtoken");

function authmiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).send({ message: "No token, authorization denied" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id: ..., role: "admin" }
    next();
  } catch (error) {
    return res.status(401).send({ message: "Invalid token" });
  }
}

module.exports = authmiddleware;
