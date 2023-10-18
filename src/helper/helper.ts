export const getDistance = (x1: number, x2: number, y1: number, y2: number) => {
  const a = x1 - x2;
  const b = y1 - y2;

  return Math.floor(Math.sqrt(a * a + b * b));
};

export const checkPostEx1Detection = (landmarksArray: any[]) => {
  const yRightShouder = Math.floor(landmarksArray[12].y * 100);
  const yLeftShouder = Math.floor(landmarksArray[11].y * 100);

  const xRightElbow = Math.floor(landmarksArray[14].x * 100);
  const xLeftElbow = Math.floor(landmarksArray[13].x * 100);

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

export const checkPostEx2Detection = (landmarksArray: any[]) => {
  const xLeftHand = Math.floor(landmarksArray[15].x * 100);
  const yLeftHand = Math.floor(landmarksArray[15].y * 100);

  const xRightHand = Math.floor(landmarksArray[16].x * 100);
  const yRightHand = Math.floor(landmarksArray[16].y * 100);

  const xLeftAbs = Math.floor(landmarksArray[23].x * 100);
  const yLeftAbs = Math.floor(landmarksArray[23].y * 100);

  const xRightAbs = Math.floor(landmarksArray[24].x * 100);
  const yRightAbs = Math.floor(landmarksArray[24].y * 100);

  const distanceH = getDistance(xLeftHand, xRightHand, yLeftHand, yRightHand);
  const distanceA = getDistance(xLeftAbs, xRightAbs, yLeftAbs, yRightAbs);

  if (
    yRightHand < yRightAbs &&
    yLeftHand < yLeftAbs &&
    distanceH / distanceA > 7
  ) {
    return true;
  }

  return false;
};
