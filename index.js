let MAX_DURATION = 100,
  FRAMES_PER_SECOND = 10,
  VIDEO_WIDTH = 320,
  VIDEO_HEIGHT = 240,
  videoAnnotationData = new Uint8ClampedArray(
    VIDEO_WIDTH * VIDEO_HEIGHT * MAX_DURATION
  ),
  videoFrameIndex = 0,
  radius = 10,
  timeInterval = 10,
  isCanvasMousePressed = false;
const MAX_ALPHA = 120,
  BRUSH_THRESHOLD = 20;
function draw() {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  const imageData = ctx.createImageData(VIDEO_WIDTH, VIDEO_HEIGHT),
    l = imageData.data.length,
    startIndex = VIDEO_WIDTH * VIDEO_HEIGHT * videoFrameIndex;
  // Iterate through every pixel
  for (let i = 0; i < l; i += 4) {
    // Modify pixel data
    imageData.data[i + 0] = 255; // R value
    imageData.data[i + 1] = 0; // G value
    imageData.data[i + 2] = 0; // B value
    imageData.data[i + 3] = videoAnnotationData[startIndex + i / 4]; // A value
  }
  // Draw image data to the canvas
  ctx.putImageData(imageData, 0, 0);
}

$(document).ready(function () {
  const leftVideo = document.querySelector("#right_video");
  const rightVideo = document.querySelector("#right_video");
  rightVideo.addEventListener("loadeddata", (e) => {
    //MAX_DURATION = Math.floor(rightVideo.duration * FRAMES_PER_SECOND);
    $("#slider").attr("max", MAX_DURATION - 1);
  });
  $("#canvas").mousedown(function () {
    isCanvasMousePressed = true;
  });
  $("#canvas").mouseup(function () {
    isCanvasMousePressed = false;
  });
  $("#canvas").keydown(function (e) {
    console.log(e);
  });
  $("#canvas").keyup(function (e) {
    console.log(e);
  });
  $("#canvas").mousemove(function (e) {
    if (!isCanvasMousePressed) return;
    const centerX = e.offsetX,
      centerY = e.offsetY;
    let x, y, t;
    for (
      t = videoFrameIndex - timeInterval;
      t <= videoFrameIndex + timeInterval;
      t++
    ) {
      if (t < 0 || t >= MAX_DURATION) continue;
      for (x = centerX - radius; x <= centerX + radius; x++) {
        if (x < 0 || x >= VIDEO_WIDTH) continue;
        for (y = centerY - radius; y <= centerY + radius; y++) {
          if (y < 0 || y >= VIDEO_HEIGHT) continue;
          videoAnnotationData[
            t * VIDEO_WIDTH * VIDEO_HEIGHT + y * VIDEO_WIDTH + x
          ] = Math.min(
            videoAnnotationData[
              t * VIDEO_WIDTH * VIDEO_HEIGHT + y * VIDEO_WIDTH + x
            ] +
              ((BRUSH_THRESHOLD -
                Math.min(
                  (BRUSH_THRESHOLD *
                    ((x - centerX) * (x - centerX) +
                      (y - centerY) * (y - centerY))) /
                    (radius * radius),
                  BRUSH_THRESHOLD
                )) *
                (timeInterval - Math.abs(t - videoFrameIndex))) /
                timeInterval,
            MAX_ALPHA
          );
        }
      }
    }

    draw();
  });
  draw();

  $("#slider").change(function (e) {
    videoFrameIndex = e.target.value;
    rightVideo.currentTime =
      (videoFrameIndex * rightVideo.duration) / MAX_DURATION;
    draw();
  });
});
