import cv2 as cv  # Not actually necessary if you just want to create an image.
import numpy as np

height = 240
width = 320
frames = []

def load():
    file = open("data.out", "rb")
    image_size = height * width
    frame = file.read(image_size)
    while frame:
        frames.append(frame)
        frame = file.read(image_size)
def get_frame(frame_index):
    image = np.zeros((height,width,3), np.uint8)
    for i in range(height):
        for j in range(width):
            image[i, j] = (0, 0, frames[frame_index][width * i + j])
    return image
def main():
    cv.imshow("window", get_frame(0))
    k = cv.waitKey(0)
load()
main()