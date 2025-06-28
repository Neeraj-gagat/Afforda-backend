import { NextFunction, Request, Response } from "express";
import Jwt from "jsonwebtoken";
import { JWT_PASSWORD } from "./config";

interface AuthenticatedRequest extends Request {
    id?: string;
  }

export function authMiddleware(req:AuthenticatedRequest, res:Response, next:NextFunction):void {
    const token = req.headers.authorization;

    if (!token || !token.startsWith("Bearer ")) {
        res.status(401).json({ message: "Unauthorized: No token provided" });
        return;
      }

    try {
        const payload = Jwt.verify(token,JWT_PASSWORD) as {id:string};
        req.id = payload.id
        next();
    } catch (e) {
        res.status(403).json({
            message: "You are not loggedin"
        })
    }
}