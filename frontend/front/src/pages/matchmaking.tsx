import { io } from "socket.io-client";
import React, {
  useEffect,
  useState,
  useContext,
} from "react";
import { SocketContext } from "../contexts/Socket";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import {
  useDisclosure,
  Flex,
  Box,
  useToast,
  Spinner,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogCloseButton,
  AlertDialogBody,
  AlertDialogFooter,
  Button,
} from "@chakra-ui/react";


//location.host = "localhost:4000"

//client 192.168.1.31:4000
//vm en nat

const startmatchmaking = async (
  e: React.MouseEvent<HTMLButtonElement>,
  usrSocket: any,
  obj: {
    idUser: string;
  },
  navigate: any
) => {
  e.preventDefault();
  console.log(obj);
  usrSocket.emit("startmatchmaking", obj, (res: any) => {
    console.log("startmatchmaking : " + res);
  });
};

export default function MatchmakingPage() {
  const toastId = "match-finder-error-toast";

  const toast = useToast();
  const navigate = useNavigate();
  const [count, setCount] = useState(0);
  const usrSocket = useContext(SocketContext);

  type MMState = "ACCEPTED" | "DECLINED";

  const cancelRef = React.useRef(null);

  const {
    isOpen: isAlertOpen,
    onOpen: openAlert,
    onClose: closeAlert,
  } = useDisclosure();

  const [Queue, enterQueue] = useState(false);

  useEffect(() => {});

  const onQueuePop = () => {
    openAlert();
  };

  const startMatching = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    enterQueue(true);
    try {
      //find match function?
    } catch (e) {
      toast({
        id: toastId,
        title: "Queue error",
        status: "error",
        description: "Encountered an error while queuing",
        isClosable: true,
        duration: 10000,
      });
      enterQueue(false);
    }
  };
  //In both cases, an alert is supposed to show up and it's dismissed
  const refuseMatch = () => {
    //user refused the match found by queue;
    closeAlert();
  };

  const acceptMatch = () => {
    //user accepted the match found by queue
    closeAlert();
  };

  return (
    <div className="matchmakingPage">
      <Button onClick={startMatching}>
        <Flex alignItems={"center"}>
          <Box>{Queue ? "Finding a worthy challenger..." : "Play Pong!"}</Box>
          {Queue && (
            <Box>
              <Spinner
                thickness="5px"
                speed="0.40s"
                emptyColor="red"
                color="blue"
                size="xl"
                boxSize={30}
              />
            </Box>
          )}
        </Flex>
      </Button>
      <AlertDialog
        motionPreset="slideInBottom"
        onClose={closeAlert}
        isOpen={isAlertOpen}
        isCentered
        closeOnEsc={false}
        closeOnOverlayClick={false}
        leastDestructiveRef={React.useRef(null)}
      >
        <AlertDialogOverlay />
        <AlertDialogContent>
          <AlertDialogHeader>A new Challenger has arrived</AlertDialogHeader>
          <AlertDialogCloseButton />
          <AlertDialogBody>Are you ready for the next battle?</AlertDialogBody>
          <AlertDialogFooter>
            <Button color="#f194ff" onClick={acceptMatch}>
              Accept
            </Button>
            <Button color="#f194ff" onClick={refuseMatch}></Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
