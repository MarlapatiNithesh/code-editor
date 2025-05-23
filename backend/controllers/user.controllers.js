const User = require("../models/user.models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Project = require("../models/project.model");

function getHelloWorldCode(language) {
  const lang = language.toLowerCase();

  switch (lang) {
    case "python":
      return `print("Hello World")`;
    case "java":
      return `public class Main {
  public static void main(String[] args) {
    System.out.println("Hello World");
  }
}`;
    case "javascript":
      return `console.log("Hello World");`;
    case "cpp":
      return `#include<iostream>
using namespace std;
int main() {
  cout << "Hello World";
  return 0;
}`;
    case "c":
      return `#include<stdio.h>
int main() {
  printf("Hello World");
  return 0;
}`;
    case "go":
      return `package main
import "fmt"
func main() {
  fmt.Println("Hello World")
}`;
    case "bash":
      return `echo "Hello World"`;
    default:
      return "Language not supported";
  }
}

module.exports.SignUp = async (req, res) => {
  try {
    const { fullname, email, password } = req.body;
    if (!fullname || !email || !password) {
      return res.status(400).json({
        success: false,
        msg: "Please fill all the fields",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        msg: "User already exists",
      });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      fullname,
      email,
      password: hashedPassword,
    });

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      success: true,
      msg: "User created successfully",
      user: {
        id: newUser._id,
        fullname: newUser.fullname,
        email: newUser.email,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, msg: err.message });
  }
};

module.exports.Login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        msg: "Please fill all the fields",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        msg: "User does not exist",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        msg: "Invalid credentials",
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      msg: "Login successful",
      user: {
        id: user._id,
        fullname: user.fullname,
        email: user.email,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, msg: err.message });
  }
};

module.exports.createProject = async (req, res) => {
  try {
    const { name, projLanguage } = req.body;
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ success: false, msg: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, msg: "User not found" });
    }

    const project = await Project.create({
      name,
      projLanguage,
      createdBy: user._id,
      code: getHelloWorldCode(projLanguage),
    });

    return res.status(201).json({
      success: true,
      msg: "Project created successfully",
      project: {
        id: project._id,
        name: project.name,
        projLanguage: project.projLanguage,
        createdBy: user._id,
        code: project.code,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, msg: err.message });
  }
};

module.exports.saveProjects = async (req, res) => {
  try {
    const { projectId, code } = req.body;
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ success: false, msg: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, msg: "User not found" });
    }

    const updated = await Project.findByIdAndUpdate(
      projectId,
      { code: code !== undefined ? code : "" },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, msg: "Project not found" });
    }

    return res.status(200).json({
      success: true,
      msg: "Project saved successfully",
      project: {
        id: updated._id,
        name: updated.name,
        projLanguage: updated.projLanguage,
        createdBy: updated._id,
        code: updated.code,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, msg: err.message });
  }
};

module.exports.getProjects = async (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ success: false, msg: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, msg: "User not found" });
    }

    const projects = await Project.find({ createdBy: user._id });

    return res.status(200).json({
      success: true,
      projects,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, msg: err.message });
  }
};

module.exports.selectProject = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ success: false, msg: "Project ID is required" });
    }

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ success: false, msg: "Project not found" });
    }

    return res.status(200).json({ project });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, msg: err.message });
  }
};

module.exports.deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, msg: "Project ID is required" });
    }
    const project = await Project.findByIdAndDelete(id);
    if (!project) {
      return res.status(404).json({ success: false, msg: "Project not found" });
    }
    return res.status(200).json({ success: true, msg: "Project deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, msg: err.message });
  }
};

module.exports.Logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });

    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Server error during logout" });
  }
};

module.exports.getUser = async (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ success: false, msg: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ success: false, msg: "User not found" });
    }

    return res.status(200).json({user});
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, msg: err.message });
  }
};
