import { Router } from "express";
import { SigninSchema, SignupSchema } from "../types/types";
import { prisma } from "../db/db";
import  Jwt  from "jsonwebtoken";
import { JWT_PASSWORD } from "../config";
import { authMiddleware } from "../authmiddleware";
// import { SES } from "aws-sdk";
import { emailQueue } from "../queue/emailQueue";
// import dotenv from "dotenv";
// dotenv.config();

// const ses = new SES({ 
//     region: process.env.AWS_REGION,
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,

// });

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
        try {
            if (userexist.emailVerified) {
                return res.status(403).json({ message: "User with this email already exists" });
              } else {
                // Re-send verification email
                await emailQueue.add("send-verification", {
                    email: parsedData.data.email,
                    userId: userexist.id,
                  });
              }
        } catch (error) {
            console.log("sending verification email failed",error);
            return res.status(500).json({ message: "Error sending verification email." });
        }
    }

    const newUser = await prisma.user.create({
        data:{
            email:email,
            name:name,
            password:password
        }
    })

    //  // Create verification token
    //  const verificationToken = Jwt.sign({ id: newUser.id }, JWT_PASSWORD, { expiresIn: "1h" });

    //  // Send verification email
    //  const verificationLink = `http://localhost:3001/api/v1/user/verify-email?token=${verificationToken}`;

    //  console.log(`${verificationLink}`)

     try {
        // const result = await ses.sendEmail({
        //     Source: "no-reply@affoda.com",
        //     Destination: { ToAddresses: [email] },
        //     Message: {
        //         Subject: { Data: "Verify your email" },
        //         Body: {
        //             Html: {
        //                 Data: `Click <a href="${verificationLink}">here</a> to verify your email. This link will expire in 1 hour.`
        //             }
        //         }
        //     }
        // }).promise();      
        await emailQueue.add("send-verification", {
            email: parsedData.data.email,
            userId: newUser.id,
          });
        console.log("✅ Email sent:")  
     } catch (err) {
        console.error("❌ SES Email Send Error:", err);
        return res.status(500).json({ message: "Error sending verification email." });
     }


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

    if (!userexist || !userexist.emailVerified) {
        return res.status(403).json({
            message:"Invalid credentials or email not verified"
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

router.get("/verify-email", async (req, res): Promise<any> => {
    const token = req.query.token as string;

    try {
        const decoded: any = Jwt.verify(token, JWT_PASSWORD);
        const userId = decoded.id;

        await prisma.user.update({
            where: { id: userId },
            data: { emailVerified: true }
        });

        return res.json({ message: "Email verified successfully." });
    } catch (err) {
        return res.status(400).json({ message: "Invalid or expired token." });
    }
});


export const userRouter = router;