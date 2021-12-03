const MAX_ALPHA = 255,
  BRUSH_THRESHOLD = 20,
  BRUSH_CANVAS_WIDTH = 100,
  BRUSH_CANVAS_HEIGHT = 100,
  TIMELINE_WIDTH = 10,
  VIDEO_WIDTH = 320,
  VIDEO_HEIGHT = 240,
  MAX_DURATION = 100;
let videoAnnotationData = new Uint8ClampedArray(
    VIDEO_WIDTH * VIDEO_HEIGHT * MAX_DURATION
  ),
  videoFrameIndex = 0,
  brushRadius = 16,
  isCanvasMousePressed = false,
  isShiftKeyPressed = false,
  centerX,
  centerY,
  videoSource = "movie.mp4",
  leftVideo,
  rightVideo;

function initVideoAnnotationData() {
  let i;
  const l = videoAnnotationData.length;
  for (i = 0; i < l; i++) videoAnnotationData[i] = MAX_ALPHA / 2;
}
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
  ctx.fillStyle = isShiftKeyPressed ? "#ffffffaa" : "#ff0000aa";
  ctx.arc(centerX, centerY, brushRadius, 0, Math.PI * 2, true);
  ctx.fill();
}
function drawVideo() {
  const canvas = document.getElementById("videoCanvas");
  const ctx = canvas.getContext("2d");
  ctx.drawImage(rightVideo, 0, 0);
  var src = cv.imread("videoCanvas");
  cv.cvtColor(src, src, cv.COLOR_RGB2GRAY, 0);
  cv.Canny(src, src, 50, 100, 3, false);
  cv.imshow("videoCanvas", src);
  src.delete();
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
const download = (url, filename) => {
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename || "download";
  anchor.click();
};
$(document).ready(function () {
  leftVideo = document.querySelector("#left_video");
  rightVideo = document.querySelector("#right_video");
  rightVideo.addEventListener("loadeddata", (e) => {
    setTimeout(() => {
      drawVideo();
    }, 100);
  });
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
  $("#btn_load").click(function (e) {
    videoSource = $("#video_source").val();
    $("#left_video source").attr("src", videoSource);
    leftVideo.load();
    $("#right_video source").attr("src", videoSource);
    rightVideo.load();
    videoFrameIndex = 0;
    $("#slider").val(0);
    initVideoAnnotationData();
    draw();
  });
  $("#btn_save").click(function (e) {
    download(URL.createObjectURL(new Blob([videoAnnotationData])), "data.out");
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
      t = videoFrameIndex - TIMELINE_WIDTH;
      t <= videoFrameIndex + TIMELINE_WIDTH;
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
            (offset * (TIMELINE_WIDTH - Math.abs(t - videoFrameIndex))) /
            TIMELINE_WIDTH;
          videoAnnotationData[
            t * VIDEO_WIDTH * VIDEO_HEIGHT + y * VIDEO_WIDTH + x
          ] = Math.max(Math.min(d + sign * offsetWithTime, MAX_ALPHA), 0);
        }
      }
    }

    draw();
  });
  initVideoAnnotationData();
  draw();
  drawBrush();
  $("#slider").change(function (e) {
    videoFrameIndex = parseInt(e.target.value);
    rightVideo.currentTime =
      (videoFrameIndex * rightVideo.duration) / MAX_DURATION;
    draw();
    drawVideo();
  });
  $("#brushRadiusSlider").change(function (e) {
    $("#brushRadius").html(e.target.value);
    brushRadius = parseInt(e.target.value);
    draw();
    drawBrush();
    drawVideo();
  });
});
