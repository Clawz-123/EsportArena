import * as Yup from 'yup'

// Amount validation schema
export const withdrawAmountSchema = Yup.object().shape({
  coins: Yup.number()
    .required('Amount is required')
    .typeError('Amount must be a number')
    .min(10, 'Minimum withdrawal is 10 coins')
    .max(1000, 'Maximum withdrawal is 1000 coins')
    .positive('Amount must be positive'),
})

// Account identifier validation (phone number for eSewa and Khalti)
export const withdrawAccountSchema = Yup.object().shape({
  provider: Yup.string()
    .required('Provider is required')
    .oneOf(['esewa', 'khalti', 'stripe'], 'Invalid provider selected'),
  account_identifier: Yup.string().when('provider', {
    is: (prov) => prov === 'esewa' || prov === 'khalti',
    then: (schema) =>
      schema
        .required('Account ID is required')
        .matches(
          /^98\d{8}$/,
          'Must be a valid 10-digit phone number starting with 98 (e.g., 9841234567)'
        )
        .length(10, 'Phone number must be exactly 10 digits'),
    otherwise: (schema) => schema.notRequired(),
  }),
})

// Combined validation schema for full withdrawal process
export const withdrawFullSchema = Yup.object().shape({
  coins: Yup.number()
    .required('Amount is required')
    .typeError('Amount must be a number')
    .min(10, 'Minimum withdrawal is 10 coins')
    .max(1000, 'Maximum withdrawal is 1000 coins')
    .positive('Amount must be positive'),
  provider: Yup.string()
    .required('Provider is required')
    .oneOf(['esewa', 'khalti', 'stripe'], 'Invalid provider selected'),
  account_identifier: Yup.string().when('provider', {
    is: (prov) => prov === 'esewa' || prov === 'khalti',
    then: (schema) =>
      schema
        .required('Account ID is required')
        .matches(
          /^98\d{8}$/,
          'Must be a valid 10-digit phone number starting with 98 (e.g., 9841234567)'
        )
        .length(10, 'Phone number must be exactly 10 digits'),
    otherwise: (schema) => schema.notRequired(),
  }),
})

// Validation helpers
export const validateCoins = (coins, balance) => {
  try {
    const coinsNum = Number(coins) || 0
    const balanceNum = Number(balance) || 0

    if (coinsNum < 10) return 'Minimum withdrawal is 10 coins'
    if (coinsNum > 1000) return 'Maximum withdrawal is 1000 coins'
    if (coinsNum > balanceNum) return 'Insufficient balance'

    return '' 
  } catch {
    return 'Invalid amount'
  }
}

export const validatePhoneNumber = (phoneNumber, provider) => {
  if (!phoneNumber) return `${provider === 'esewa' ? 'eSewa' : 'Khalti'} ID is required`

  const pattern = /^98\d{8}$/
  if (!pattern.test(phoneNumber)) {
    return `Must be a valid 10-digit phone number starting with 98 (e.g., 9841234567)`
  }

  if (phoneNumber.length !== 10) {
    return `${provider === 'esewa' ? 'eSewa' : 'Khalti'} ID must be exactly 10 digits`
  }

  return '' 
}
