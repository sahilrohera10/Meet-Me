import React, { useCallback, useState, useEffect } from "react";
import { useSocket } from "../context/SocketProvider";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { googleLogout, useGoogleLogin } from "@react-oauth/google";
import { useSelector, useDispatch } from "react-redux";
import { addprofile } from "../utils/slices/userSlice";
import logo_main from "../Asserts/Meet_me_logo.jpeg";
import configData from "../config";
import "../Screens/Lobby.css";
import { Link } from "react-router-dom";
import banner_pic from "../Asserts/banner_pic .jpeg"
export default function Lobby() {
  const [email, setEmail] = useState("");
  const [room, setRoom] = useState("");
  const dispatch = useDispatch();
  const d = useSelector((store) => store.user.profile);
  d.length && console.log(d[0].email);

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
        <ul style={styles.navLinks} className="elements_landing">
          <li>
            <Link to="/home" style={styles.navLink}>
              Home
            </Link>
          </li>
          <li>
            <Link to="/about" style={styles.navLink}>
              About
            </Link>
          </li>
          <li>
            <Link to="/contact" style={styles.navLink}>
              Contact
            </Link>
          </li>
          <li>
            <Link to="/contact" style={styles.navLink}>
              Settings
            </Link>
          </li>
          <li>
            <Link to="/contact" style={styles.navLink}>
              calender
            </Link>
          </li>
        </ul>
      </nav>
      <div className="main_container">
        <div className="main_left">
          {/* <h1>Welcome to MeetMe</h1> */}
          <p className="text_main">
            Premium video meetings.
            <br />
            Now free for everyone.
          </p>
          <p className="text_submain">
            We re-engineered the service that we built for secure
            <br /> business meetings, Meet Me, to make it free and <br />
            available for all.
          </p>
          <form action="">
            {/* <label htmlFor="email">Email</label> */}
            <input
              type="email"
              id="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {/* <label htmlFor="room">Room No.</label> */}
            <input
              type="text"
              id="room"
              placeholder="Room"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
            />
            <br />
            <div className="button_upper">
            <button className="button_s" onClick={(e) => handleSubmit(e)}>
              Create an Instant Link
            </button>
            <button className="button_s" onClick={(e) => handleSubmit(e)}>Join Now</button>
            </div>
            
          </form>
          <button className="button_s" onClick={() => login()}>Sign in with Google 🚀 </button>
        </div>
        <div className="main_right">
        {/* <div class="triangle-right"></div> */}
          <img className="banner_pic1" src={banner_pic} alt="" />
        </div>
      </div>
    </div>
  );
}
