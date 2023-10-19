// Copyright 2023 The MediaPipe Authors.

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import {
  PoseLandmarker,
  FilesetResolver,
  DrawingUtils,
} from "@mediapipe/tasks-vision";

import { useState, useRef, useEffect } from "react";
import Lottie, { LottieRefCurrentProps } from "lottie-react";
import poseAnimation from "../assets/pose-animation.json";
import { checkPostEx1Detection, checkPostEx2Detection } from "../helper/helper";

//===== Config tsconfig.json: "moduleResolution": "node",

const run = (
  setX: any,
  setY: any,
  webcamBtn: any,
  webcamRef: any,
  canvasRef: any,
  setPoseEx1reps: any,
  setPoseEx2reps: any
) => {
  let poseLandmarker: any = undefined;
  let runningMode: any = "IMAGE";
  let enableWebcamButton: any;
  let webcamRunning: boolean = false;
  const videoHeight: any = "360px";
  const videoWidth: any = "480px";

  // Before we can use PoseLandmarker class we must wait for it to finish
  // loading. Machine Learning models can be large and take a moment to
  // get everything needed to run.
  const createPoseLandmarker = async () => {
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
    );

    poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task`,
        delegate: "GPU",
      },
      runningMode: runningMode,
      numPoses: 2,
    });
  };

  createPoseLandmarker();

  // const video = document.getElementById("webcam") as HTMLVideoElement;
  // const canvasElement = document.getElementById(
  //   "output_canvas"
  // ) as HTMLCanvasElement;
  const video = webcamRef.current as HTMLVideoElement;
  const canvasElement = canvasRef.current as HTMLCanvasElement;

  const canvasCtx: any = canvasElement?.getContext("2d");
  const drawingUtils = new DrawingUtils(canvasCtx);

  // Check if webcam access is supported.
  const hasGetUserMedia = () => !!navigator.mediaDevices?.getUserMedia;

  // If webcam supported, add event listener to button for when user
  // wants to activate it.
  if (hasGetUserMedia()) {
    //enableWebcamButton = document.getElementById("webcamButton");
    enableWebcamButton = webcamBtn.current;
    enableWebcamButton?.addEventListener("click", enableCam);
  } else {
    console.warn("getUserMedia() is not supported by your browser");
  }

  // Enable the live webcam view and start detection.
  function enableCam() {
    if (!poseLandmarker) {
      console.log("Wait! poseLandmaker not loaded yet.");
      return;
    }

    // if (webcamRunning === true) {
    //   webcamRunning = false;
    //   enableWebcamButton.innerText = "ENABLE PREDICTIONS";
    // } else {
    //   // webcamRunning = true;
    //   enableWebcamButton.innerText = "DISABLE PREDICTIONS";
    // }

    if (webcamRunning === false) {
      webcamRunning = true;
      enableWebcamButton.innerText = "WEBCAM ENABLE SUCCESSFULLY";
    }

    // getUsermedia parameters.
    const constraints = {
      video: true,
    };

    // Activate the webcam stream.
    navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
      video.srcObject = stream;
      video.addEventListener("loadeddata", predictWebcam);
    });
  }

  let lastVideoTime = -1;
  let reps1 = 0;
  let reps2 = 0;
  let frame1 = 0;
  let frame2 = 0;

  async function predictWebcam() {
    canvasElement.style.height = videoHeight;
    video.style.height = videoHeight;
    canvasElement.style.width = videoWidth;
    video.style.width = videoWidth;

    // Now let's start detecting the stream.
    if (runningMode === "IMAGE") {
      runningMode = "VIDEO";
      await poseLandmarker.setOptions({ runningMode: "VIDEO" });
    }

    const startTimeMs = performance.now();

    if (lastVideoTime !== video.currentTime) {
      lastVideoTime = video.currentTime;
      poseLandmarker.detectForVideo(video, startTimeMs, (result: any) => {
        canvasCtx.save();

        canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

        for (const landmark of result.landmarks) {
          drawingUtils.drawLandmarks(landmark, {
            color: "#FF0000",
            radius: (data: any) =>
              DrawingUtils.lerp(data.from!.z, -0.15, 0.1, 5, 1),
          });

          drawingUtils.drawConnectors(
            landmark,
            PoseLandmarker.POSE_CONNECTIONS,
            {
              color: "#00FF00",
              lineWidth: 8,
            }
          );

          const landmarksArray = result.landmarks[0];

          setX(Math.floor(landmarksArray[0].x * 100));
          setY(Math.floor(landmarksArray[0].y * 100));

          const checkPostEx1Reps: boolean =
            checkPostEx1Detection(landmarksArray);

          const checkPostEx2Reps: boolean =
            checkPostEx2Detection(landmarksArray);

          frame1 = frame1 + 1;
          frame2 = frame2 + 1;

          if (checkPostEx1Reps === true) {
            if (frame1 > 20) {
              frame1 = 0;
              reps1 = reps1 + 1;
              setPoseEx1reps(reps1);
            }
          }

          if (checkPostEx2Reps === true) {
            if (frame2 > 20) {
              frame2 = 0;
              reps2 = reps2 + 1;
              setPoseEx2reps(reps2);
            }
          }
        }

        canvasCtx.restore();
      });
    }

    // Call this function again to keep predicting when the browser is ready.
    // if (webcamRunning === true) {
    //   window.requestAnimationFrame(predictWebcam);
    // }

    window.requestAnimationFrame(predictWebcam);
  }
};

const PoseDetection = () => {
  const webcamBtn = useRef<any>();
  const [x, setX] = useState<number>(0);
  const [y, sety] = useState<number>(0);

  const webcamRef = useRef<any>(null);
  const canvasRef = useRef<any>(null);

  const [poseEx1reps, setPoseEx1reps] = useState<number>(0);
  const [poseEx2reps, setPoseEx2reps] = useState<number>(0);

  const poseAnimationRef = useRef<LottieRefCurrentProps>(null);

  useEffect(() => {
    if (webcamBtn.current.innerText === "ENABLE WEBCAM") {
      setTimeout(() => {
        webcamBtn?.current.click();
      }, 2000);
    }
  }, [webcamBtn]);

  useEffect(() => {
    if (webcamBtn !== undefined) {
      run(
        setX,
        sety,
        webcamBtn,
        webcamRef,
        canvasRef,
        setPoseEx1reps,
        setPoseEx2reps
      );
    }
  }, [webcamBtn, poseEx1reps]);

  const handleComplete = () => {
    // console.log("Completed!");
  };

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        gap: 200,
      }}
    >
      <div
        className="main-left"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <Lottie
            style={{ width: "200px" }}
            animationData={poseAnimation}
            onLoopComplete={() => {
              handleComplete();
            }}
            lottieRef={poseAnimationRef}
          />
          <p style={{ fontSize: "50px", fontWeight: "bold", color: "#2b3cb5" }}>
            Pose Detection
          </p>
        </div>
        <button
          ref={webcamBtn}
          id="webcamButton"
          className="mdc-button mdc-button--raised"
          hidden
        >
          {/* <span className="mdc-button__ripple"></span> */}
          {/* <span className="mdc-button__label">ENABLE WEBCAM</span> */}
          ENABLE WEBCAM
        </button>
        <div style={{ position: "relative" }}>
          <video
            ref={webcamRef}
            id="webcam"
            // style={{ width: "1280px", height: "720px" }}
            autoPlay
            playsInline
          ></video>
          <canvas
            ref={canvasRef}
            className="output_canvas"
            id="output_canvas"
            width="1280"
            height="720"
            style={{ position: "absolute", left: "0px", top: "0px" }}
          ></canvas>
        </div>
        <div
          style={{
            marginTop: "50px",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <p style={{ fontSize: "40px", fontWeight: "bold", color: "#2b3cb5" }}>
            Landmarks[0] detection:
          </p>
          <div>
            <p style={{ fontSize: "50px", fontWeight: "bold" }}>X: {x}</p>
            <p style={{ fontSize: "50px", fontWeight: "bold" }}>Y: {y}</p>
          </div>
        </div>
      </div>
      <div
        className="main-right"
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <p
          style={{
            fontSize: "30px",
            fontWeight: "bold",
            marginBottom: "50px",
            color: "#23ba76",
          }}
        >
          Try some detection
        </p>
        {webcamBtn !== null && (
          <>
            <div
              style={{
                display: "flex",
                flexDirection: "column-reverse",
                alignItems: "center",
              }}
            >
              <img
                alt="pose_ex1"
                style={{ width: "300px" }}
                src="./pose/pose_ex1.png"
              />
              <p style={{ fontSize: "35px" }}>Reps: {poseEx1reps}</p>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column-reverse",
                alignItems: "center",
              }}
            >
              <img
                alt="pose_ex1"
                style={{ width: "300px" }}
                src="./pose/pose_ex2.png"
              />
              <p style={{ fontSize: "35px" }}>Reps: {poseEx2reps}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PoseDetection;
