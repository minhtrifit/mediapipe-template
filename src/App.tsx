import { useState } from "react";
import Select from "react-select";

import "./App.css";

import PoseDetection from "./components/PoseDetection";
import HandsDetection from "./components/HandsDetection";

const App = () => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const options = [
    { value: "pose", label: "Pose detection" },
    { value: "hands", label: "Hands detection" },
  ];

  const handleRenderDetection = (e: any) => {
    // console.log(e);
    setSelectedOption(e.value);
  };

  return (
    <div
      style={{
        display: "flex",
        flexFlow: "column",
      }}
    >
      <div style={{ width: "300px", margin: "50px auto" }}>
        <Select
          styles={{
            control: (baseStyles, state) => ({
              ...baseStyles,
              borderColor: state.isFocused ? "grey" : "blue",
              width: "100%",
            }),
          }}
          onChange={(e) => {
            handleRenderDetection(e);
          }}
          options={options}
        />
      </div>
      {selectedOption === null && (
        <p
          style={{
            textAlign: "center",
            fontSize: "40px",
            fontWeight: "bold",
            color: "#2127b8",
          }}
        >
          CHOOSE DETECTION TO GET STARTED
        </p>
      )}
      {selectedOption === "pose" && <PoseDetection />}
      {selectedOption === "hands" && <HandsDetection />}
    </div>
  );
};

export default App;
