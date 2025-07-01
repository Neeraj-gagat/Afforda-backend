import { Router } from "express";
import { SigninSchema, SignupSchema } from "../types/types";
import { prisma } from "../db/db";
import  Jwt  from "jsonwebtoken";
import { JWT_PASSWORD } from "../config";
import { authMiddleware } from "../authmiddleware";
import { SES } from "aws-sdk";

const ses = new SES({ region: "us-east-1" });

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

    const { email, name, password } = parsedData.data;

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

    const newUser = await prisma.user.create({
        data:{
            email:email,
            name:name,
            password:password
        }
    })

     // Create verification token
     const verificationToken = Jwt.sign({ id: newUser.id }, JWT_PASSWORD, { expiresIn: "1h" });

     // Send verification email
     const verificationLink = `http://localhost:3000/verify-email?token=${verificationToken}`;
 
     await ses.sendEmail({
         Source: "your_verified_email@yourdomain.com",
         Destination: { ToAddresses: [email] },
         Message: {
             Subject: { Data: "Verify your email" },
             Body: {
                 Html: {
                     Data: `Click <a href="${verificationLink}">here</a> to verify your email. This link will expire in 1 hour.`
                 }
             }
         }
     }).promise();

     return res.json({ message: "User created. Please check your email to verify your account." });
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

    return res.json({
        user
    })
})

export const userRouter = router;