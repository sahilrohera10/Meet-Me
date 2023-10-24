import React, { useCallback, useEffect, useState, useRef } from "react";
import { useSocket } from "../context/SocketProvider";
import ReactPlayer from "react-player";
import peer from "../service/peer";
import "../Screens/Room.css";
import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";

import {
  BsFillCameraVideoFill,
  BsFillCameraVideoOffFill,
} from "react-icons/bs";
import { AiOutlineAudio, AiOutlineAudioMuted } from "react-icons/ai";
import { MdCallEnd } from "react-icons/md";

import { useParams } from "react-router-dom";
import { CopyToClipboard } from "react-copy-to-clipboard";

export default function Room() {
  let { roomId } = useParams();
  const navigate = useNavigate();

  const [iscopy, setIscopy] = useState(false);
  const [invite, setInvite] = useState("");
  const [isinvite, setIsinvite] = useState(false);
  const [incomming, setIncomming] = useState(false);
  const [isaccept, setIsaccept] = useState(false);
  const [userName, setUserName] = useState("");
  const [lastName, setLastName] = useState("");

  const [remoteName, setRemoteName] = useState("");

  useEffect(() => {
    setTimeout(() => {
      setIscopy(false);
    }, 3000);
  }, [iscopy]);

  const socket = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState();
  const [remoteStream, setRemoteStream] = useState();

  const [videoEnabled, setVideoEnabled] = useState(true); // To track video status
  const [audioEnabled, setAudioEnabled] = useState(true); // To track audio status

  const toggleVideo = () => {
    myStream.getVideoTracks()[0].enabled = !videoEnabled;
    setVideoEnabled(!videoEnabled);
  };

  const toggleAudio = () => {
    myStream.getAudioTracks()[0].enabled = !audioEnabled;
    setAudioEnabled(!audioEnabled);
  };

  const handleUserJoined = useCallback(({ email, id, name }) => {
    console.log(`Email ${email} has joined the room`);
    setRemoteName(name);
    setInvite(email);
    setRemoteSocketId(id);
  }, []);

  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    const offer = await peer.getOffer();
    socket.emit("user:call", { to: remoteSocketId, offer, userName, lastName });
    setMyStream(stream);
    setIsinvite(true);
  }, [remoteSocketId, socket]);

  const handleIncommingCall = useCallback(
    async ({ from, offer, userName, lastName }) => {
      setRemoteSocketId(from);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      const name = userName + " " + lastName;
      setRemoteName(name);
      setMyStream(stream);
      console.log(`Incomming Call`, from, offer);
      setIncomming(true);
      const ans = await peer.getAnswer(offer);
      socket.emit("call:accepted", { to: from, ans });
    },
    [socket]
  );

  const sendStreams = useCallback(() => {
    for (const track of myStream.getTracks()) {
      peer.peer.addTrack(track, myStream);
      setIsaccept(true);
    }
  }, [myStream]);

  const handleCallAccepted = useCallback(
    ({ from, ans }) => {
      peer.setLocalDescription(ans);
      console.log("call accepted!");
      sendStreams();
    },
    [sendStreams]
  );

  const handleNegoNeeded = useCallback(async () => {
    const offer = await peer.getOffer();
    socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
  }, [remoteSocketId, socket]);
  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded]);

  const handleNegoNeedIncomming = useCallback(
    async ({ from, offer }) => {
      const ans = await peer.getAnswer(offer);
      socket.emit("peer:nego:done", { to: from, ans });
    },
    [socket]
  );

  const handleNegoFinal = useCallback(async ({ from, ans }) => {
    await peer.setLocalDescription(ans);
  }, []);

  useEffect(() => {
    peer.peer.addEventListener("track", async (ev) => {
      const remoteStream = ev.streams;
      setRemoteStream(remoteStream[0]);
      console.log("remote stream=>", remoteStream[0]);
    });
  }, []);

  useEffect(() => {
    const user_name = localStorage.getItem("userName");
    setUserName(user_name);
    const last_name = localStorage.getItem("lastName");
    setLastName(last_name);
  }, []);

  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("incomming:call", handleIncommingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegoNeedIncomming);
    socket.on("peer:nego:final", handleNegoFinal);

    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incomming:call", handleIncommingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoNeedIncomming);
      socket.off("peer:nego:final", handleNegoFinal);
    };
  }, [
    socket,
    handleUserJoined,
    handleIncommingCall,
    handleCallAccepted,
    handleNegoNeedIncomming,
    handleNegoFinal,
  ]);
  const videoRef = useRef();
  const videoStyles = {
    width: "100%", // Set the width as you like
    height: "auto", // Set the height as you like
    borderRadius: "100px", // Add a border radius or any other styling you need
  };

  const endcall = () => {
    navigate("/");
    window.location.reload();
  };

  return (
    <div
      style={{
        backgroundColor: "rgb(32,33,36)",
        width: "100vw",
        height: "100vh",
      }}
    >
      <h1 style={{ color: "white" }}>Meet-Me's Room</h1>
      <h3 style={{ color: "white" }}>
        {" "}
        {remoteSocketId ? "" : "No one is here !"}{" "}
      </h3>
      {/* {myStream && <button onClick={sendStreams}>Send Stream</button>} */}
      {/* {remoteSocketId && <button onClick={() => handleCallUser()}>Call</button>} */}

      {/* ......................video player.............. */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-evenly",
        }}
      >
        {/* ............................my stream......................  */}
        {myStream && (
          <div style={{ margin: "auto" }}>
            <ReactPlayer
              className="player"
              width="400px"
              height="400px"
              playing
              muted={!audioEnabled}
              // width="500px"
              // height="500px"
              // playing
              url={myStream}
            />
            <p className="vd-name" style={{}}>
              {userName} {lastName}
            </p>
          </div>
        )}

        {/* ............................remote stream............................ */}
        {remoteStream && (
          <div style={{ margin: "auto" }}>
            <ReactPlayer
              className="player"
              width="400px"
              height="400px"
              playing
              muted={!audioEnabled}
              // width="500px"
              // height="500px"
              // playing
              url={remoteStream}
            />
            <p className="vd-name">{remoteName}</p>
          </div>
        )}
      </div>

      {/* ..................controll panel.................... */}
      {myStream && (
        <div
          className="control-panel-container"
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-evenly",
            alignItems: "center",
          }}
        >
          <div
            className="control-panel"
            style={{ backgroundColor: "aliceblue" }}
          >
            {!videoEnabled && (
              <BsFillCameraVideoOffFill
                style={{ height: "40px", width: "40px" }}
                onClick={() => toggleVideo()}
              />
            )}
            {videoEnabled && (
              <BsFillCameraVideoFill
                style={{ height: "40px", width: "40px" }}
                onClick={() => toggleVideo()}
              />
            )}

            {!audioEnabled && (
              <AiOutlineAudioMuted
                style={{ height: "40px", width: "40px" }}
                onClick={toggleAudio}
              />
            )}
            {audioEnabled && (
              <AiOutlineAudio
                style={{ height: "40px", width: "40px" }}
                onClick={toggleAudio}
              />
            )}
            <div
              onClick={() => endcall()}
              style={{
                background: "red",
                padding: "5px",
                borderRadius: "50px",
                paddingTop: "8px",
                width: "40px",
                cursor: "pointer",
              }}
            >
              <MdCallEnd
                color="white"
                style={{ height: "30px", width: "30px" }}
              />
            </div>
          </div>
        </div>
      )}

      {/* .....................share room id box ....................*/}
      <div
        style={{
          position: "absolute",
          top: "83%",
          left: "1%",
          border: "1px solid white",
          width: "20vw",
          height: "15vh",
          borderRadius: "10px",
          boxShadow: "rgb(132 125 125) 1px 1px 10px 0px",
        }}
      >
        <p style={{ color: "white", marginTop: "8px" }}>
          Share this room id with your peer 👇
        </p>
        <div
          style={{
            background: "#FFFFFF",
            width: "15vw",
            margin: "auto",
            borderRadius: "10px",
          }}
        >
          <input
            style={{ width: "8vw", height: "5vh", border: "none" }}
            type="text"
            readOnly
            value={roomId}
          />{" "}
          <CopyToClipboard text={roomId} onCopy={() => setIscopy(true)}>
            {iscopy ? (
              <button
                disabled
                style={{
                  background: "green",
                  color: "white",
                  border: "none",
                }}
              >
                Copied
              </button>
            ) : (
              <button>Copy</button>
            )}
          </CopyToClipboard>
        </div>
      </div>

      {/* .........................invite the peer................. */}
      {invite && (
        <div
          style={{
            width: "20vw",
            height: "17vh",
            background: "white",
            position: "absolute",
            right: "2%",
            top: "80%",
            borderRadius: "10px",
            display: isinvite ? "none" : "block",
          }}
        >
          <p>
            {" "}
            <span style={{ fontWeight: "600" }}>{invite}</span> <br /> has
            joined the room
          </p>
          <Button
            variant="contained"
            color="success"
            onClick={() => handleCallUser()}
          >
            Invite to this meet
          </Button>
        </div>
      )}

      {/* ........................incomming call..................  */}
      {incomming && (
        <div
          style={{
            width: "20vw",
            height: "15vh",
            background: "white",
            position: "absolute",
            right: "2%",
            top: "80%",
            borderRadius: "10px",
            display: isaccept ? "none" : "flex",
            justifyContent: "space-evenly",
            // alignItems: "baseline",
          }}
        >
          <iframe
            style={{ marginTop: "15px" }}
            src="https://giphy.com/embed/mbW2nvTE0TUc5IgRMm"
            width="85"
            height="85"
            frameBorder="0"
            class="giphy-embed"
            allowFullScreen
          ></iframe>

          <div>
            <p style={{ fontWeight: "700" }}>Incomming call</p>

            <Button variant="contained" color="success" onClick={sendStreams}>
              Accept call
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
