import { io } from "socket.io-client";
import React, { useEffect, useState, useContext } from "react";
import SocketContext from "../contexts/Socket";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import {
  useDisclosure,
  Flex,
  Box,
  useToast,
  Spinner,
  Button,
} from "@chakra-ui/react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import logo from "../assets/MMlogo.gif";
import MMchallenger from "../assets/newchallenjour.jpg";
import notmariodontsuemenintendo from "../assets/nostalgiamario.png";


//import {MMClass} from "../components/matchmaking/matchmakingsocket";
import { FetchError, header, headerPost } from "../components/FetchError";
//location.host = "localhost:4000"

//client 192.168.1.31:4000
//vm en nat

// Après discussion sur le pont avec la partie Play, j'enlève la partie alertes toast
//Au final, ce sera un bouton avec opt-in opt-out of queue dans la page play à côté de createroom
//Quand ça match, je crée un room au nom d'un userid pour le joueur 1, je joinroom le joueur 2 en utilisant les fonctions dans play.tsx
//Il y a un intérêt que ça passe par un room du play tsx pour qu'il soit possible de le voir dans le roomlist
// -> pouvoir spectateur un room à partir de là
//Pas de pop-up pour accepter ou decliner le match vu que ce ne n'est pas démandé dans le sujet, aucune idée sur la correction
//Peut être implementé après si le reste est bien fait
// En conclusion, la partie socket/bouton matchmaking dans cette page sera bougé dans la page Play à côté du Create Room sans le toast
// Il faudra que je disable le bouton createRoom(peut simplement if (Queue) alors rien faire ) ou empêcher un joueur de rejoindre un room avec le Queue state à true
// Tout ça à rajouter dans un play finalisé, en attendant, gérér le opt out du matchmaking et que le frontend recoit l'en dessous
//Côté backend, la fonction rungame emit vers le frontend socket id l'id du joueur avec lequel il est matché et si il est celui qui crée le room ou celui qui attend de rejoindre le room de l'autre

// Idée de douche, rajouter un component sur la page d'acceuil qui check si le serveur backend est joignable ou non avec le spinner tout con de nintendo là
// Ca nous évite les "ah bah pk il marche plus le login maintenant lol"
// Ca peut check tout bête avec un usrsocket vers le backend qui renvoie un "oui tkt je suis là" et tant qu'on n'a pas reçu de emit, on affiche un spinner
// Après faire un gateway juste sur ça est peut-être un peu trop, je peux le rajouter dans mon mmgateway mais c'est meugnon
//Il n'y a pas à check plusieurs fois, juste à check jusqu'à qu'il reçoit une réponse du backend et après on off

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
        <Button onClick={startMatching}>
          <Flex alignItems={"center"}>
            <Box>
              {Queue
                ? "Finding a worthy challenger... Click again to cancel"
                : "Play Pong!"}
            </Box>
          </Flex>
        </Button>
        <br></br>
        {Queue && (
                <div>
                 <img style={{ backgroundColor: 'transparent', alignSelf: 'center', width: 50, height: 50 }} src={notmariodontsuemenintendo} alt="loading..." />
                 <img style={{ alignSelf: 'center', width: 50, height: 50 }} src={logo} alt="loading..." />
                 <img style={{ alignSelf: 'center', width: 150, height: 50 }} src={MMchallenger} alt="loading..." />
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
