import axios from "axios";
import React, { useState, useEffect, useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import "./App.css";
import { animated } from "react-spring";
import "./popup.css";
import { IconButton, InputLabel, Typography } from "@mui/material";
import { InputRounded } from "@mui/icons-material";

function useParallax(value, distance) {
  return useTransform(value, [0, 1], [-distance, distance]);
}

function Home() {
  const [shows, setShows] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const [selectedShow, setSelectedShow] = useState("");

  const popupAnimation = useSpring({
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? "translateX(0)" : "translateX(-200%)",
  });

  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref });
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 10,
    damping: 30,
    restDelta: 0.001,
  });

  const { scrollYProgress: scrollYProgressImage } = useScroll({ target: ref });
  const yImage = useParallax(scrollYProgressImage, 100);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let storedData = localStorage.getItem("tvData");
        if (localStorage.getItem("selectedShow"))
          setSelectedShow(localStorage.getItem("selectedShow"));
        if (storedData === null) {
          const response = await axios.get(
            "https://api.tvmaze.com/search/shows?q=all"
          );
          storedData = response.data;
          localStorage.setItem("tvData", JSON.stringify(storedData));
        } else {
          storedData = JSON.parse(storedData);
        }
        setShows(storedData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setShows([]);
      }
    };

    fetchData();
  }, []);

  const openPopup = (showName) => {
    localStorage.setItem("selectedShow", showName);
    setSelectedShow(showName);
    setIsVisible(true);
  };

  const closePopup = () => {
    setIsVisible(false);
  };

  return (
    <>
      {shows.map(
        (show) =>
          show.show.image && (
            <div key={show.show.id}>
              <section>
                <div ref={ref}>
                  <button
                    className="button"
                    onClick={() => openPopup(show.show.name)}
                  >
                    <img src={show.show.image.medium} alt={show.show.summary} />
                  </button>
                </div>
                <motion.div className="overlay-2" style={{ y: yImage }}>
                  <h2>{show.show.name}</h2>
                  <p>{show.show.summary}</p>
                </motion.div>
              </section>
            </div>
          )
      )}
      <motion.div className="progress" style={{ scaleX }} />
      <animated.div
        style={{
          ...popupAnimation,
          position: "fixed",
          top: 0,
          left: isVisible ? 0 : "-200%",
          width: "100%",
          height: "100%",
          background: "rgba(0, 0, 0, 0.8)",
          zIndex: isVisible ? 10 : -1,
          color: "white",
        }}
      >
        <div
          className="popup-content"
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            color: "white",
          }}
        >
          <IconButton
            style={{ color: "white" }}
            size="30px"
            onClick={() => closePopup()}
          >
            <Typography variant="button">&times;</Typography>
          </IconButton>
          <input type="text" placeholder="type in here your name" />
          <br />
          <p style={{ color: "gray", fontSize: "18px" }}>
            Your selected show is :
          </p>
          <h2>{selectedShow || localStorage.getItem("selectedShow")}</h2>
          <p color="white">This is your animated form content.</p>

          <br />
          <br />
          <IconButton
            variant="contained"
            color="primary"
            onClick={() => closePopup()}
          >
            Submit
          </IconButton>
        </div>
      </animated.div>
    </>
  );
}

export default Home;
