const { z } = require('zod');

// This is a zod validation schema for Signup
const SignupValidation = z.object({
      name: z.string(),
      email: z.string().email({ message: "Invalid email address" }),
      password: z.string().min(6, { message: "Must be 6 or more characters long" }),
      posts: z.array().optional()
});

// zod validation schema for signin
const SigninValidation = z.object({
      email: z.string().email(),
      password: z.string().min(6)
})

module.exports = {
      SignupValidation, 
      SigninValidation
}