import jwt from "jsonwebtoken";

export const JWT_SECRET = process.env.JWT_SECRET || "JWT_SECRET";

export const generateToken = (id: string) => {
    return jwt.sign(
        { id },
        JWT_SECRET,
        { expiresIn: "1h" }
    );
};

export const verifyToken = (jwtToken: string) => {
    return jwt.verify(jwtToken, JWT_SECRET);
};
