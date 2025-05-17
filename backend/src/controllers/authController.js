import { login } from "../services/authService.js";
import yup from "yup";

const loginSchema = yup.object().shape({
  email: yup.string().email().required(),
  password: yup.string().required(),
});

const loginUser = async (req, res) => {
  try {
    await loginSchema.validate(req.body);

    const response = await login(req.body.email, req.body.password);

    res.status(200).json({
      message: "Login successful",
      token: response.token,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
};

export { loginUser };
