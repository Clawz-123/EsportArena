import { useDispatch, useSelector } from 'react-redux';

// Custom hooks for using dispatch and selector with typed store
export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;