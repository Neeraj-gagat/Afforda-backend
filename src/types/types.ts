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