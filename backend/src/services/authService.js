import User from "../models/User.js";

const login = async (email, password) => {
  try {
    const user = await User.findOne({ email });

    if (!user) {
      const error = new Error("Invalid credentials");
      error.statusCode = 401;
      throw error;
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      const error = new Error("Invalid credentials");
      error.statusCode = 401;
      throw error;
    }

    const token = user.getSignedJwtToken();

    return { token };
  } catch (error) {
    throw error;
  }
};

export { login };
