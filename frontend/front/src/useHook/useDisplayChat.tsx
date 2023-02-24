/*import React, { useRef, useEffect, useState, useCallback } from "react";

const useDisplayChat = () => {
    const refOne: any = useRef();
    const refTwo: any = useRef();
    //const [renderDirectMessage, setDisplay] = useState<boolean>(false);
    const cb = useCallback(() => {
        console.log("refOne:");
        console.log(refOne);
        console.log("refTwo:");
        console.log(refTwo);
    }, []);
    useEffect(() => {
        document.addEventListener("click", cb);
    return () => {
      document.removeEventListener("click", cb)
    };
    });
    return ([refOne, refTwo]);
}

export default useDisplayChat;
*/