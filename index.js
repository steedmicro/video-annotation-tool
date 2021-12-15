const MAX_ALPHA = 255,
  BRUSH_THRESHOLD = 20,
  BRUSH_CANVAS_WIDTH = 100,
  BRUSH_CANVAS_HEIGHT = 100,
  TIMELINE_WIDTH = 40,
  VIDEO_WIDTH = 320,
  VIDEO_HEIGHT = 240,
  MAX_DURATION = 100,
  METHOD_SWAP = 0,
  METHOD_QUANTIZATION = 1,
  METHOD_SALT_AND_PEPPER_NOISE = 2,
  METHOD_BLURRING = 3;
let videoAnnotationData = new Uint8ClampedArray(
    VIDEO_WIDTH * VIDEO_HEIGHT * MAX_DURATION
  ),
  leftVideoFrameIndex = 0,
  rightVideoFrameIndex = 0,
  brushRadius = 16,
  isCanvasMousePressed = false,
  isShiftKeyPressed = false,
  centerX,
  centerY,
  videoSource = "movie_clip.mp4",
  leftVideo,
  rightVideo,
  processMethod = METHOD_SWAP;

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
    startIndex = VIDEO_WIDTH * VIDEO_HEIGHT * rightVideoFrameIndex;
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
let leftCap,
  srcArray = [],
  dstArray = [],
  isSrcDone = false,
  isPaused = false;
function processMat(src, frameIndex) {
  const rows = src.rows,
    cols = src.cols,
    channels = src.channels();
  let i,
    j,
    r,
    g,
    b,
    d,
    index,
    annotationDataIndex = rows * cols * frameIndex,
    k,
    p,
    data = src.data;
  if (processMethod === METHOD_SWAP) {
    for (i = rows - 1; i >= 0; i--) {
      for (j = cols - 1; j >= 0; j--) {
        index = i * cols * channels + j * channels;
        r = data[index];
        g = data[index + 1];
        b = data[index + 2];
        d = videoAnnotationData[annotationDataIndex + i * cols + j];
        if (d > 128) {
          data[index] = g;
          data[index + 1] = r;
        }
      }
    }
  } else if (processMethod === METHOD_QUANTIZATION) {
    for (i = rows - 1; i >= 0; i--) {
      for (j = cols - 1; j >= 0; j--) {
        index = i * cols * channels + j * channels;
        r = data[index];
        g = data[index + 1];
        b = data[index + 2];
        d = videoAnnotationData[annotationDataIndex + i * cols + j];
        k = 8 - Math.floor(d / 32);
        data[index] = Math.floor(r / k) * k;
        data[index + 1] = Math.floor(g / k) * k;
        data[index + 2] = Math.floor(b / k) * k;
      }
    }
  } else if (processMethod === METHOD_SALT_AND_PEPPER_NOISE) {
    for (i = rows - 1; i >= 0; i--) {
      for (j = cols - 1; j >= 0; j--) {
        index = i * cols * channels + j * channels;
        r = data[index];
        g = data[index + 1];
        b = data[index + 2];
        d = videoAnnotationData[annotationDataIndex + i * cols + j];
        p = 0.99 + Math.floor(d / 32) / 700.0;
        data[index] = Math.random() < p ? r : Math.floor(Math.random() * 256);
        data[index + 1] =
          Math.random() < p ? g : Math.floor(Math.random() * 256);
        data[index + 2] =
          Math.random() < p ? b : Math.floor(Math.random() * 256);
      }
    }
  }
}
function drawLeftVideo() {
  if (isPaused) return;
  if (!isSrcDone) {
    leftVideo.currentTime =
      (leftVideoFrameIndex * leftVideo.duration) / MAX_DURATION;
  }
  console.log("working");
  let begin = Date.now(),
    src;
  const canvas = document.getElementById("left_video_canvas");
  const ctx = canvas.getContext("2d");
  if (!isSrcDone) {
    src = new cv.Mat(VIDEO_HEIGHT, VIDEO_WIDTH, cv.CV_8UC4);
    leftCap.read(src);
    srcArray.push(new cv.Mat(VIDEO_HEIGHT, VIDEO_WIDTH, cv.CV_8UC4));
    srcArray[leftVideoFrameIndex] = src.clone();
  } else {
    if (leftVideoFrameIndex === 0) {
      let index = 0;
      for (index = 0; index < MAX_DURATION; index++) {
        src = srcArray[index].clone();
        processMat(src, index);
        if (dstArray[index] === undefined) {
          dstArray.push(new cv.Mat(VIDEO_HEIGHT, VIDEO_WIDTH, cv.CV_8UC4));
        } else {
          dstArray[index].delete();
        }
        dstArray[index] = src.clone();
        src.delete();
      }
    }
  }

  if (!isSrcDone) {
    processMat(src, leftVideoFrameIndex);
  } else {
    src = dstArray[leftVideoFrameIndex].clone();
  }
  if (leftVideoFrameIndex === MAX_DURATION - 1) {
    isSrcDone = true;
  }
  cv.imshow("left_video_canvas", src);
  src.delete();

  leftVideoFrameIndex++;
  if (leftVideoFrameIndex === MAX_DURATION) {
    leftVideoFrameIndex = 0;
  }
  let delay = (leftVideo.duration * 1000) / MAX_DURATION - (Date.now() - begin);
  setTimeout(drawLeftVideo, delay);
}
function drawRightVideo() {
  const canvas = document.getElementById("right_video_canvas");
  const ctx = canvas.getContext("2d");
  src = new cv.Mat(VIDEO_HEIGHT, VIDEO_WIDTH, cv.CV_8UC4);
  rightCap.read(src);
  cv.cvtColor(src, src, cv.COLOR_RGB2GRAY, 0);
  cv.Canny(src, src, 50, 100, 3, false);
  cv.imshow("right_video_canvas", src);
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
const deleteArray = (arr) => {
  let i;
  const l = arr.length;
  for (i = 0; i < l; i++) {
    if (arr[i]) arr[i].delete();
  }
};
$(document).ready(function () {
  leftVideo = document.querySelector("#left_video");
  rightVideo = document.querySelector("#right_video");
  $("#slider").attr("max", MAX_DURATION - 1);
  leftVideo.addEventListener("loadeddata", (e) => {
    isPaused = false;
    leftCap = new cv.VideoCapture(leftVideo);
    setTimeout(() => {
      drawLeftVideo();
    }, 100);
  });
  rightVideo.addEventListener("loadeddata", (e) => {
    rightCap = new cv.VideoCapture(rightVideo);
    setTimeout(() => {
      drawRightVideo();
    }, 100);
  });
  $("#canvas").mousedown(function () {
    isCanvasMousePressed = true;
  });
  $("#canvas").mouseup(function () {
    isCanvasMousePressed = false;
    leftVideoFrameIndex = 0;
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
    leftVideoFrameIndex = 0;
    rightVideoFrameIndex = 0;
    isSrcDone = false;
    isPaused = true;
    srcArray = [];
    dstArray = [];
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
      t = rightVideoFrameIndex - TIMELINE_WIDTH;
      t <= rightVideoFrameIndex + TIMELINE_WIDTH;
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
            (offset * (TIMELINE_WIDTH - Math.abs(t - rightVideoFrameIndex))) /
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
    rightVideoFrameIndex = parseInt(e.target.value);
    rightVideo.currentTime =
      (rightVideoFrameIndex * rightVideo.duration) / MAX_DURATION;
    setTimeout(() => {
      draw();
      drawRightVideo();
    }, 100);
  });
  $("#brush_radius_slider").change(function (e) {
    $("#brushRadius").html(e.target.value);
    brushRadius = parseInt(e.target.value);
    draw();
    drawBrush();
    drawRightVideo();
  });
  $("#process_method").change(function (e) {
    processMethod = parseInt(e.target.value);
    leftVideoFrameIndex = 0;
  });
});
