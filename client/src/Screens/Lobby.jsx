import React, { useCallback, useState, useEffect } from "react";
import { useSocket } from "../context/SocketProvider";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { googleLogout, useGoogleLogin } from "@react-oauth/google";
import { useSelector, useDispatch } from "react-redux";
import { addprofile } from "../utils/slices/userSlice";
import logo_main from "../Asserts/Meet_me_logo.jpeg";
import configData from "../config";
import "./Lobby.css";
import { Link } from "react-router-dom";
import banner_pic from "../Asserts/banner_pic .jpeg";
import TextField from "@mui/material/TextField";
import { compose } from "@reduxjs/toolkit";

export default function Lobby() {
  const [email, setEmail] = useState("");
  const [room, setRoom] = useState("");
  const [img, setImg] = useState("");

  useEffect(() => {
    const id = localStorage.getItem("email");
    if (id) setEmail(id);
    const pic = localStorage.getItem("image");
    setImg(pic);
  }, []);

  const [user, setUser] = useState([]);

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
        console.log("email=>", email);
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
    console.log("user=>", user);
    if (user) {
      fetch(
        `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${user.access_token}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${user.access_token}`,
            Accept: "application/json",
          },
        }
      )
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((data) => {
          // dispatch(addprofile(data));
          setEmail(data.email);
          localStorage.setItem("email", data.email);
          localStorage.setItem("image", data.picture);
          console.log(data);
        })
        .catch((err) => console.log(err));
    }
  }, [user]);

  const styles = {
    navbar: {
      padding: "10px 20px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    logo: {
      fontSize: "2rem",
      fontWeight: "bold",
      color: "#1a73e8", // Google Meet blue color
      textDecoration: "none",
      display: "flex",
      marginTop: "20px",
    },

    navLink: {
      marginRight: "20px",
      // fontSize: '16px',
      color: "#8a02bb", // Google gray color
      textDecoration: "none",
    },
  };
  return (
    <div className="main_landing">
      <nav style={styles.navbar} className="navbar_landing">
        <Link to="/" style={styles.logo}>
          <img
            className="Logo_main
      "
            src={logo_main}
            alt="Meet_Up"
          />
        </Link>
        <div>
          {email ? (
            <img
              style={{ width: "3vw", height: "6vh", borderRadius: "100px" }}
              src={img}
              alt=""
            />
          ) : (
            <button
              style={{ borderRadius: "10px", cursor: "pointer" }}
              onClick={() => login()}
            >
              {/* Sign in with Google 🚀{" "} */}
              <img
                style={{ width: "13vw", borderRadius: "10px" }}
                src="https://www.drupal.org/files/issues/2020-01-26/google_logo.png"
                alt=""
              />
            </button>
          )}
        </div>
      </nav>
      <div className="main_container">
        <div className="main_left">
          {/* <h1>Welcome to MeetMe</h1> */}
          <p className="text_main">
            The #1 Live Video Call <br />
            one to one with peers
          </p>

          <div style={{ textAlign: "left" }}>
            <button className="button_s" onClick={(e) => handleSubmit(e)}>
              Create an Instant Meet 🚀
            </button>
            <br />
            <br />
            <p style={{ color: "white", marginLeft: "15px" }}>
              Or Join a Meet 👇
            </p>
            <TextField
              sx={{
                background: "white",
                borderRadius: "10px",
                marginLeft: "10px",
              }}
              id="filled-basic room"
              label="Room Id"
              variant="filled"
              type="text"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
            />{" "}
            <button className="button_s" onClick={(e) => handleSubmit(e)}>
              Join Now
            </button>
          </div>
          <br />
          {/* <div className="button_upper">
            <button className="button_s" onClick={(e) => handleSubmit(e)}>
              Join Now
            </button>
          </div> */}
        </div>
        <div className="main_right">
          {/* <div class="triangle-right"></div> */}
          <img className="banner_pic1" src={banner_pic} alt="" />
        </div>
      </div>
    </div>
  );
}
