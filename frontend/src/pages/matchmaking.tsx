import React, { useEffect, useState, useContext } from "react";
import SocketContext from "../contexts/Socket";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import {
  Flex,
  Box,
  Button,
  Text
} from "@chakra-ui/react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import MMloading from "../assets/MMloadinggif.gif";
import "./matchmaking.css"
//import {MMClass} from "../components/matchmaking/matchmakingsocket";
import { FetchError, header, headerPost } from "../components/FetchError";
//location.host = "localhost:4000"

//client 192.168.1.31:4000
//vm en nat

/*
                 <img style={{ backgroundColor: 'transparent', alignSelf: 'center', width: 50, height: 50 }} src={notmariodontsuemenintendo} alt="loading..." />
                 <img style={{ alignSelf: 'center', width: 50, height: 50 }} src={logo} alt="loading..." />
                 <img style={{ alignSelf: 'center', width: 150, height: 50 }} src={MMchallenger} alt="loading..." />
                
*/

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
  usrSocket?.emit("startmatchmaking", obj, (res: any) => {
    console.log("startmatchmaking : " + res);
  });
};

export default function MatchmakingPage() {
  const navigate = useNavigate();
  const [count, setCount] = useState(0);
  const { usrSocket } = useContext(SocketContext);

  const findMatch = () => {
    console.log("start queue in");
    console.log(usrSocket?.id);
    usrSocket?.emit("queuein", (res) => {
      console.log("res: ");
      console.log(res);
    });
  };


  //I force queue out the user in the situations I throw the toast so they can requeue without issue
  const toastFailedQueue = () => {

    toast("🦄 Matchmaking failed due to already being in queue! \n You've been queued out, please try the matchmaking again", {
      position: "top-right",
      toastId: "toastFailedQueue",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
      });
  };

  const declineMatch = () => {
    usrSocket?.emit("declineMMmatch");
  };

  const acceptMatch = () => {
    usrSocket?.emit("acceptMMmatch");
  };

  const stopFindingMatch = () => {
    console.log("stop finding match");
    usrSocket?.emit("queueout");
  };

  type MMState = "ACCEPTED" | "DECLINED";

  const cancelRef = React.useRef(null);

  const [errorCode, setErrorCode] = useState<number>(200);
  const [Queue, enterQueue] = useState(false);

  useEffect(() => {
    console.log("load exception listener");
    usrSocket?.on("matchmakingfailed", (res: any) => {
      console.log(res);
      stopFindingMatch();
      enterQueue(false);
      toastFailedQueue();
    });

    usrSocket?.on("matchmakeGame", (res: any) => {
      //openAlert();
      console.log(res);
      navigate({ pathname: "/play-invite/" + res.idGame });
    });
    return () => {
      console.log("unload exception listener");
      stopFindingMatch();
      enterQueue(false); //resets button&spinner
      usrSocket?.off("matchmakingfailed");
      // usrSocket?.off('acceptMMmatchFailed');
      // usrSocket?.off('declineMMmatchFailed');
      usrSocket?.off("matchmakeGame");
    };
  }, [usrSocket]);

  const startMatching = (e) => {
    if (e.detail > 1)
      //prevent double click to mess with events, only allows single proper clicks
      return;
    e.preventDefault();

    if (Queue) {
      stopFindingMatch();
      enterQueue(false); //resets button&spinner
      return;
    }
    enterQueue(true);

    try {
      findMatch();
    } catch (e) {
      enterQueue(false);
      toastFailedQueue();
      console.log("end startmaztching");
    }
  };

  return (
    <>
      {errorCode && errorCode >= 400 && <FetchError code={errorCode} />}
      <div className="matchmakingPage">
        <Box
        
          >
        <Button 
            width={[
              "25%", // 0-30em
              "50%", // 30em-48em
              "75%", // 48em-62em
              "100%", // 62em+
            ]}
            alignItems={"center"}
            
        onClick={startMatching}>
            <Box>
              {Queue
                ? <Text>
                 Finding a worthy challenger... Click again to cancel </Text>
                : <Text >
                  Play Pong!</Text>}
            </Box>
        </Button>
        </Box>
        <br></br>
        {Queue && (
                <div className="matchmakingLogos">
                  <img style={{ backgroundColor: 'transparent', alignSelf: 'center', width: 500, height: 120}} src={MMloading} alt="loading..." />
                </div>
           )}
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        {/* Same as */}
        <ToastContainer />
      </div>
    </>
  );
}
