import { Router } from "express";
import { ResetPasswordRequestSchema, ResetPasswordSchema, SigninSchema, SignupSchema } from "../types/types";
import { prisma } from "../db/db";
import bcrypt from "bcrypt";
import  Jwt  from "jsonwebtoken";
import { JWT_PASSWORD } from "../config";
import { authMiddleware } from "../authmiddleware";

import { sendResetPasswordEmail, sendVerificationEmail } from "../email/email";


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
        if (userexist.emailVerified) {
          return res.status(403).json({ message: "User with this email already exists" });
        } else {
          // If not verified, re-send verification email
          const verificationToken = Jwt.sign({ id: userexist.id }, JWT_PASSWORD, { expiresIn: "1h" });
          const verificationLink = `http://localhost:3001/api/v1/user/verify-email?token=${verificationToken}`;
    
          try {
            await sendVerificationEmail(email, verificationLink);
            return res.status(200).json({
              message: "Email already registered but not verified. Verification email resent."
            });
          } catch (error) {
            console.error("Error sending verification email:", error);
            return res.status(500).json({ message: "Error sending verification email." });
          }
        }
      }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
        data:{
            email:email,
            name:name,
            password:hashedPassword,
        }
    })

     // Create verification token
     const verificationToken = Jwt.sign({ id: newUser.id }, JWT_PASSWORD, { expiresIn: "1h" });

     // Send verification email
     const verificationLink = `http://localhost:3001/api/v1/user/verify-email?token=${verificationToken}`;

     console.log(`${verificationLink}`)

     try {
        await sendVerificationEmail(email, verificationLink);
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
        where: { email: parsedData.data.email }
      });
      
      if (!userexist) {
        return res.status(403).json({ message: "Invalid credentials" });
      }
      
      const isMatch = await bcrypt.compare(parsedData.data.password, userexist.password);
      
      if (!isMatch) {
        return res.status(403).json({ message: "Invalid credentials" });
      }
      

    if (!userexist.emailVerified) {
        return res.status(403).json({
            message:"email not verified"
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

    if (!token) {
        return res.status(400).json({ message: "Missing token." });
      }

    try {
        const decoded = Jwt.verify(token, JWT_PASSWORD) as { id: number };

        const user = await prisma.user.findUnique({
          where: { id: decoded.id }
        });
    
        if (!user) {
          return res.status(404).json({ message: "User not found." });
        }
    
        if (user.emailVerified) {
          return res.status(200).json({ message: "Email already verified." });
        }
    
        await prisma.user.update({
          where: { id: user.id },
          data: { emailVerified: true }
        });
    
        return res.status(200).json({ message: "Email verified successfully." });
    } catch (err) {
        return res.status(400).json({ message: "Invalid or expired token." });
    }
});

router.post("/request-password-reset", async (req, res): Promise<any> => {
    const data = req.body;
    const parsedData = ResetPasswordRequestSchema.safeParse(data);

    if (!parsedData.success) {
      console.log(parsedData.error)
      return res.status(422).json({
        message:"incorrect inputs"
      })
    }

    const {email} = parsedData.data;
  
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
  
    const user = await prisma.user.findUnique({ where: { email } });
  
    if (!user || !user.emailVerified) {
      return res.status(404).json({ message: "User not found or email not verified" });
    }
  
    const resetToken = Jwt.sign({ id: user.id }, JWT_PASSWORD, { expiresIn: "15m" });
  
    const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;
  
    try {
      await sendResetPasswordEmail(user.email, resetLink);
      return res.status(200).json({ message: "Password reset email sent" });
    } catch (error) {
      console.error("Reset email error:", error);
      return res.status(500).json({ message: "Failed to send reset email" });
    }
  });

  

  router.post("/reset-password", async (req, res):Promise <any> => {
    const data = req.body;
    const parsedData = ResetPasswordSchema.safeParse(data);

    if (!parsedData.success) {
      console.log(parsedData.error);
      return res.status(422).json({
        message:"Incorrect Inputs"
      })
    }

    const { token, newPassword} = parsedData.data;
  
    if (!token || !newPassword) {
      return res.status(400).json({ message: "Missing token or password" });
    }
  
    try {
      const decoded = Jwt.verify(token, JWT_PASSWORD) as { id: number };
      const hashedPassword = await bcrypt.hash(newPassword, 10);
  
      await prisma.user.update({
        where: { id: decoded.id },
        data: { password: hashedPassword },
      });
  
      return res.status(200).json({ message: "Password reset successfully" });
    } catch (err) {
      console.error("Reset error:", err);
      return res.status(400).json({ message: "Invalid or expired token" });
    }
  });
  
  


export const userRouter = router;