import cv2
import numpy as np


def preprocess_image(image):
    """
    Preprocess image for OCR.
    Input:  PIL Image
    Output: Processed NumPy image
    """

    image = np.array(image)

    gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)

    # Upscale for better column separation
    gray = cv2.resize(
        gray,
        None,
        fx=3,
        fy=3,
        interpolation=cv2.INTER_CUBIC
    )

    sharpen_kernel = np.array([[0, -1,  0],
                               [-1,  5, -1],
                               [0, -1,  0]])
    gray = cv2.filter2D(gray, -1, sharpen_kernel)

    # ── Threshold to get binary image ──────────────────────────────
    binary = cv2.adaptiveThreshold(
        gray,
        255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY,
        15,
        4
    )

    inverted = cv2.bitwise_not(binary)
    contours, _ = cv2.findContours(
        inverted,
        cv2.RETR_EXTERNAL,
        cv2.CHAIN_APPROX_SIMPLE
    )

    for contour in contours:
        x, y, w, h = cv2.boundingRect(contour)
        aspect_ratio = w / float(h) if h > 0 else 0

       
        # These size ranges are tuned for 3x upscaled 400dpi image for rupee sign 
        if (8 < w < 55) and (10 < h < 60) and (0.3 < aspect_ratio < 1.2):
           
            region = inverted[y:y+h, x:x+w]
            dark_pixel_ratio = np.sum(region > 0) / (w * h)

            if dark_pixel_ratio > 0.25:
                # Whiteout this region in the binary image
                binary[y:y+h, x:x+w] = 255

    return binary