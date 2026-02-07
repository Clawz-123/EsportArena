import * as Yup from 'yup';

export const MatchValidationSchema = Yup.object().shape({
  group: Yup.string().required('Group is required'),
  matchNumber: Yup.number()
    .typeError('Match number must be a number')
    .required('Match number is required')
    .min(1, 'Match number must be at least 1'),
  dateTime: Yup.string().required('Date & Time is required'),
});
