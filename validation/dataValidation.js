const { z } = require('zod');

const SignupValidation = z.object({
      name: z.string(),
      email: z.string().email({ message: "Invalid email address" }),
      password: z.string().min(6, { message: "Must be 6 or more characters long" }),
      posts: z.array().optional()
});

const SigninValidation = z.object({
      email: z.string().email(),
      password: z.string().min(6)
})

module.exports = {
      SignupValidation, 
      SigninValidation
}