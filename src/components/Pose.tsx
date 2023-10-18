import { useState, useEffect, useRef } from "react";
import * as posenet from "@tensorflow-models/posenet";
import Webcam from "react-webcam";
import "@tensorflow/tfjs-backend-webgl";

import { drawKeypoints, drawSkeleton } from "../utils/posenet";

import { getDistance } from "../helper/helper";

const Pose = () => {
  const webcamRef = useRef<any>(null);
  const canvasRef = useRef<any>(null);

  let countFrame = 0;

  //const [countFrame, setCountFrame] = useState<number>(0);
  const [completed, setCompleted] = useState<number>(0);

  let reps = 0;
  let frame = 0;

  useEffect(() => {
    runPosenet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runPosenet = async () => {
    const net = await posenet.load({
      architecture: "MobileNetV1",
      outputStride: 16, // 8, 16, 32
      inputResolution: { width: 640, height: 480 },
    });

    setInterval(() => {
      detect(net);
    }, 100);
  };

  const detect = async (net: any) => {
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current?.video.readyState === 4
    ) {
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      const pose = await net.estimateSinglePose(video);

      const leftHand = pose.keypoints[9]; // 11
      const rightHand = pose.keypoints[10]; // 12
      const leftAbs = pose.keypoints[11];
      const rightAbs = pose.keypoints[12];

      drawCanvas(pose, videoWidth, videoHeight, canvasRef);

      const lx = Math.floor(Math.floor(leftHand.position.x));
      const ly = Math.floor(Math.floor(leftHand.position.y));
      const rx = Math.floor(Math.floor(rightHand.position.x));
      const ry = Math.floor(Math.floor(rightHand.position.y));

      const lx2 = Math.floor(Math.floor(leftAbs.position.x));
      const ly2 = Math.floor(Math.floor(leftAbs.position.y));
      const rx2 = Math.floor(Math.floor(rightAbs.position.x));
      const ry2 = Math.floor(Math.floor(rightAbs.position.y));

      const distanceH = getDistance(lx, rx, ly, ry);
      const distanceA = getDistance(lx2, rx2, ly2, ry2);

      if (distanceH / distanceA > 5) {
        frame = frame + 1;
        countFrame++;
      }

      if (frame > 20) {
        frame = 0;
        reps = reps + 1;
        setCompleted(reps);
      }
    }
  };

  const drawCanvas = (
    pose: any,
    videoWidth: any,
    videoHeight: any,
    canvas: any
  ) => {
    const ctx = canvas.current.getContext("2d");
    canvas.current.width = videoWidth;
    canvas.current.height = videoHeight;

    drawKeypoints(pose["keypoints"], 0.6, ctx);
    drawSkeleton(pose["keypoints"], 0.7, ctx);
  };

  return (
    <div
      style={{
        width: 640,
        height: 480,
        position: "relative",
        margin: "100px auto",
      }}
    >
      <p style={{ fontSize: "50px" }}>Completed: {completed}</p>

      <Webcam
        ref={webcamRef}
        style={{
          position: "absolute",
          width: 640,
          height: 480,
        }}
      />
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          width: 640,
          height: 480,
        }}
      />
    </div>
  );
};

export default Pose;
