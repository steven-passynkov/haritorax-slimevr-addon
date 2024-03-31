import {useState, useEffect} from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import BluetoothTab from "./pages/Bluetooth";
import Server from "./pages/Server";
import { useSelector } from "react-redux";
import { RootState } from "./store/store";
import Navbar from "./components/Navbar";
import useBluetoothConnection from "./hooks/useBluetoothConnection";
import useSendData from "./hooks/useSendData";

const App = () => {
  const { connect, disconnectAll } = useBluetoothConnection();
  const bluetooth = useSelector((state: RootState) => state.bluetooth);
  const selectedData = bluetooth.selectedId
    ? bluetooth.devicesData[bluetooth.selectedId]
    : null;

  const handleSendData = async () => {
    if (selectedData) {
      try {
        const responseData = await sendData(selectedData);
        console.log("Response data:", responseData);
      } catch (err) {
        console.log("Error sending data:", err);
      }
    }
  };

  const [sendData, isLoading, error]: [
    (data: any) => Promise<any>,
    boolean,
    string | null
  ] = useSendData();

  useEffect(() => {
    const sendUpdatedData = async () => {
      if (bluetooth.devicesData) {
        const response = await sendData(bluetooth.devicesData);
        console.log(response);
      }
    };

    sendUpdatedData();
  }, [bluetooth.devicesData]);

  const [data, setData] = useState(null);

  useEffect(() => {
    const eventSource = new EventSource("http://localhost:8000/data");

    eventSource.onmessage = (event) => {
      const newData = JSON.parse(event.data);
      setData(newData);
    };

    eventSource.onerror = (error) => {
      console.error("EventSource failed:", error);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  console.log(data);

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/bluetooth" />} />
        <Route path="/bluetooth" element={<BluetoothTab connect={connect} disconnectAll={disconnectAll} />} />
        <Route
          path="/server"
          element={
            <Server
              handleSendData={handleSendData}
              isLoading={isLoading}
              error={error}
              selectedData={selectedData}
            />
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
