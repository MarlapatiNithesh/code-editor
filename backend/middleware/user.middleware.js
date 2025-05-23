const jwt = require("jsonwebtoken");

module.exports.isAuth = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ success: false, message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // attaches decoded info to request
    next();
  } catch (err) {
    console.error("JWT verification error:", err.message);
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};
