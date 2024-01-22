import jwt from "jsonwebtoken";
const jwtSecretkey = process.env.JWT_SECRET_KEY;

export default function isAuthByJWT(req, res, next) {
  const jwtToken = req.cookies["jwt-token"] || req.headers["jwt-token"];
  // console.log({ jwt_cookie: req.cookies["jwt-token"] });

  const clerkID = req.user?.sub;

  if (!jwtToken)
    return res.status(401).json({
      msg: "🚩🚩🚩UNAUTHORIZED🚩🚩🚩",
      error: "JWT Token not present",
    });

  jwt.verify(jwtToken, jwtSecretkey, (err, decoded) => {
    console.log({ decoded, err });

    if (err)
      return res.status(401).json({
        msg: "🚩🚩🚩UNAUTHORIZED🚩🚩🚩",
        error: err,
      });

    if (clerkID !== decoded.user?.clerkID)
      return res.status(401).json({
        msg: "TRYING TO PRETEND SOMEONE ELSE, BUT U CAN'T.",
        error: err,
      });

    req.userDB = decoded.user;
    next();
  });
}
