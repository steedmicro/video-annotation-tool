let MAX_DURATION = 100,
  FRAMES_PER_SECOND = 10,
  VIDEO_WIDTH = 320,
  VIDEO_HEIGHT = 240,
  videoAnnotationData = new Uint8ClampedArray(
    VIDEO_WIDTH * VIDEO_HEIGHT * MAX_DURATION
  ),
  videoFrameIndex = 0,
  brushRadius = 16,
  timeInterval = 10,
  isCanvasMousePressed = false,
  isShiftKeyPressed = false,
  BRUSH_CANVAS_WIDTH = 100,
  BRUSH_CANVAS_HEIGHT = 100,
  centerX,
  centerY;
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
  ctx.beginPath();
  ctx.fillStyle = isShiftKeyPressed ? "#ffffff77" : "#ff000077";
  ctx.arc(centerX, centerY, brushRadius, 0, Math.PI * 2, true);
  ctx.fill();
}
function drawBrush() {
  const canvas = document.getElementById("brushCanvas");
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ff000077";
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();

  ctx.arc(
    BRUSH_CANVAS_WIDTH / 2,
    BRUSH_CANVAS_HEIGHT / 2,
    brushRadius,
    0,
    Math.PI * 2,
    true
  );
  ctx.fill();
}
$(document).ready(function () {
  const leftVideo = document.querySelector("#right_video");
  const rightVideo = document.querySelector("#right_video");
  rightVideo.addEventListener("loadeddata", (e) => {
    $("#slider").attr("max", MAX_DURATION - 1);
  });
  $("#canvas").focus();
  $("#canvas").mousedown(function () {
    isCanvasMousePressed = true;
  });
  $("#canvas").mouseup(function () {
    isCanvasMousePressed = false;
  });
  $(document).on("keyup keydown", function (e) {
    isShiftKeyPressed = e.shiftKey;
    draw();
  });
  $("#canvas").mousemove(function (e) {
    isShiftKeyPressed = e.shiftKey;
    (centerX = e.offsetX), (centerY = e.offsetY);
    if (!isCanvasMousePressed) {
      draw();
      return;
    }

    let x, y, t, d, sign, offset, offsetWithTime;
    for (
      t = videoFrameIndex - timeInterval;
      t <= videoFrameIndex + timeInterval;
      t++
    ) {
      if (t < 0 || t >= MAX_DURATION) continue;
      for (x = centerX - brushRadius; x <= centerX + brushRadius; x++) {
        if (x < 0 || x >= VIDEO_WIDTH) continue;
        for (y = centerY - brushRadius; y <= centerY + brushRadius; y++) {
          if (y < 0 || y >= VIDEO_HEIGHT) continue;
          d =
            videoAnnotationData[
              t * VIDEO_WIDTH * VIDEO_HEIGHT + y * VIDEO_WIDTH + x
            ];
          sign = isShiftKeyPressed ? -1 : 1;
          offset =
            BRUSH_THRESHOLD *
            Math.min(
              1,
              Math.max(
                0,
                1 -
                  ((x - centerX) * (x - centerX) +
                    (y - centerY) * (y - centerY)) /
                    (brushRadius * brushRadius)
              )
            );
          offsetWithTime =
            (offset * (timeInterval - Math.abs(t - videoFrameIndex))) /
            timeInterval;
          videoAnnotationData[
            t * VIDEO_WIDTH * VIDEO_HEIGHT + y * VIDEO_WIDTH + x
          ] = Math.max(Math.min(d + sign * offsetWithTime, MAX_ALPHA), 0);
        }
      }
    }

    draw();
  });
  draw();
  drawBrush();
  $("#slider").change(function (e) {
    videoFrameIndex = parseInt(e.target.value);
    rightVideo.currentTime =
      (videoFrameIndex * rightVideo.duration) / MAX_DURATION;
    draw();
  });
  $("#brushRadiusSlider").change(function (e) {
    brushRadius = parseInt(e.target.value);
    draw();
    drawBrush();
  });
});
