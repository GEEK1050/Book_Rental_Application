const userModel = require('../models/userModel');
const cryptoJs = require('crypto-js');
const jwt = require('jsonwebtoken');
const {isStrongPassword} = require("validator");
const { v4: uuidv4 } = require('uuid');
const { deleteId } = require('./idsControllers');


exports.createUser = (req, res) => {
  if (!req.body) {
    return res.status(403).json({
      status: "Failure",
      message: "Cannot post empty object",
    });
  }
  if (!req.body.password) {
    return res.status(403).json({
      status: "Failure",
      message: "Password is required",
    });
  }
  if (/*req.body.password.length < 8*/ isStrongPassword(req.body.password)) {
    return res.status(403).json({
      status: "Failure",
      message: "password is shorter than the minimum allowed length (8).",
    });
  }
  const now = new Date();
  //   const current_date = `${now.getDate()}-${
  //     now.getMonth() + 1
  //   }-${now.getFullYear()}`;
  const current_date = now.toLocaleDateString("en-Us");
  const user = new userModel({
    fullName: req.body.fullName,
    email: req.body.email,
    isAdmin: req.body.isAdmin,
    password: cryptoJs.MD5(req.body.password).toString(cryptoJs.enc.Base64) /*req.body.password*/,
    address: req.body.address,
    userName: req.body.userName.toLowerCase(),
    phoneNumber: req.body.phoneNumber,
    zipCode: req.body.zipCode,
    created_at: current_date,
  });

  user
    .save()
    .then(data => {
        deleteId(data.email);
        res
          .status(202)
          .json({
              status: 'Success',
              data
          })
    })
    .catch((err) => {
      res.status(403).json({
        status: "Failure",
        message: err.message || "Error during user creation",
      });
    });
};

exports.findUsers = (req, res) => {
  let filter_object = {};
  // if (req.query)
  //   filter_object = req.query;
  userModel
    .find(filter_object)
    .then((data) => {
      res.status(200).json({
        status: "Success",
        length: data.length,
        data,
      });
    })
    .catch((err) => {
      res.status(404).json({
        status: "Failure",
        message: err.message || "Error during finding users",
      });
    });
};

exports.findUserById = (req, res) => {
  let filter_object = {};
  // if (req.query)
  //   filter_object = req.query;
  userModel
    .findById(req.params.id)
    .then((data) => {
      res.status(200).json({
        status: "Success",
        data,
      });
    })
    .catch((err) => {
      res.status(404).json({
        status: "Failure",
        message: err.message || "Error during finding users",
      });
    });
};

exports.updateUser = (req, res) => {
  if (!req.body) {
    return res.status(404).json({
      status: "Failure",
      message: "Cannot put empty object",
    });
  }
  if (req.body.password) {
    req.body.password = cryptoJs.MD5(req.body.password).toString(cryptoJs.enc.Base64);
  }
  userModel
    .findByIdAndUpdate(req.params.id, req.body, { useFindAndModify: false })
    .then((data) => {
      if (!data) {
        return res.status(400).json({
          status: "Failure",
          message: "Cannot update user! User not found",
        });
      } else {
        res.status(200).json({
          status: "Success",
          data,
        });
      }
    })
    .catch((err) => {
      return res.status(404).json({
        status: "Failure",
        message: err.message || "Error during updating user",
      });
    });
};

exports.deleteUser = (req, res) => {
  userModel
    .findByIdAndDelete(req.params.id)
    .then((data) => {
      if (data) {
        res.status(200).json({
          status: "success",
          data,
        });
      } else {
        res.status(400).json({
          status: "failure",
          message: "Cannot delete user! user not found",
        });
      }
    })
    .catch((err) => {
      res.status(404).json({
        status: "failure",
        message: err.message,
      });
    });
};

exports.login = async (req, res) => {
  try {
    const user = await userModel.findOne({
      userName: req.body.userName.toLowerCase(),
    });

    if (user) {
      const { password, ...others } = user._doc;
      const hashedPassword = cryptoJs.MD5(req.body.password).toString(cryptoJs.enc.Base64);

      if (hashedPassword !== /*decrypted_pass*/ password)
        return res.status(401).json({
          status: "Failure",
          message: "wrong password",
        });

      res.status(200).json({
        ...others,
        token: uuidv4(),
      });
    } else {
      return res.status(401).json({
        status: "Failure",
        message: "userName does not exist",
      });
    }
  } catch (err) {
    res.status(404).json({
      status: "failure",
      message: err.message || "cannot connect",
    });
  }
};
