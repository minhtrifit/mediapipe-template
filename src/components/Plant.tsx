import { useState, useEffect, useRef } from "react";
import Lottie, { LottieRefCurrentProps } from "lottie-react";
import { useStopwatch } from "react-timer-hook";
import plantAnimation from "../assets/plant.json";

// https://lottiereact.com

const Plant = () => {
  const [count, setCount] = useState<number>(0);
  const plantRef = useRef<LottieRefCurrentProps>(null);
  const { seconds, start, reset } = useStopwatch({
    // autoStart: true,
  });
  const timer = 30; // 25 minutes

  useEffect(() => {
    start();
    plantRef.current?.setSpeed(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (count !== 0) {
      // plantRef.current?.setSpeed(count);
    }
  }, [count]);

  const handleComplete = () => {
    console.log("complete:", seconds, "seconds");
    const stop = (seconds / timer).toFixed(3);
    setCount(Number(stop));
    reset();
  };

  return (
    <>
      <div
        style={{
          margin: "100px auto",
          minWidth: "500px",
          height: "10px",
          fontSize: "50px",
          display: "flex",
          justifyContent: "center",
        }}
      >
        {timer}s: {count} speed
      </div>
      <div
        style={{
          margin: "100px auto",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "300px",
          height: "300px",
        }}
      >
        <Lottie
          animationData={plantAnimation}
          onLoopComplete={() => {
            handleComplete();
          }}
          lottieRef={plantRef}
        />
      </div>
    </>
  );
};

export default Plant;
