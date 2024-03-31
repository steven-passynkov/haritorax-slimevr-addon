import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface DeviceData {
  deviceName?: string;
  rotation?: {
    x: number;
    y: number;
    z: number;
    w: number;
  };
  rotation_Euler?: {
    x: number;
    y: number;
    z: number;
  };
  acceleration?: {
    x: number;
    y: number;
    z: number;
  };
  battery?: number;
}

export interface BluetoothState {
  status: string | null;
  devicesData: { [key: string]: DeviceData };
  selectedId: string | null; // Add this line
}

const initialState: BluetoothState = {
  status: null,
  devicesData: {},
  selectedId: null, // And this line
};

const bluetoothSlice = createSlice({
  name: 'bluetooth',
  initialState,
  reducers: {
    setStatus: (state, action: PayloadAction<string | null>) => {
      state.status = action.payload;
    },
    setDevicesData: (state, action: PayloadAction<{ id: string; data: DeviceData }>) => {
      const { id, data } = action.payload;
      state.devicesData[id] = {
        ...state.devicesData[id],
        ...data,
      };
    },
    setSelectedId: (state, action: PayloadAction<string | null>) => { // And this reducer
      state.selectedId = action.payload;
    },
    resetDevicesData: (state) => {
      state.devicesData = {};
    },
  },
});

export const { setStatus, setDevicesData, setSelectedId, resetDevicesData } = bluetoothSlice.actions;

export default bluetoothSlice.reducer;
