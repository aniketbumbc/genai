"use client";
import { useEditorStore } from "@/store/useEditorState";
import { useRef, useEffect } from "react";
import { ToolType } from "@/lib/constants";

const ImageEditor = () => {
  const { selectedTool, imageUrl, brushSize } = useEditorStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const startRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const maskCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const maskDisplayRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);

  if (!imageUrl) return null;

  useEffect(() => {
    if (!imageUrl) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const image = new Image();
    image.src = imageUrl;
    image.onload = () => {
      imageRef.current = image;

      // Set dimensions on all three DOM canvases
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;

      if (maskDisplayRef.current) {
        maskDisplayRef.current.width = image.naturalWidth;
        maskDisplayRef.current.height = image.naturalHeight;
      }

      if (overlayCanvasRef.current) {
        overlayCanvasRef.current.width = image.naturalWidth;
        overlayCanvasRef.current.height = image.naturalHeight;
      }

      // Offscreen mask — detached, never touches overlayCanvasRef
      const offscreen = document.createElement("canvas");
      offscreen.width = image.naturalWidth;
      offscreen.height = image.naturalHeight;
      const maskCtx = offscreen.getContext("2d");
      if (!maskCtx) return;
      maskCtx.fillStyle = "black";
      maskCtx.fillRect(0, 0, offscreen.width, offscreen.height);
      maskCanvasRef.current = offscreen;

      // Draw image on main canvas
      ctx.drawImage(image, 0, 0);

      // Draw initial mask state onto overlay DOM canvas
      const overlayCtx = overlayCanvasRef.current?.getContext("2d");
      if (!overlayCtx || !overlayCanvasRef.current) return;
      overlayCtx.clearRect(0, 0, overlayCanvasRef.current.width, overlayCanvasRef.current.height);
      overlayCtx.drawImage(offscreen, 0, 0); // ✅ works — ref still points to DOM canvas
    };
  }, [imageUrl]);

  const getPointerPosition = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * (canvasRef.current.width / rect.width),
      y: (event.clientY - rect.top) * (canvasRef.current.height / rect.height),
    };
  };

  const updateMaskImage = (
    startPoint: { x: number; y: number },
    endPoint: { x: number; y: number }
  ) => {
    const offscreen = maskCanvasRef.current;
    if (!offscreen) return;
    const ctx = offscreen.getContext("2d");
    if (!ctx) return;

    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = selectedTool === ToolType.ERASE ? "black" : "white";
    ctx.beginPath();
    ctx.moveTo(startPoint.x, startPoint.y);
    ctx.lineTo(endPoint.x, endPoint.y);
    ctx.stroke();

    const displayCtx = maskDisplayRef.current?.getContext("2d");
    if (displayCtx && maskDisplayRef.current) {
      displayCtx.clearRect(0, 0, maskDisplayRef.current.width, maskDisplayRef.current.height);
      displayCtx.drawImage(offscreen, 0, 0);
    }

    const overlayCtx = overlayCanvasRef.current?.getContext("2d");
    if (overlayCtx && overlayCanvasRef.current) {
      overlayCtx.clearRect(0, 0, overlayCanvasRef.current.width, overlayCanvasRef.current.height);
      overlayCtx.drawImage(offscreen, 0, 0);
      const imageData = overlayCtx.getImageData(0, 0, overlayCanvasRef.current.width, overlayCanvasRef.current.height);
     const MAX_WHITE_VALUE = 10;
      for (let i = 0; i < imageData.data.length; i += 4) {
        if(imageData.data[i] > MAX_WHITE_VALUE){
          imageData.data[i] = 255;// red color
          imageData.data[i + 1] = 0;// green color
          imageData.data[i + 2] = 0;// blue color
          imageData.data[i + 3] = 80;// alpha color Need to see image more clearly
        }else{
          imageData.data[i + 3] = 0;// alpha color
        }
      }
      overlayCtx.putImageData(imageData, 0, 0);
      const mainCanvas = canvasRef.current;
      const mainCtx = mainCanvas?.getContext("2d");
      if (mainCtx && imageRef.current && mainCanvas) {
        mainCtx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
        mainCtx.drawImage(imageRef.current, 0, 0);         // 1. draw original image
        mainCtx.drawImage(overlayCanvasRef.current, 0, 0);        // 2. draw red overlay on top
      }
    }
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    if (selectedTool === ToolType.PAN) return;
    if (event.pointerType !== "mouse") return;
    isDrawingRef.current = true;
    const pos = getPointerPosition(event);
    startRef.current = pos;
    if (selectedTool === ToolType.BRUSH || selectedTool === ToolType.ERASE) {
      updateMaskImage(pos, pos);
    }
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    event.preventDefault();
    const startPosition = startRef.current;
    const currentPosition = getPointerPosition(event);
    if (selectedTool === ToolType.BRUSH || selectedTool === ToolType.ERASE) {
      updateMaskImage(startPosition, currentPosition);
      startRef.current = currentPosition;
    }
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    isDrawingRef.current = false;
  };

  return (
    <div className="w-full h-full grid grid-cols-3 gap-2 items-center justify-center overflow-auto">
      <canvas ref={overlayCanvasRef} className="max-w-full max-h-full border-2 border-blue-500 rounded" />
      <canvas ref={canvasRef} className="max-w-full max-h-full border-2 border-emerald-500 rounded"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      />
      <canvas ref={maskDisplayRef} className="max-w-full max-h-full border-2 border-rose-500 rounded" />
    </div>
  );
};

export default ImageEditor;