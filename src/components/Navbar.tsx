import { Box, Flex, Button, useColorModeValue } from "@chakra-ui/react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <Box bg={useColorModeValue("gray.100", "gray.900")} px={4}>
      <Flex h={16} alignItems={"center"} justifyContent={"space-between"}>
        <Flex alignItems={"center"}>
          <Link to="/bluetooth">Bluethooth</Link>
          <Link to="/server" style={{ marginLeft: '10px' }}>
            Server
          </Link>
        </Flex>
        <Flex alignItems={"center"}>
          <Button
            variant={"solid"}
            colorScheme={"teal"}
            size={"sm"}
            mr={4}
            onClick={() =>{
              window.open('https://github.com/steven-passynkov/haritorax-slimevr-addon/tree/master')}
            }
          >
            Github page
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
};

export default Navbar;
