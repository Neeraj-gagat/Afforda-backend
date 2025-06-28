import { Router } from "express";
import { SigninSchema, SignupSchema } from "../types/types";
import { prisma } from "../db/db";
import  Jwt  from "jsonwebtoken";
import { JWT_PASSWORD } from "../config";
import { authMiddleware } from "../authmiddleware";

const router = Router();

router.post("/signup",async (req,res):Promise <any> => {
    const body = req.body;
    const parsedData = SignupSchema.safeParse(body);
    
    if (!parsedData.success) {
        console.log(parsedData.error);
        return res.status(411).json({
            message:"Incorrect Inputs"
        })
    }

    const userexist = await prisma.user.findFirst({
        where:{
            email:parsedData.data.email
        }
    })

    if (userexist) {
        return res.status(403).json({
            message:"User with this email already exist"
        })
    }

    await prisma.user.create({
        data:{
            email:parsedData.data.email,
            name:parsedData.data.name,
            password:parsedData.data.password
        }
    })

    return res.json({
        message:"user Created"
    })
})

router.post("/signin", async (req, res):Promise <any> => {
    const body = req.body;
    const parsedData = SigninSchema.safeParse(body);

    if (!parsedData.success) {
        return res.status(422).json({
            message:"Incorrect inputs"
        })
    }

    const userexist = await prisma.user.findFirst({
        where:{
            email:parsedData.data.email,
            password:parsedData.data.password,
        }
    })

    if (!userexist) {
        return res.status(403).json({
            message:"Wrong Credientials"
        })
    }

    const token = Jwt.sign({
        id:userexist.id
    }, JWT_PASSWORD)

    res.json({
        token:token
    })
})

router.get("/" ,authMiddleware, async (req,res):Promise <any> => {
    // @ts-ignore
    const id = req.id;
    const user = await prisma.user.findFirst({
        where:{
            id
        },
        select:{
            name:true,
            email:true
        }
    })
})