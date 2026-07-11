import UserModel from "../models/UserModel.js";
import bycrypt from "bcryptjs";

const authController = {
  CreateUser: async (req, res) => {
    try {
      const { username, email, password } = req.body;
      const userExists = await UserModel.findOne({ email });

      if (userExists) {
        return res.status(400).json({ message: "Usuario ya existe" });
      }

      const salt = await bycrypt.genSalt(10);
      const hashPassword = await bycrypt.hash(password, salt);

      const newUser = await UserModel.create({
        username,
        email,
        password: hashPassword,
        createdBy: "postman test",
      });

      res.status(201).json(newUser);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "server error" });
    }
  },
};

export default authController;