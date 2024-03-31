import { configureStore } from '@reduxjs/toolkit';
import bluetoothReducer, { BluetoothState } from './reducers/bluetoothSlice';

const store = configureStore({
  reducer: {
    bluetooth: bluetoothReducer,
  },
});

export type RootState = {
  bluetooth: BluetoothState;
};

export default store;
