import { useState } from "react";
import Quaternion from "quaternion";
import { Quaternion as QuaternionThree, Vector3 } from "three";
const noble = window.require("@abandonware/noble");

type Rotation = {
  w: number;
  x: number;
  y: number;
  z: number;
};

interface RotationDifference {
  pitch: number;
  roll: number;
  yaw: number;
}

interface Gravity {
  x: number;
  y: number;
  z: number;
}

interface DeviceData {
  [deviceId: string]: {
    deviceName?: string;
    rotation?: {
      x: number;
      y: number;
      z: number;
      w: number;
    };
    acceleration?: {
      x: number;
      y: number;
      z: number;
    };
    battery?: number;
  };
}

interface State {
  devices: {
    [deviceId: string]: {
      initialRotations?: any;
      initialAccel?: any;
      startTime?: number;
      // calibrated?: boolean;
      // calibratedValues?: any;
      calibrated?: any;
      driftvalues: { pitch: number; roll: number; yaw: number };
      trackerrotation?: any;
      trackeraccel?: any;
    };
  };
  DriftInterval: number;
}

const RotateAround = (quat: Quaternion, vector: any, angle: any): Rotation => {
  var initialQuaternion = new QuaternionThree(quat.x, quat.y, quat.z, quat.w);
  var rotationAxis = new Vector3(vector.x, vector.y, vector.z);
  var rotationQuaternion = new QuaternionThree();

  rotationQuaternion.setFromAxisAngle(rotationAxis.normalize(), angle);
  initialQuaternion = initialQuaternion
    .multiply(rotationQuaternion)
    .normalize();

  return {
    w: initialQuaternion.x,
    x: initialQuaternion.y,
    y: initialQuaternion.z,
    z: initialQuaternion.w,
  };
};

const calculateRotationDifference = (
  prevRotation: RotationDifference,
  currentRotation: RotationDifference
): RotationDifference => {
  const pitchDifferenceRad = currentRotation.pitch - prevRotation.pitch;
  const rollDifferenceRad = currentRotation.roll - prevRotation.roll;
  const yawDifferenceRad = currentRotation.yaw - prevRotation.yaw;

  return {
    pitch: pitchDifferenceRad,
    roll: rollDifferenceRad,
    yaw: yawDifferenceRad,
  };
};

// Add the distance sencor for the feet

function lerp(a: number, b: number, t: number) {
  return a * (1 - t) + b * t;
}

function interpolateIMU(currentData: any, newData: any, t: number) {
  if (t == 1) {
    return newData;
  }

  return {
    rotation: {
      x: lerp(currentData.rotation.x, newData.rotation.x, t),
      y: lerp(currentData.rotation.y, newData.rotation.y, t),
      z: lerp(currentData.rotation.z, newData.rotation.z, t),
      w: lerp(currentData.rotation.w, newData.rotation.w, t),
    },
    acceleration: {
      x: lerp(currentData.acceleration.x, newData.acceleration.x, t),
      y: lerp(currentData.acceleration.y, newData.acceleration.y, t),
      z: lerp(currentData.acceleration.z, newData.acceleration.z, t),
    },
    // battery: newData.battery,
    // yawReset: newData.yawReset,
  };
}

const useBluetoothConnection = () => {
  const [status, setStatus] = useState("");
  const [devicesData, setDevicesData] = useState<DeviceData>({});
  const [connectedPeripherals, setConnectedPeripherals] = useState<any[]>([]);

  // const [state, setState] = useState<State>({
  //   devices: {},
  //   DriftInterval: 15000,
  // });

  // make new coplitot and do battary for multiple trackers

  // function decodeIMUPacket(device: any, rawdata: any) {
  //   const deviceId = device.id;
  //   const dataView = rawdata;

  //   let currentTime = Date.now();

  //   if (!state.devices[deviceId]) {
  //     setState((prevState) => ({
  //       ...prevState,
  //       devices: {
  //         ...prevState.devices,
  //         [deviceId]: {
  //           startTime: currentTime,
  //         },
  //       },
    //   }));
    // } else {
    //   currentTime = state.devices[deviceId].startTime;
    // }

    // const elapsedTime = Date.now() - currentTime;

    // const rotation = {
    //   x: (dataView.getInt16(0, true) / 180.0) * 0.01,
    //   y: (dataView.getInt16(2, true) / 180.0) * 0.01,
    //   z: (dataView.getInt16(4, true) / 180.0) * 0.01 * -1.0,
    //   w: (dataView.getInt16(6, true) / 180.0) * 0.01 * -1.0,
    // };

    // setState((prevState) => ({
    //   ...prevState,
    //   devices: {
    //     ...prevState.devices,
    //     [deviceId]: {
    //       ...prevState.devices[deviceId],
    //       trackerrotation: rotation,
    //     },
    //   },
    // }));

    // const gravityRaw = {
    //   x: dataView.getInt16(8, true) / 256.0,
    //   y: dataView.getInt16(10, true) / 256.0,
    //   z: dataView.getInt16(12, true) / 256.0,
    // };

    // const gravityRawGForce = {
    //   x: dataView.getInt16(8, true) / 256.0 / 9.81,
    //   y: dataView.getInt16(10, true) / 256.0 / 9.81,
    //   z: dataView.getInt16(12, true) / 256.0 / 9.81,
    // };

    // setState((prevState) => ({
    //   ...prevState,
    //   devices: {
    //     ...prevState.devices,
    //     [deviceId]: {
    //       ...prevState.devices[deviceId],
    //       trackeraccel: gravityRaw,
    //     },
    //   },
    // }));

    // const rc = [rotation.w, rotation.x, rotation.y, rotation.z];
    // const r = [rc[0], -rc[1], -rc[2], -rc[3]];
    // const p = [0.0, 0.0, 0.0, 9.8];

    // const hrp = [
    //   r[0] * p[0] - r[1] * p[1] - r[2] * p[2] - r[3] * p[3],
    //   r[0] * p[1] + r[1] * p[0] + r[2] * p[3] - r[3] * p[2],
    //   r[0] * p[2] - r[1] * p[3] + r[2] * p[0] + r[3] * p[1],
    //   r[0] * p[3] + r[1] * p[2] - r[2] * p[1] + r[3] * p[0],
    // ];

    // const hfinal = [
    //   hrp[0] * rc[0] - hrp[1] * rc[1] - hrp[2] * rc[2] - hrp[3] * rc[3],
    //   hrp[0] * rc[1] + hrp[1] * rc[0] + hrp[2] * rc[3] - hrp[3] * rc[2],
    //   hrp[0] * rc[2] - hrp[1] * rc[3] + hrp[2] * rc[0] + hrp[3] * rc[1],
    //   hrp[0] * rc[3] + hrp[1] * rc[2] - hrp[2] * rc[1] + hrp[3] * rc[0],
    // ];

    // const gravity = {
    //   x: gravityRaw.x - hfinal[1] * -1.2,
    //   y: gravityRaw.y - hfinal[2] * -1.2,
    //   z: gravityRaw.z - hfinal[3] * 1.2,
    // };

    // if (elapsedTime >= state.DriftInterval) {
    //   if (!state.devices[deviceId].calibrated) {
    //     let newCalibrated = { ...state.devices.calibrated };
    //     newCalibrated = {
    //       pitch: state.devices[deviceId].driftvalues.pitch,
    //       roll: state.devices[deviceId].driftvalues.roll,
    //       yaw: state.devices[deviceId].driftvalues.yaw,
    //     };

    //     setState((prevState) => ({
    //       ...prevState,
    //       devices: {
    //         ...prevState.devices,
    //         [deviceId]: {
    //           ...prevState.devices[deviceId],
    //           calibrated: newCalibrated,
    //         },
    //       },
    //     }));
    //   }
    // }

    // if (elapsedTime < state.DriftInterval) {
    //   if (state.devices[deviceId] && !state.devices[deviceId].driftvalues) {
    //     state.devices[deviceId].driftvalues = { pitch: 0, roll: 0, yaw: 0 };
    //   }

    //   const initialEuler = new Quaternion(
    //     state.devices[deviceId].initialRotations.w,
    //     state.devices[deviceId].initialRotations.x,
    //     state.devices[deviceId].initialRotations.y,
    //     state.devices[deviceId].initialRotations.z
    //   ).toEuler("XYZ");
    //   const rotationEuler = new Quaternion(
    //     rotation.w,
    //     rotation.x,
    //     rotation.y,
    //     rotation.z
    //   ).toEuler("XYZ");

    //   const initialRotationDifference: RotationDifference = {
    //     pitch: initialEuler[0],
    //     roll: initialEuler[1],
    //     yaw: initialEuler[2],
    //   };
    //   const currentRotationDifference: RotationDifference = {
    //     pitch: rotationEuler[0],
    //     roll: rotationEuler[1],
    //     yaw: rotationEuler[2],
  //     };

  //     const rotationDifference = calculateRotationDifference(
  //       initialRotationDifference,
  //       currentRotationDifference
  //     );

  //     const prevMagnitude = Math.sqrt(
  //       state.devices[deviceId].driftvalues.pitch ** 2 +
  //         state.devices[deviceId].driftvalues.roll ** 2 +
  //         state.devices[deviceId].driftvalues.yaw ** 2
  //     );
  //     const currMagnitude = Math.sqrt(
  //       rotationDifference.pitch ** 2 +
  //         rotationDifference.roll ** 2 +
  //         rotationDifference.yaw ** 2
  //     );

  //     if (currMagnitude > prevMagnitude) {
  //       state.devices[deviceId].driftvalues = rotationDifference;
  //       console.log(state.devices[deviceId].driftvalues);
  //     }
  //   }

  //   if (
  //     elapsedTime >= state.DriftInterval &&
  //     state.devices[deviceId].calibrated
  //   ) {
  //     const driftCorrection = {
  //       pitch:
  //         (state.devices[deviceId].calibrated.pitch *
  //           (elapsedTime / state.DriftInterval)) %
  //         (2 * Math.PI),
  //       roll:
  //         (state.devices[deviceId].calibrated.roll *
  //           (elapsedTime / state.DriftInterval)) %
  //         (2 * Math.PI),
  //       yaw:
  //         (state.devices[deviceId].calibrated.yaw *
  //           (elapsedTime / state.DriftInterval)) %
  //         (2 * Math.PI),
  //     };
  //     const rotQuat = new Quaternion([
  //       rotation.w,
  //       rotation.x,
  //       rotation.y,
  //       rotation.z,
  //     ]);

  //     const rotationDriftCorrected = RotateAround(
  //       rotQuat,
  //       state.devices[deviceId].trackeraccel,
  //       driftCorrection.yaw
  //     );

  //     console.log("Applied fix");
  //     console.log(rotation);
  //     console.log(rotationDriftCorrected, driftCorrection.yaw);

  //     return [device, rotationDriftCorrected, gravity];
  //   }
  //   // Return original rotation data
  //   return [device, rotation, gravity];
  // }

  // original code

  const [state, setState] = useState<State>({
    initialRotations: {},
    initialAccel: {},
    startTimes: {},
    calibrated: {},
    driftvalues: {},
    trackerrotation: {},
    trackeraccel: {},
    DriftInterval: 15000,
  });

  console.log(state);

  function decodeIMUPacket(device: any, rawdata: any) {
    const deviceId = device.id;
    const dataView = rawdata;

    const elapsedTime = Date.now() - state.startTimes[deviceId];

    const rotation = {
      x: (dataView.getInt16(0, true) / 180.0) * 0.01,
      y: (dataView.getInt16(2, true) / 180.0) * 0.01,
      z: (dataView.getInt16(4, true) / 180.0) * 0.01 * -1.0,
      w: (dataView.getInt16(6, true) / 180.0) * 0.01 * -1.0,
    };
    setState((prevState) => ({
      ...prevState,
      trackerrotation: {
        ...prevState.trackerrotation,
        [deviceId]: rotation,
      },
    }));

    const gravityRaw = {
      x: dataView.getInt16(8, true) / 256.0,
      y: dataView.getInt16(10, true) / 256.0,
      z: dataView.getInt16(12, true) / 256.0,
    };

    const gravityRawGForce = {
      x: dataView.getInt16(8, true) / 256.0 / 9.81,
      y: dataView.getInt16(10, true) / 256.0 / 9.81,
      z: dataView.getInt16(12, true) / 256.0 / 9.81,
    };

    setState((prevState) => ({
      ...prevState,
      trackeraccel: {
        ...prevState.trackeraccel,
        [deviceId]: gravityRaw,
      },
    }));

    const rc = [rotation.w, rotation.x, rotation.y, rotation.z];
    const r = [rc[0], -rc[1], -rc[2], -rc[3]];
    const p = [0.0, 0.0, 0.0, 9.8];

    const hrp = [
      r[0] * p[0] - r[1] * p[1] - r[2] * p[2] - r[3] * p[3],
      r[0] * p[1] + r[1] * p[0] + r[2] * p[3] - r[3] * p[2],
      r[0] * p[2] - r[1] * p[3] + r[2] * p[0] + r[3] * p[1],
      r[0] * p[3] + r[1] * p[2] - r[2] * p[1] + r[3] * p[0],
    ];

    const hfinal = [
      hrp[0] * rc[0] - hrp[1] * rc[1] - hrp[2] * rc[2] - hrp[3] * rc[3],
      hrp[0] * rc[1] + hrp[1] * rc[0] + hrp[2] * rc[3] - hrp[3] * rc[2],
      hrp[0] * rc[2] - hrp[1] * rc[3] + hrp[2] * rc[0] + hrp[3] * rc[1],
      hrp[0] * rc[3] + hrp[1] * rc[2] - hrp[2] * rc[1] + hrp[3] * rc[0],
    ];

    const gravity = {
      x: gravityRaw.x - hfinal[1] * -1.2,
      y: gravityRaw.y - hfinal[2] * -1.2,
      z: gravityRaw.z - hfinal[3] * 1.2,
    };

    if (elapsedTime >= state.DriftInterval) {
      if (!state.calibrated[deviceId]) {
        let newCalibrated = { ...state.calibrated };
        newCalibrated[deviceId] = {
          pitch: state.driftvalues[deviceId].pitch,
          roll: state.driftvalues[deviceId].roll,
          yaw: state.driftvalues[deviceId].yaw,
        };
        setState((prevState) => ({ ...prevState, calibrated: newCalibrated }));
      }
    }

    if (elapsedTime < state.DriftInterval) {
      if (!state.driftvalues[deviceId]) {
        state.driftvalues[deviceId] = { pitch: 0, roll: 0, yaw: 0 };
      }

      const initialEuler = new Quaternion(
        state.initialRotations[deviceId].w,
        state.initialRotations[deviceId].x,
        state.initialRotations[deviceId].y,
        state.initialRotations[deviceId].z
      ).toEuler("XYZ");
      const rotationEuler = new Quaternion(
        rotation.w,
        rotation.x,
        rotation.y,
        rotation.z
      ).toEuler("XYZ");

      const initialRotationDifference: RotationDifference = {
        pitch: initialEuler[0],
        roll: initialEuler[1],
        yaw: initialEuler[2],
      };
      const currentRotationDifference: RotationDifference = {
        pitch: rotationEuler[0],
        roll: rotationEuler[1],
        yaw: rotationEuler[2],
      };

      const rotationDifference = calculateRotationDifference(
        initialRotationDifference,
        currentRotationDifference
      );

      const prevMagnitude = Math.sqrt(
        state.driftvalues[deviceId].pitch ** 2 +
          state.driftvalues[deviceId].roll ** 2 +
          state.driftvalues[deviceId].yaw ** 2
      );
      const currMagnitude = Math.sqrt(
        rotationDifference.pitch ** 2 +
          rotationDifference.roll ** 2 +
          rotationDifference.yaw ** 2
      );

      if (currMagnitude > prevMagnitude) {
        state.driftvalues[deviceId] = rotationDifference;
        console.log(state.driftvalues[deviceId]);
      }
    }

    if (elapsedTime >= state.DriftInterval && state.calibrated[deviceId]) {
      const driftCorrection = {
        pitch:
          (state.calibrated[deviceId].pitch *
            (elapsedTime / state.DriftInterval)) %
          (2 * Math.PI),
        roll:
          (state.calibrated[deviceId].roll *
            (elapsedTime / state.DriftInterval)) %
          (2 * Math.PI),
        yaw:
          (state.calibrated[deviceId].yaw *
            (elapsedTime / state.DriftInterval)) %
          (2 * Math.PI),
      };
      const rotQuat = new Quaternion([
        rotation.w,
        rotation.x,
        rotation.y,
        rotation.z,
      ]);

      const rotationDriftCorrected = RotateAround(
        rotQuat,
        state.trackeraccel[deviceId],
        driftCorrection.yaw
      );

      console.log("Applied fix");
      console.log(rotation);
      console.log(rotationDriftCorrected, driftCorrection.yaw);

      return [device, rotationDriftCorrected, gravity];
    }
    // Return original rotation data
    return [device, rotation, gravity];
  }

  const connect = () => {
    noble.on("stateChange", function (state: string) {
      if (state === "poweredOn") {
        noble.startScanning();
      } else {
        noble.stopScanning();
      }
    });
    noble.on("discover", function (peripheral: any) {
      if (
        peripheral.advertisement.localName &&
        peripheral.advertisement.localName.startsWith("HaritoraXW-")
      ) {
        peripheral.connect(function (err: Error) {
          if (err) {
            setStatus(
              `Error connecting to ${peripheral.advertisement.localName}`
            );
            return;
          }

          setStatus(`Connected to ${peripheral.advertisement.localName}`);
          setConnectedPeripherals((prevPeripherals) => [
            ...prevPeripherals,
            peripheral,
          ]);

          peripheral.discoverAllServicesAndCharacteristics(
            (err, services, characteristics) => {
              if (err) {
                console.error(
                  "Error discovering services and characteristics",
                  err
                );
                return;
              }

              services.forEach((service) => {
                service.discoverCharacteristics([], (err, characteristics) => {
                  if (err) {
                    console.error("Error discovering characteristics", err);
                    return;
                  }

                  characteristics.forEach((characteristic) => {
                    if (
                      characteristic.uuid === "00dbf1c690aa11eda1eb0242ac120002"
                    ) {
                      characteristic.read((err, data) => {
                        if (err) {
                          console.error("Error reading characteristic", err);
                          return;
                        }
                      });

                      characteristic.subscribe(function (err) {
                        if (err) {
                          console.error(
                            "Error subscribing to characteristic",
                            err
                          );
                          return;
                        }
                      });

                      
                      characteristic.on(
                        "data",
                        function (data, isNotification) {
                          let postData = {};
                          let postDataCurrent = null;
                      
                          let dataView = new DataView(data.buffer);
                      
                          const IMUData = decodeIMUPacket(peripheral, dataView);
                      
                          postData = {
                            deviceName: peripheral.advertisement.localName,
                            deviceId: peripheral.id,
                            rotation: {
                              x: IMUData[1].x,
                              y: IMUData[1].y,
                              z: IMUData[1].z,
                              w: IMUData[1].w,
                            },
                            acceleration: {
                              x: IMUData[2].x,
                              y: IMUData[2].y,
                              z: IMUData[2].z,
                            },
                          };
                      
                          if (postDataCurrent == null) {
                            postDataCurrent = IMUData;
                          }
                      
                          postDataCurrent = interpolateIMU(
                            postDataCurrent,
                            postData,
                            1
                          );
                      
                          const rotation = new Quaternion([
                            postDataCurrent["rotation"].w,
                            postDataCurrent["rotation"].x,
                            postDataCurrent["rotation"].y,
                            postDataCurrent["rotation"].z,
                          ]);
                          const rotation_Euler_raw = rotation.toEuler("XYZ");
                      
                          const rotation_Euler = {
                            x: rotation_Euler_raw[0] * (180 / Math.PI),
                            y: rotation_Euler_raw[1] * (180 / Math.PI),
                            z: rotation_Euler_raw[2] * (180 / Math.PI),
                          };
                      
                          const { x: rotX, y: rotY, z: rotZ } = rotation_Euler;
                          const {
                            x: accelX,
                            y: accelY,
                            z: accelZ,
                          } = postDataCurrent["acceleration"];
                      
                          setDevicesData((prevData) => ({
                            ...prevData,
                            [peripheral.id]: {
                              ...prevData[peripheral.id],
                              ...postData,
                              rotation_Euler: {
                                x: rotX,
                                y: rotY,
                                z: rotZ,
                              },
                              acceleration: {
                                x: accelX,
                                y: accelY,
                                z: accelZ,
                              },
                            },
                          }));
                        }
                      );
                    }
                    if (characteristic.uuid === "2a19") {
                      characteristic.read((err, data) => {
                        if (err) {
                          console.error("Error reading characteristic", err);
                          return;
                        }
                      });
                    
                      characteristic.subscribe(function (err) {
                        if (err) {
                          console.error(
                            "Error subscribing to characteristic",
                            err
                          );
                          return;
                        }
                      });
                    
                      characteristic.on(
                        "data",
                        function (data, isNotification) {
                          console.log(data);
                          setDevicesData((prevData) => ({
                            ...prevData,
                            [peripheral.id]: {
                              ...prevData[peripheral.id],
                              battery: data[0],
                            },
                          }));
                          console.log(devicesData)
                        }
                      );
                    }
                  });
                });
              });
            }
          );
        });
      }
    });
  };

  const reset = () => {
    setStatus("");
    setDevicesData({});
    setConnectedPeripherals([]);
    noble.stopScanning();
  };

  const disconnect = async (id: string) => {
    const peripheral = connectedPeripherals.find((p) => p.id === id);
    if (peripheral) {
      try {
        await new Promise<void>((resolve, reject) => {
          peripheral.disconnect((err: Error) => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
        });
        reset();
      } catch (error) {
        console.error("Error disconnecting from Bluetooth device:", error);
      }
    }
  };

  const disconnectAll = () => {
    connectedPeripherals.forEach((p) => disconnect(p.id));
  };

  return { status, connect, disconnect, disconnectAll, devicesData };
};

export default useBluetoothConnection;