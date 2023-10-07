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

//===== Config tsconfig.json: "moduleResolution": "node",

const run = (setX: any, setY: any) => {
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

  const video = document.getElementById("webcam") as HTMLVideoElement;
  const canvasElement = document.getElementById(
    "output_canvas"
  ) as HTMLCanvasElement;
  const canvasCtx: any = canvasElement?.getContext("2d");
  const drawingUtils = new DrawingUtils(canvasCtx);

  // Check if webcam access is supported.
  const hasGetUserMedia = () => !!navigator.mediaDevices?.getUserMedia;

  // If webcam supported, add event listener to button for when user
  // wants to activate it.
  if (hasGetUserMedia()) {
    enableWebcamButton = document.getElementById("webcamButton");
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
            radius: (data: any) =>
              DrawingUtils.lerp(data.from!.z, -0.15, 0.1, 5, 1),
          });

          drawingUtils.drawConnectors(
            landmark,
            PoseLandmarker.POSE_CONNECTIONS
          );

          const landmarksArray = result.landmarks[0];

          setX(Math.floor(landmarksArray[14].x * 100));
          setY(Math.floor(landmarksArray[14].y * 100));
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

const Pose2 = () => {
  const webcamBtn = useRef<any>();
  const [x, setX] = useState<number>(0);
  const [y, sety] = useState<number>(0);

  useEffect(() => {
    if (webcamBtn.current.innerText === "ENABLE WEBCAM") {
      setTimeout(() => {
        webcamBtn?.current.click();
      }, 2000);
    }
  }, [webcamBtn]);

  useEffect(() => {
    if (webcamBtn !== undefined) {
      run(setX, sety);
    }
  }, [webcamBtn]);

  return (
    <div>
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
          id="webcam"
          style={{ width: "1280px", height: "720px", position: "absolute" }}
          autoPlay
          playsInline
        ></video>
        <canvas
          className="output_canvas"
          id="output_canvas"
          width="1280"
          height="720"
          style={{ position: "absolute", left: "0px", top: "0px" }}
        ></canvas>
      </div>
      <div style={{ marginTop: "400px" }}>
        <p style={{ fontSize: "80px", fontWeight: "bold" }}>X: {x}</p>
        <p style={{ fontSize: "80px", fontWeight: "bold" }}>Y: {y}</p>
      </div>
    </div>
  );
};

export default Pose2;
