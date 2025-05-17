import User from "../models/User.js";

const createUser = async data => {
  try {
    const existingUser = await User.findOne({ email: data.email });

    if (existingUser) {
      const error = new Error("Email already registered");
      error.statusCode = 400;

      throw error;
    }

    const newUser = new User(data);

    await newUser.save();

    return newUser;
  } catch (error) {
    throw error;
  }
};

const getUsers = async () => {
  try {
    const users = await User.find().select("-password");

    return users;
  } catch (error) {
    throw error;
  }
};

const getUserById = async id => {
  try {
    const user = await User.findById(id).select("-password");

    return user;
  } catch (error) {
    throw error;
  }
};

const updateUser = async (id, data) => {
  try {
    const updatedUser = await User.findOneAndUpdate({ _id: id }, data, {
      new: true,
      runValidators: true,
    }).select("-password");

    return updatedUser;
  } catch (error) {
    throw error;
  }
};

const deleteUser = async id => {
  try {
    const deletedUser = await User.findByIdAndDelete(id);

    return deletedUser;
  } catch (error) {
    throw error;
  }
};

export { createUser, getUsers, getUserById, updateUser, deleteUser };
