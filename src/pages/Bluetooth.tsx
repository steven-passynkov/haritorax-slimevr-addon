import { Box, Button, VStack, Text } from "@chakra-ui/react";
import useBluetoothConnection from "../hooks/useBluetoothConnection";

const BluetoothTab = () => {
  const { status, connect, disconnectAll, devicesData } =
    useBluetoothConnection();

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
          <Text>Status: {status}</Text>
        </Box>
        <Box>
          <Text>Data: {JSON.stringify(devicesData)}</Text>
        </Box>
      </VStack>
    </Box>
  );
};

export default BluetoothTab;
