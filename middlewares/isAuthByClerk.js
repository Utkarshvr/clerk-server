import jwt from "jsonwebtoken";
const publicKey = process.env.CLERK_PEM_PUBLIC_KEY;

export default function isAuthByClerk(req, res, next) {
  // Cookies are for Web Apps, Headers JWT are for mobile apps
  const ClerkToken = req.cookies["__session"] || req.headers["clerk-token"];
  console.log({ ClerkToken });

  if (!ClerkToken)
    return res.status(401).json({
      msg: "🚩🚩🚩UNAUTHORIZED🚩🚩🚩",
      error: "Auth Token not present",
    });

  jwt.verify(
    ClerkToken,
    publicKey,
    { algorithms: ["RS256"] },
    (err, decoded) => {
      console.log({ decoded, err });

      if (err)
        return res.status(401).json({
          msg: "🚩🚩🚩UNAUTHORIZED🚩🚩🚩",
          error: err,
        });

      req.user = decoded;
      next();
    }
  );
}
