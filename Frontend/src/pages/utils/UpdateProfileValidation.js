import * as yup from 'yup';

export const updateProfileValidationSchema = yup.object().shape({
  displayName: yup.string().min(2, 'Display name must be at least 2 characters').max(50, 'Display name must not exceed 50 characters').matches(/^[a-zA-Z0-9\s_-]+$/, 'Display name can only contain letters, numbers, spaces, hyphens, and underscores').required('Display name is required').trim(),
  contactNo: yup.string().matches(/^\d+$/, 'Contact number must contain only digits').required('Contact number is required').min(7, 'Contact number must be at least 7 digits').max(15, 'Contact number must not exceed 15 digits'),
  email: yup.string().email('Invalid email address').required('Email is required'),
  accountType: yup.string().required('Account type is required'),
});
