import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_PASSWORD } from "./config";

interface AuthenticatedRequest extends Request {
    id?: string;
  }

export function authMiddleware(req:AuthenticatedRequest, res:Response, next:NextFunction):void {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ message: "Unauthorized: No token provided" });
        return;
      }

      const token = authHeader.split(" ")[1];

    try {
        const payload = jwt.verify(token,JWT_PASSWORD) as {id:string};
        req.id = payload.id
        next();
    } catch (e) {
        res.status(403).json({
            message: "Unauthorized: Invalid or expired token"
        })
    }
}