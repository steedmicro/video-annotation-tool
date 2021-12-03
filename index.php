<?php header('Access-Control-Allow-Origin: *'); ?>
<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $target_dir = "uploads/";
    $target_file = $target_dir . basename($_FILES["fileToUpload"]["name"]);
    $request_uri = $_SERVER['REQUEST_URI'];
    $request_path = str_replace("index.php", "", $request_uri);
    $actual_link = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://$_SERVER[HTTP_HOST]$request_path$target_dir";
    if (move_uploaded_file($_FILES["fileToUpload"]["tmp_name"], $target_file)) {
        $video_source =  $actual_link.htmlspecialchars( basename( $_FILES["fileToUpload"]["name"])). "";
    } else {
        $video_source = "movie.mp4";
    }
} else {
    $video_source = "movie.mp4";
}
?>
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
    <link
      rel="stylesheet"
      href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css"
    />
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.16.0/umd/popper.min.js"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
    <script src="https://docs.opencv.org/3.4.0/opencv.js"></script>
  </head>
  <body>
    <div class="jumbotron text-center">
      <h1>Video Annotation Web Tool</h1>
    </div>
    <div class="container">
      <div class="row mb-5">
        <div class="col-md-6">
          <input
            class="form-control"
            id="video_source"
            type="text"
            value="<?php echo $video_source?>"
          />
        </div>
        <div class="col-md-2">
          <button class="btn btn-primary" id="btn_load">Load</button>
          <button class="btn btn-danger" id="btn_save">Save</button>
        </div>
        <div class="col-md-4">
          <form action="index.php" method="post" enctype="multipart/form-data">
            <input
              class="d-inline"
              type="file"
              name="fileToUpload"
              id="fileToUpload"
              style="width:60%;"
            />
            <input
              class="btn btn-info d-inline"
              type="submit"
              value="Upload"
              style="width:30%;"
              name="submit"
            />
          </form>
        </div>
      </div>
      <div class="row" style="position: relative">
        <div class="col-md-6">
          <video
            autoplay
            muted
            id="left_video"
            width="320"
            height="240"
            nocontrols
            loop
          >
            <source src="<?php echo $video_source?>" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
        <div class="col-md-3">
          <video
            id="right_video"
            width="320"
            height="240"
            crossorigin="anonymous"
            nocontrols
          >
            <source src="<?php echo $video_source?>" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <canvas
            id="videoCanvas"
            width="320"
            height="240"
            style="
              border: 1px solid #d3d3d3;
              position: absolute;
              top: 0px;
              left: 15px;
            "
          ></canvas>
          <canvas
            id="canvas"
            width="320"
            height="240"
            style="
              border: 1px solid #d3d3d3;
              position: absolute;
              top: 0px;
              left: 15px;
            "
          ></canvas>

          <div>
            <input
              id="slider"
              type="range"
              min="0"
              max="99"
              value="0"
              id="slider"
              style="width: 320px"
            />
          </div>
          <div class="mt-5" style="width: 320px; position: relative">
            <span> Brush Size : <span id="brushRadius">16</span></span>
            <span>px</span>
            <input
              id="brushRadiusSlider"
              class="d-block"
              type="range"
              style="width: 180px; margin-top: 10px"
              value="16"
              min="5"
              max="40"
            />
            <canvas
              id="brushCanvas"
              width="100"
              height="100"
              style="
                border: 1px solid #d3d3d3;
                margin-left: 10px;
                position: absolute;
                top: -30px;
                right: 15px;
              "
            >
            </canvas>
          </div>
        </div>
      </div>
    </div>
  </body>
  <script src="index.js"></script>
</html>
