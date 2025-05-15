import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../services/userServices.js";
import yup from "yup";

const schema = yup.object().shape({
  name: yup.string().required("Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters long")
    .required("Password is required"),
  role: yup.string().oneOf(["user", "admin"], "Role must be either 'user' or 'admin'"),
});

const create = async (req, res) => {
  try {
    await schema.validate(req.body, { abortEarly: false });

    const newUser = await createUser({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      role: req.body.role,
    });

    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAll = async (req, res) => {
  try {
    const users = await getUsers();

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getById = async (req, res) => {
  try {
    const user = await getUserById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const update = async (req, res) => {
  const updateUserSchema = schema.omit(["password"]);

  updateUserSchema.fields.email = yup
    .string()
    .min(6, "Email must be at least 6 characters long")
    .optional();

  try {
    await updateUserSchema.validate(req.body);

    const updatedUser = await updateUser(req.params.id, req.body);

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const remove = async (req, res) => {
  try {
    const deletedUser = await deleteUser(req.params.id);

    if (!deletedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export { create, getAll, getById, update, remove };
