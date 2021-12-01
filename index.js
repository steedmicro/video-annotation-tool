let MAX_DURATION = 100,
  FRAMES_PER_SECOND = 10,
  VIDEO_WIDTH = 320,
  VIDEO_HEIGHT = 240,
  videoAnnotationData = new Uint8ClampedArray(
    VIDEO_WIDTH * VIDEO_HEIGHT * MAX_DURATION
  ),
  videoFrameIndex = 0;
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
    imageData.data[i + 3] = videoAnnotationData[startIndex + i]; // A value
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
  $("#canvas").mousemove(function (e) {
    const startIndex = VIDEO_WIDTH * VIDEO_HEIGHT * videoFrameIndex;
    videoAnnotationData[startIndex] = 255;
  });
  draw();

  $("#slider").change(function (e) {
    videoFrameIndex = e.target.value;
    rightVideo.currentTime =
      (videoFrameIndex * rightVideo.duration) / MAX_DURATION;
  });
});
