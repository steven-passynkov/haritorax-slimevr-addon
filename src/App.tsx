import React, { useEffect, useState } from "react";
import useBluetoothConnection from "./hooks/useBluetoothConnection";
import useSendData from "./hooks/useSendData";
// const { ipcRenderer } = window.require('electron');

const App = () => {
  const { status, connect, disconnectAll, devicesData } =
    useBluetoothConnection();
  // const [sendData, isLoading, error]: [
  //   (data: any) => Promise<any>,
  //   boolean,
  //   string | null
  // ] = useSendData();

  // useEffect(() => {
  //   const sendUpdatedData = async () => {
  //     if (deviceData) {
  //       const response = await sendData(deviceData);
  //       console.log(response);
  //     }
  //   };

  //   sendUpdatedData();
  // }, [deviceData]);

  // const [data, setData] = useState(null);

  // useEffect(() => {
  //   const eventSource = new EventSource("http://192.168.45.229:8000/data");

  //   eventSource.onmessage = (event) => {
  //     const newData = JSON.parse(event.data);
  //     setData(newData);
  //   };

  //   eventSource.onerror = (error) => {
  //     console.error("EventSource failed:", error);
  //   };

  //   return () => {
  //     eventSource.close();
  //   };
  // }, []);

  // useEffect(() => {
  //   ipcRenderer.on('data', (event: any, data:any) => {
  //     console.log('Received data:', data);
  //   });

  //   return () => {
  //     ipcRenderer.removeAllListeners('data');
  //   };
  // }, []);

  return (
    <div>
      <button onClick={connect}>Connect</button>
      <button onClick={disconnectAll}>Disconnect</button>
      <div>Status: {status}</div>
      <div>Data: {JSON.stringify(devicesData)}</div>
      {/* <>{error && <p>Error: {error}</p>}</>
      <div>
        <h1>Server Data:</h1>
        {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
      </div> */}
    </div>
  );
};

export default App;
