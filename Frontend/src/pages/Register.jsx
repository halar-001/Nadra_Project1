import React from "react";
import Login from "./Login";

// Register routes simply point to Login but initialize with the "register" tab active
export const Register = () => {
  return <Login initialTab="register" />;
};

export default Register;
