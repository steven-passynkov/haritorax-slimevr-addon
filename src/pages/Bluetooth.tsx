import { Box, Button, VStack, Text } from "@chakra-ui/react";
import { useSelector } from "react-redux";

interface BluetoothTabProps {
  connect: () => Promise<void>;
  disconnectAll: () => void;
}

const BluetoothTab = ({ connect, disconnectAll }: BluetoothTabProps) => {
  const bluetooth = useSelector((state: any) => state.bluetooth);

  return (
    <Box p={5}>
      <VStack spacing={5}>
        <Box>
          <Button colorScheme="teal" onClick={connect}>
            Connect
          </Button>
          <Button colorScheme="red" onClick={disconnectAll} ml={3}>
            Disconnect
          </Button>
        </Box>
        <Box>
          <Text>Status: {bluetooth.status}</Text>
        </Box>
        <Box>
          <Text>Data: {JSON.stringify(bluetooth.devicesData)}</Text>
        </Box>
      </VStack>
    </Box>
  );
};

export default BluetoothTab;
