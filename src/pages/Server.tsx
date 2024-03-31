import { Button, Text } from "@chakra-ui/react";

interface ServerProps {
  handleSendData: () => void;
  isLoading: boolean;
  error: any;
  selectedData: any;
}

const Server = ({ handleSendData, isLoading, error, selectedData }: ServerProps) => {
  return (
    <div>
      <Button colorScheme="blue" onClick={handleSendData} isLoading={isLoading}>
        Connect to Server
      </Button>
      {error && <Text color="red.500">Error: {error.message}</Text>}
      {selectedData && <Text>Sending data: {JSON.stringify(selectedData)}</Text>}
    </div>
  );
};

export default Server;
