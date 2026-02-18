import * as Yup from 'yup';

const matchAnnouncementValidation = Yup.object().shape({
  roomId: Yup.string()
    .required('Room ID is required.')
    .matches(/^[0-9]+$/, 'Room ID must contain only numbers.'),
  roomPass: Yup.string().required('Room Pass is required.'),
  description: Yup.string()
    .required('Description is required.')
    .min(10, 'Description must be at least 10 characters.'),
});

export default matchAnnouncementValidation;
