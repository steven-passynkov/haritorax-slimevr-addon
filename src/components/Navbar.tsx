import { Box, Link, Flex, Button, useColorModeValue } from "@chakra-ui/react";

const Navbar = () => {
  return (
    <Box bg={useColorModeValue("gray.100", "gray.900")} px={4}>
      <Flex h={16} alignItems={"center"} justifyContent={"space-between"}>
        <Flex alignItems={"center"}>
          <Link href="/bluetooth">Bluethooth</Link>
          <Link href="/server" ml={10}>
            Server
          </Link>
        </Flex>
        <Flex alignItems={"center"}>
          <Button variant={"solid"} colorScheme={"teal"} size={"sm"} mr={4}>
            Github page
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
};

export default Navbar;
