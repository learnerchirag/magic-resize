"use client";

import {useEffect, useRef, useState} from "react";

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
}

export default function CanvasEditor({imageUrl}: CanvasEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Point | null>(null);
  const [activeHandle, setActiveHandle] = useState<string | null>(null);

  // State for the crop rectangle
  const [cropRect, setCropRect] = useState<Rect>({
    x: 100,
    y: 100,
    width: 400,
    height: 300,
  });

  // State for the image
  const [imageRect, setImageRect] = useState<Rect>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  // Load and setup image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;
    img.onload = () => {
      setImage(img);
      // Center the image within the crop rectangle
      const cropAspectRatio = cropRect.width / cropRect.height;
      const imgAspectRatio = img.width / img.height;

      let newWidth, newHeight;

      if (imgAspectRatio > cropAspectRatio) {
        // Image is wider than crop rectangle
        newWidth = cropRect.width;
        newHeight = newWidth / imgAspectRatio;
      } else {
        // Image is taller than crop rectangle
        newHeight = cropRect.height;
        newWidth = newHeight * imgAspectRatio;
      }

      console.log("Setting image", newHeight, newWidth);

      setImageRect({
        x: cropRect.x + (cropRect.width - newWidth) / 2,
        y: cropRect.y + (cropRect.height - newHeight) / 2,
        width: newWidth,
        height: newHeight,
      });
    };
  }, [imageUrl]);

  // Draw function
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

  // Draw handles for both crop rectangle and image
  const drawHandles = (ctx: CanvasRenderingContext2D) => {
    const edgeHandles = [
      {x: cropRect.x + cropRect.width / 2, y: cropRect.y, cursor: "ns-resize"}, // top
      {
        x: cropRect.x + cropRect.width,
        y: cropRect.y + cropRect.height / 2,
        cursor: "ew-resize",
      }, // right
      {
        x: cropRect.x + cropRect.width / 2,
        y: cropRect.y + cropRect.height,
        cursor: "ns-resize",
      }, // bottom
      {x: cropRect.x, y: cropRect.y + cropRect.height / 2, cursor: "ew-resize"}, // left
    ];

    const cornerHandles = [
      {x: imageRect.x, y: imageRect.y}, // top-left
      {x: imageRect.x + imageRect.width, y: imageRect.y}, // top-right
      {x: imageRect.x + imageRect.width, y: imageRect.y + imageRect.height}, // bottom-right
      {x: imageRect.x, y: imageRect.y + imageRect.height}, // bottom-left
    ];

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
    if (imageRect.x < cropRect.x || 
        imageRect.x + imageRect.width > cropRect.x + cropRect.width || 
        imageRect.y < cropRect.y || 
        imageRect.y + imageRect.height > cropRect.y + cropRect.height) {
      
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
        ctx.lineTo(imageRect.x + imageRect.width, imageRect.y + imageRect.height);
        ctx.stroke();
        ctx.moveTo(imageRect.x + imageRect.width, imageRect.y + imageRect.height);
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
        ctx.lineTo(imageRect.x + imageRect.width, imageRect.y + imageRect.height);
        ctx.stroke();
        ctx.moveTo(imageRect.x + imageRect.width, imageRect.y + imageRect.height);
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
    if (
      x >= cropRect.x &&
      x <= cropRect.x + cropRect.width &&
      y >= cropRect.y &&
      y <= cropRect.y + cropRect.height
    ) {
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


    const isOverCorner = (isOverCropRect && (x < cropRect.x + 10 || x > cropRect.x + cropRect.width - 10) && (y < cropRect.y + 10 || y > cropRect.y + cropRect.height - 10));
      

    // Change cursor style based on hover
    if (isOverImage || isOverCorner) {
      canvas.style.cursor = "all-scroll"; // Cursor for image and corners of crop rectangle
    } else if (isOverCropRect) {
      canvas.style.cursor = "grab"; // Cursor for crop rectangle
    } else {
      canvas.style.cursor = "default"; // Default cursor
    }

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
        } else if (isOverCropRect) {
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

  // Helper function to determine which handle is being clicked
  const getActiveHandle = (x: number, y: number): string | null => {
    const handleRadius = 6;

    // Check crop rectangle edge handles
    const edgeHandles = [
      {x: cropRect.x + cropRect.width / 2, y: cropRect.y, handle: "top"},
      {
        x: cropRect.x + cropRect.width,
        y: cropRect.y + cropRect.height / 2,
        handle: "right",
      },
      {
        x: cropRect.x + cropRect.width / 2,
        y: cropRect.y + cropRect.height,
        handle: "bottom",
      },
      {x: cropRect.x, y: cropRect.y + cropRect.height / 2, handle: "left"},
    ];

    // Check image corner handles
    const cornerHandles = [
      {x: imageRect.x, y: imageRect.y, handle: "image-tl"},
      {x: imageRect.x + imageRect.width, y: imageRect.y, handle: "image-tr"},
      {
        x: imageRect.x + imageRect.width,
        y: imageRect.y + imageRect.height,
        handle: "image-br",
      },
      {x: imageRect.x, y: imageRect.y + imageRect.height, handle: "image-bl"},
    ];

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

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={600}
      className="border border-gray-200 rounded-lg cursor-move"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    />
  );
}
