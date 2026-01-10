import * as Yup from "yup";

export const termsSchema = {
  terms: Yup.boolean()
    .oneOf([true], "You must accept the terms and conditions")
    .required("You must accept the terms and conditions"),
};

// Validation for Player
export const playerValidationSchema = Yup.object().shape({
  fullName: Yup.string().required("Full Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  phone: Yup.string().matches(/^\d+$/, "Phone must contain only numbers").min(10, "Phone must be at least 10 digits").required("Phone is required"),
  password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
  confirmPassword: Yup.string().oneOf([Yup.ref("password"), null], "Passwords must match").required("Confirm Password is required"),
});

// Validation for Organizer
export const organizerValidationSchema = Yup.object().shape({
  orgName: Yup.string().required("Organizer Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  phone: Yup.string().matches(/^\d+$/, "Phone must contain only numbers").min(10, "Phone must be at least 10 digits").required("Phone is required"),
  password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
  confirmPassword: Yup.string().oneOf([Yup.ref("password"), null], "Passwords must match").required("Confirm Password is required"),
});
