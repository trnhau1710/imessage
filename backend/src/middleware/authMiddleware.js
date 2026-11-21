import jwt from "jsonwebtoken"

export const protect = (req, res, next) => {
    try {
        // lay Authorization Header
        const authHeader = req.headers.authorization; //lay token

        // Kiem tra xem token co ton tai khong
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Not authorized. Invalid token"
            });
        }

        // lay token tu chuoi header
        const token = authHeader.split(" ")[1];

        // kiem tra token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        //luu user id trong request
        req.userId = decoded.userId; //goi userId vi da tao jwt token bang userId luc login

        //tiep tuc den middleware khac hoac controller
        next();
    }
    catch (error) {
        return res.status(401).json({
            success: false,
            message: "Not authorized. Invalid token"
        });
    }
};