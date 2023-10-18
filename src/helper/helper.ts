export const checkPostEx1Detection = (landmarksArray: any[]) => {
  const xRightShouder = Math.floor(landmarksArray[12].x * 100);
  const yRightShouder = Math.floor(landmarksArray[12].y * 100);
  const xLeftShouder = Math.floor(landmarksArray[11].x * 100);
  const yLeftShouder = Math.floor(landmarksArray[11].y * 100);

  const xRightAbs = Math.floor(landmarksArray[24].x * 100);
  const yRightAbs = Math.floor(landmarksArray[24].y * 100);
  const xLeftAbs = Math.floor(landmarksArray[23].x * 100);
  const yLeftAbs = Math.floor(landmarksArray[23].y * 100);

  const xRightElbow = Math.floor(landmarksArray[14].x * 100);
  const yRightElbow = Math.floor(landmarksArray[14].y * 100);
  const xLeftElbow = Math.floor(landmarksArray[13].x * 100);
  const yLeftElbow = Math.floor(landmarksArray[13].y * 100);

  const xRightHand = Math.floor(landmarksArray[16].x * 100);
  const yRightHand = Math.floor(landmarksArray[16].y * 100);
  const xLeftHand = Math.floor(landmarksArray[15].x * 100);
  const yLeftHand = Math.floor(landmarksArray[15].y * 100);

  if (
    Math.abs(yRightHand - yRightShouder) < 5 &&
    xRightHand > xRightElbow &&
    Math.abs(yRightHand - yRightShouder) < 13 &&
    Math.abs(yLeftHand - yLeftShouder) < 5 &&
    xLeftHand < xLeftElbow &&
    Math.abs(yLeftHand - yLeftShouder) < 13
  ) {
    return true;
  }

  return false;
};
