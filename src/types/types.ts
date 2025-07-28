import {z} from "zod"

export const SignupSchema = z.object({
    name:z.string().min(3),
    password:z.string().min(6),
    email:z.string().min(10)
}) 

export const SigninSchema = z.object({
    password:z.string().min(6),
    email:z.string().min(10)
})

export const ResetPasswordRequestSchema = z.object({
    email:z.string().min(10)
})

export const ResetPasswordSchema = z.object({
    token: z.string().min(1, "Token is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
    //   .max(100, "Password must be under 100 characters")
    //   .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    //   .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    //   .regex(/[0-9]/, "Password must contain at least one digit")
    //   .regex(/[\W_]/, "Password must contain at least one special character")
  });

//  agoda api schema 

export const HotelSearchSchema = z.object({
    checkInDate: z.string(),
    checkOutDate: z.string(),
    cityId: z.number(),
    additional: z.object({
      language: z.string(),
      currency: z.string(),
      occupancy: z.object({
        numberOfAdult: z.number(),
        numberOfChildren: z.number(),
      }),
      maxResult: z.number(),
      sortBy: z.string(),
    }),
  });