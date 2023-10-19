// Copyright 2023 The MediaPipe Authors.

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at

//      http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// https://developers.google.com/mediapipe/api/solutions/js/tasks-vision.drawingutils#drawingutilsdrawconnectors

import { useEffect, useRef } from "react";
import {
  HandLandmarker,
  FilesetResolver,
  DrawingUtils,
} from "@mediapipe/tasks-vision";

const run = (webcamBtn: any, webcamRef: any, canvasRef: any) => {
  let handLandmarker: any = undefined;
  let runningMode: any = "IMAGE";
  let enableWebcamButton: any;
  let webcamRunning: boolean = false;
  // const videoHeight: any = "360px";
  // const videoWidth: any = "480px";

  // Before we can use HandLandmarker class we must wait for it to finish
  // loading. Machine Learning models can be large and take a moment to
  // get everything needed to run.

  const createHandLandmarker = async () => {
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
    );

    handLandmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
        delegate: "GPU",
      },
      runningMode: runningMode,
      numHands: 2,
    });
  };

  createHandLandmarker();

  //   const video = document.getElementById("webcam") as HTMLVideoElement;
  //   const canvasElement = document.getElementById(
  //     "output_canvas"
  //   ) as HTMLCanvasElement;
  const video = webcamRef.current as HTMLVideoElement;
  const canvasElement = canvasRef.current as HTMLCanvasElement;

  const canvasCtx: any = canvasElement.getContext("2d");
  const drawingUtils = new DrawingUtils(canvasCtx);

  // Check if webcam access is supported.
  const hasGetUserMedia = () => !!navigator.mediaDevices?.getUserMedia;

  // If webcam supported, add event listener to button for when user
  // wants to activate it.
  if (hasGetUserMedia()) {
    enableWebcamButton = webcamBtn.current;
    enableWebcamButton.addEventListener("click", enableCam);
  } else {
    console.warn("getUserMedia() is not supported by your browser");
  }

  // Enable the live webcam view and start detection.
  function enableCam() {
    if (!handLandmarker) {
      console.log("Wait! objectDetector not loaded yet.");
      return;
    }

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
  let results: any = undefined;

  async function predictWebcam() {
    canvasElement.style.width = video.videoWidth.toString();
    canvasElement.style.height = video.videoHeight.toString();
    canvasElement.width = video.videoWidth;
    canvasElement.height = video.videoHeight;

    // Now let's start detecting the stream.
    if (runningMode === "IMAGE") {
      runningMode = "VIDEO";
      await handLandmarker.setOptions({ runningMode: "VIDEO" });
    }

    const startTimeMs = performance.now();

    if (lastVideoTime !== video.currentTime) {
      lastVideoTime = video.currentTime;
      results = handLandmarker.detectForVideo(video, startTimeMs);
    }

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    if (results.landmarks) {
      for (const landmarks of results.landmarks) {
        drawingUtils.drawLandmarks(landmarks, {
          color: "#FF0000", // Red
        });

        drawingUtils.drawConnectors(
          landmarks,
          handLandmarker.HAND_CONNECTIONS,
          {
            color: "#00FF00", // Green
            lineWidth: 2,
          }
        );

        console.log(landmarks);
      }
    }
    canvasCtx.restore();

    // Call this function again to keep predicting when the browser is ready.
    window.requestAnimationFrame(predictWebcam);
  }
};

const HandsDetection = () => {
  const webcamBtn = useRef<any>();
  const webcamRef = useRef<any>(null);
  const canvasRef = useRef<any>(null);

  useEffect(() => {
    if (webcamBtn.current.innerText === "ENABLE WEBCAM") {
      setTimeout(() => {
        webcamBtn?.current.click();
      }, 2000);
    }
  }, [webcamBtn]);

  useEffect(() => {
    if (webcamBtn !== undefined) {
      run(webcamBtn, webcamRef, canvasRef);
    }
  }, [webcamBtn]);

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        gap: 50,
      }}
    >
      <div
        className="main-left"
        style={{
          display: "flex",
          flexDirection: "column",
          // alignItems: "center",
          width: "650px",
        }}
      >
        <div id="liveView" className="videoView">
          <button
            ref={webcamBtn}
            id="webcamButton"
            className="mdc-button mdc-button--raised"
          >
            <span className="mdc-button__ripple"></span>
            <span className="mdc-button__label">ENABLE WEBCAM</span>
          </button>
          <div
            style={{
              position: "relative",
            }}
          >
            <video
              ref={webcamRef}
              id="webcam"
              style={{ position: "absolute" }}
              autoPlay
              playsInline
            ></video>
            <canvas
              ref={canvasRef}
              className="output_canvas"
              id="output_canvas"
              style={{ position: "absolute", left: "0px", top: "0px" }}
            ></canvas>
          </div>
        </div>
      </div>
      <div
        className="main-right"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "600px",
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
      </div>
    </div>
  );
};

export default HandsDetection;
