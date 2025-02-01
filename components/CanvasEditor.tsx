"use client";

import {useEffect, useRef, useState} from "react";
import {Button} from "./ui/button";
import {CanvasData} from "@/types/canvas";

interface Point {
  x: number;
  y: number;
}

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface CanvasEditorProps {
  imageUrl: string;
  rectPreset: Rect;
  onSubmit: (imageUrl: string, data: CanvasData) => void;
}

export default function CanvasEditor({
  imageUrl,
  rectPreset,
  onSubmit,
}: CanvasEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Point | null>(null);
  const [activeHandle, setActiveHandle] = useState<string | null>(null);

  const [cropRect, setCropRect] = useState<Rect>(rectPreset);
  const [imageRect, setImageRect] = useState<Rect>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;
    img.onload = () => {
      setImage(img);
      const cropAspectRatio = rectPreset.width / rectPreset.height;
      const imgAspectRatio = img.width / img.height;
      let newWidth, newHeight;
      if (imgAspectRatio > cropAspectRatio) {
        newWidth = rectPreset.width;
        newHeight = newWidth / imgAspectRatio;
      } else {
        newHeight = rectPreset.height;
        newWidth = newHeight * imgAspectRatio;
      }
      setImageRect({
        x: rectPreset.x + (rectPreset.width - newWidth) / 2,
        y: rectPreset.y + (rectPreset.height - newHeight) / 2,
        width: newWidth,
        height: newHeight,
      });
      setCropRect(rectPreset);
    };
  }, [imageUrl, rectPreset]);

  const draw = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !image) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw dark overlay
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Create crop rectangle
    ctx.strokeStyle = "#4466ff";
    ctx.lineWidth = 2;
    ctx.strokeRect(cropRect.x, cropRect.y, cropRect.width, cropRect.height);

    // Create clipping path for the image
    ctx.save();
    ctx.beginPath();
    ctx.rect(cropRect.x, cropRect.y, cropRect.width, cropRect.height);
    ctx.clip();

    // Draw image
    ctx.drawImage(
      image,
      imageRect.x,
      imageRect.y,
      imageRect.width,
      imageRect.height
    );
    ctx.restore();

    // Draw handles
    drawHandles(ctx);
  };

  const getEdgeHandles = () => {
    return [
      {
        x: cropRect.x + cropRect.width / 2,
        y: cropRect.y,
        cursor: "ns-resize",
        handle: "top",
      }, // top
      {
        x: cropRect.x + cropRect.width,
        y: cropRect.y + cropRect.height / 2,
        cursor: "ew-resize",
        handle: "right",
      }, // right
      {
        x: cropRect.x + cropRect.width / 2,
        y: cropRect.y + cropRect.height,
        cursor: "ns-resize",
        handle: "bottom",
      }, // bottom
      {
        x: cropRect.x,
        y: cropRect.y + cropRect.height / 2,
        cursor: "ew-resize",
        handle: "left",
      }, // left
    ];
  };

  const getCornerHandles = () => {
    return [
      {x: imageRect.x, y: imageRect.y, handle: "image-tl"}, // top-left
      {x: imageRect.x + imageRect.width, y: imageRect.y, handle: "image-tr"}, // top-right
      {
        x: imageRect.x + imageRect.width,
        y: imageRect.y + imageRect.height,
        handle: "image-br",
      }, // bottom-right
      {x: imageRect.x, y: imageRect.y + imageRect.height, handle: "image-bl"}, // bottom-left
    ];
  };

  const drawHandles = (ctx: CanvasRenderingContext2D) => {
    const edgeHandles = getEdgeHandles();

    const cornerHandles = getCornerHandles();

    // Draw edge handles
    ctx.fillStyle = "#4466ff";
    edgeHandles.forEach((handle, index) => {
      ctx.beginPath();
      ctx.arc(handle.x, handle.y, 6, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw corner handles
    ctx.fillStyle = "#ffffff";
    cornerHandles.forEach((handle, index) => {
      ctx.beginPath();
      ctx.arc(handle.x, handle.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#000";
      ctx.stroke();
    });

    // Draw edges connecting corner handles to crop rectangle edges if image is out of bounds
    if (
      imageRect.x < cropRect.x ||
      imageRect.x + imageRect.width > cropRect.x + cropRect.width ||
      imageRect.y < cropRect.y ||
      imageRect.y + imageRect.height > cropRect.y + cropRect.height
    ) {
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 1;

      // Left edge
      if (imageRect.x < cropRect.x) {
        ctx.beginPath();
        ctx.moveTo(cropRect.x, imageRect.y);
        ctx.lineTo(imageRect.x, imageRect.y);
        ctx.stroke();
        ctx.moveTo(imageRect.x, imageRect.y);
        ctx.lineTo(imageRect.x, imageRect.y + imageRect.height);
        ctx.stroke();
        ctx.moveTo(imageRect.x, imageRect.y + imageRect.height);
        ctx.lineTo(cropRect.x, imageRect.y + imageRect.height);
        ctx.stroke();
      }
      // Top edge
      if (imageRect.y < cropRect.y) {
        ctx.beginPath();
        ctx.moveTo(imageRect.x, cropRect.y);
        ctx.lineTo(imageRect.x, imageRect.y);
        ctx.stroke();
        ctx.moveTo(imageRect.x, imageRect.y);
        ctx.lineTo(imageRect.x + imageRect.width, imageRect.y);
        ctx.stroke();
        ctx.moveTo(imageRect.x + imageRect.width, imageRect.y);
        ctx.lineTo(imageRect.x + imageRect.width, cropRect.y);
        ctx.stroke();
      }
      // Right edge
      if (imageRect.x + imageRect.width > cropRect.x + cropRect.width) {
        ctx.beginPath();
        ctx.moveTo(cropRect.x + cropRect.width, imageRect.y);
        ctx.lineTo(imageRect.x + imageRect.width, imageRect.y);
        ctx.stroke();
        ctx.moveTo(imageRect.x + imageRect.width, imageRect.y);
        ctx.lineTo(
          imageRect.x + imageRect.width,
          imageRect.y + imageRect.height
        );
        ctx.stroke();
        ctx.moveTo(
          imageRect.x + imageRect.width,
          imageRect.y + imageRect.height
        );
        ctx.lineTo(cropRect.x + cropRect.width, imageRect.y + imageRect.height);
        ctx.stroke();
      }
      // Bottom edge
      if (imageRect.y + imageRect.height > cropRect.y + cropRect.height) {
        ctx.beginPath();
        ctx.moveTo(imageRect.x, cropRect.y + cropRect.height);
        ctx.lineTo(imageRect.x, imageRect.y + imageRect.height);
        ctx.stroke();
        ctx.moveTo(imageRect.x, imageRect.y + imageRect.height);
        ctx.lineTo(
          imageRect.x + imageRect.width,
          imageRect.y + imageRect.height
        );
        ctx.stroke();
        ctx.moveTo(
          imageRect.x + imageRect.width,
          imageRect.y + imageRect.height
        );
        ctx.lineTo(imageRect.x + imageRect.width, cropRect.y + cropRect.height);
        ctx.stroke();
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicking on a handle
    const handle = getActiveHandle(x, y);
    if (handle) {
      setActiveHandle(handle);
      setIsDragging(true);
      setDragStart({x, y});
      return;
    }

    // Check if clicking inside crop rectangle for moving
    if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
      setIsDragging(true);
      setDragStart({x, y});
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    // mouse coordinates inside the canvas
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if mouse is over the crop rectangle
    const isOverCropRect =
      x >= cropRect.x &&
      x <= cropRect.x + cropRect.width &&
      y >= cropRect.y &&
      y <= cropRect.y + cropRect.height;

    // Check if mouse is over the image
    const isOverImage =
      x >= imageRect.x &&
      x <= imageRect.x + imageRect.width &&
      y >= imageRect.y &&
      y <= imageRect.y + imageRect.height;

    const isOverCorner = getCornerHandles().find((handle) => {
      const distance = Math.sqrt(
        Math.pow(x - handle.x, 2) + Math.pow(y - handle.y, 2)
      );
      return distance <= 6;
    });

    const isOverEdgeHandle = getEdgeHandles().find((handle) => {
      const distance = Math.sqrt(
        Math.pow(x - handle.x, 2) + Math.pow(y - handle.y, 2)
      );
      return distance <= 6;
    });

    // Change cursor style based on hover
    if (isOverEdgeHandle) {
      canvas.style.cursor = isOverEdgeHandle.cursor;
    } else if (isOverImage || isOverCorner) {
      canvas.style.cursor = "all-scroll"; // Cursor for image and corners of crop rectangle
    } else canvas.style.cursor = "grab"; // Cursor for crop rectangle

    if (isDragging && dragStart) {
      const dx = x - dragStart.x;
      const dy = y - dragStart.y;

      if (activeHandle) {
        // Handle resizing
        const newCropRect = {...cropRect};
        const newImageRect = {...imageRect};

        switch (activeHandle) {
          case "top":
            newCropRect.y += dy;
            newCropRect.height -= dy;
            break;
          case "right":
            newCropRect.width += dx;
            break;
          case "bottom":
            newCropRect.height += dy;
            break;
          case "left":
            newCropRect.x += dx;
            newCropRect.width -= dx;
            break;
          case "image-tl":
            newImageRect.x += dx;
            newImageRect.y += dy;
            newImageRect.width -= dx;
            newImageRect.height -= dy;
            break;
          case "image-tr":
            newImageRect.y += dy;
            newImageRect.width += dx;
            newImageRect.height -= dy;
            break;
          case "image-br":
            newImageRect.width += dx;
            newImageRect.height += dy;
            break;
          case "image-bl":
            newImageRect.x += dx;
            newImageRect.width -= dx;
            newImageRect.height += dy;
            break;
        }

        // Apply constraints
        if (newCropRect.width < 50) newCropRect.width = 50;
        if (newCropRect.height < 50) newCropRect.height = 50;
        if (newImageRect.width < 50) newImageRect.width = 50;

        setCropRect(newCropRect);
        setImageRect(newImageRect);
      } else {
        // Check if dragging inside crop rectangle
        if (isOverImage) {
          // Handle moving image only
          setImageRect((prev) => ({
            ...prev,
            x: prev.x + dx,
            y: prev.y + dy,
          }));
        } else {
          // Handle moving crop rectangle and image together
          setCropRect((prev) => ({
            ...prev,
            x: prev.x + dx,
            y: prev.y + dy,
          }));
          setImageRect((prev) => ({
            ...prev,
            x: prev.x + dx,
            y: prev.y + dy,
          }));
        }
      }

      setDragStart({x, y});
      draw();
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setActiveHandle(null);
  };

  const getActiveHandle = (x: number, y: number): string | null => {
    const handleRadius = 6;

    // Check crop rectangle edge handles
    const edgeHandles = getEdgeHandles();

    // Check image corner handles
    const cornerHandles = getCornerHandles();

    // Check edge handles
    for (const handle of edgeHandles) {
      if (
        Math.abs(x - handle.x) <= handleRadius &&
        Math.abs(y - handle.y) <= handleRadius
      ) {
        return handle.handle;
      }
    }

    // Check corner handles
    for (const handle of cornerHandles) {
      if (
        Math.abs(x - handle.x) <= handleRadius &&
        Math.abs(y - handle.y) <= handleRadius
      ) {
        return handle.handle;
      }
    }

    return null;
  };

  useEffect(() => {
    draw();
  }, [cropRect, imageRect, image]);

  const resizeAndSubmit = () => {
    const sx = Math.max(0, cropRect.x - imageRect.x);
    const sy = Math.max(0, cropRect.y - imageRect.y);
    const ex = Math.min(
      imageRect.x + imageRect.width,
      cropRect.x + cropRect.width
    );
    const ey = Math.min(
      imageRect.y + imageRect.height,
      cropRect.y + cropRect.height
    );
    const croppedWidth = ex - Math.max(imageRect.x, cropRect.x);
    const croppedHeight = ey - Math.max(imageRect.y, cropRect.y);


    const canvas = document.createElement("canvas");
    canvas.width = croppedWidth;
    canvas.height = croppedHeight;
    const ctx = canvas.getContext("2d");
    if (!canvas || !ctx || !image) return;
    ctx.drawImage(
      image,
      sx,
      sy, // Source starting point within the image
      croppedWidth,
      croppedHeight, // Source dimensions to draw
      0,
      0, // Destination starting point within the canvas
      croppedWidth,
      croppedHeight // Destination dimensions within the canvas
    );

    const finalImageDataUrl = canvas.toDataURL("image/png");

    onSubmit(finalImageDataUrl, {
      left: Math.max(imageRect.x - cropRect.x, 0),
      top: Math.max(imageRect.y - cropRect.y, 0),
      right: cropRect.x + cropRect.width - ex,
      bottom: cropRect.y + cropRect.height - ey,
    });
  };

  return (
    <>
      <canvas
        ref={canvasRef}
        width={window.innerWidth}
        height={800}
        className="rounded-lg cursor-move absolute"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
      <Button
        className="absolute z-10 bottom-2 right-2"
        onClick={resizeAndSubmit}
      >
        Submit
      </Button>
    </>
  );
}
