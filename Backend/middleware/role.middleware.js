function roleMiddleware(requiredRole) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).send({ message: "Unauthorized" });
    }

    if (req.user.role !== requiredRole) {
      return res.status(403).send({ message: "Forbidden: Insufficient role" });
    }

    next();
  };
}

module.exports = roleMiddleware;
