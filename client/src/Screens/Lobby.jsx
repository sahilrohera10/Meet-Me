import React, { useCallback, useState, useEffect } from "react";
import { useSocket } from "../context/SocketProvider";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { googleLogout, useGoogleLogin } from "@react-oauth/google";
import {  useSelector, useDispatch } from "react-redux";
import { addprofile } from '../utils/slices/userSlice'
import configData from "../config";


export default function Lobby() {
  const [email, setEmail] = useState("");
  const [room, setRoom] = useState("");
  const dispatch = useDispatch();
  const d = useSelector((store)=>store.user.profile);
  d.length &&  console.log(d[0].email);

  //for user details we will store in redux store
  const [user, setUser] = useState([]);
  const [profile, setProfile] = useState([]);
  
  const createLink = (e, email) => {
    e.preventDefault();
    const arr = email.split("@");
    const id = arr[0];
    const token = Math.floor(Math.random() * 10000);
    const link = `${id}-${token}`;
    console.log("meet-link", { link });
    return link;
  };

  const navigate = useNavigate();
  
  const socket = useSocket();
  console.log(socket);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      let link;
      if (room.length > 0) {
        link = room;
      } else {
        link = createLink(e, email);
      }
      console.log(link);
      socket.emit("room:join", { email, link });
    },
    [email, room, socket]
  );

  const handleJoinRoom = useCallback(
    (data) => {
      const { email, link } = data;
      navigate(`/${link}`);
    },
    [navigate]
  );

  useEffect(() => {
    socket.on("room:join", handleJoinRoom);

    return () => {
      socket.off("room:join", handleJoinRoom);
    };
  }, [socket, handleJoinRoom]);

  const login = useGoogleLogin({
    onSuccess: (codeResponse) => setUser(codeResponse),
    onError: (error) => console.log("Login Failed:", error),
  });

  useEffect(() => {
    if (user) {
      fetch(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${user.access_token}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${user.access_token}`,
          'Accept': 'application/json',
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then((data) => {
          dispatch(addprofile(data));
          

          setProfile(data);
        })
        .catch((err) => console.log(err));
    }
  }, [user]);

  
  const logOut = () => {
    googleLogout();
    setProfile(null);
};

  return (
    <div>
      <h1>Welcome to MeetMe</h1>
      <form action="">
        <label style={{ marginRight: "5px" }} htmlFor="email">
          Email
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label
          style={{ marginLeft: "20px", marginRight: "5px" }}
          htmlFor="room"
        >
          Room No.
        </label>
        <input
          type="text"
          id="room"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
        />
        <br />
        <button style={{ marginTop: "20px" }} onClick={(e) => handleSubmit(e)}>
          Create an Instant Link
        </button>
        <button style={{ marginTop: "20px" }} onClick={(e) => handleSubmit(e)}>
          Join Now
        </button>
      </form>
      <button onClick={() => login()}>Sign in with Google 🚀 </button>
    </div>
  );
}
