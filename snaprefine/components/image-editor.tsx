"use client";
import { useEditorStore } from "@/store/useEditorState";
import { useRef, useEffect } from "react";
import { ToolType } from "@/lib/constants";

const ImageEditor = () => {
  const { selectedTool, imageUrl } = useEditorStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const startRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  
  // This ref holds the offscreen mask — never assign a JSX ref to it
  const maskCanvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // This ref points to the visible mask canvas in the DOM
  const maskDisplayRef = useRef<HTMLCanvasElement>(null);

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
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;

      // Set up the visible mask canvas dimensions too
      if (maskDisplayRef.current) {
        maskDisplayRef.current.width = image.naturalWidth;
        maskDisplayRef.current.height = image.naturalHeight;
      }

      // Offscreen mask canvas — this is fine as a detached element
      const offscreen = document.createElement("canvas");
      offscreen.width = image.naturalWidth;
      offscreen.height = image.naturalHeight;
      const maskCtx = offscreen.getContext("2d");
      if (!maskCtx) return;
      maskCtx.fillStyle = "black";
      maskCtx.fillRect(0, 0, offscreen.width, offscreen.height);
      maskCanvasRef.current = offscreen;

      ctx.drawImage(image, 0, 0);
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

    ctx.lineWidth = 100;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (selectedTool === ToolType.ERASE ) {
      ctx.strokeStyle = "black";
    } else {
      ctx.strokeStyle = "white";
      
    }
   
    ctx.beginPath();
    ctx.moveTo(startPoint.x, startPoint.y);
    ctx.lineTo(endPoint.x, endPoint.y);
    ctx.stroke();

    // Mirror the offscreen mask onto the visible canvas
    const displayCtx = maskDisplayRef.current?.getContext("2d");
    if (displayCtx && maskDisplayRef.current) {
      displayCtx.clearRect(0, 0, maskDisplayRef.current.width, maskDisplayRef.current.height);
      displayCtx.drawImage(offscreen, 0, 0);
    }
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    if (selectedTool === ToolType.PAN) return;
    if (event.pointerType !== "mouse") return;
    const pos = getPointerPosition(event);
    startRef.current = pos;
    if (selectedTool === ToolType.BRUSH || selectedTool === ToolType.ERASE) {
      updateMaskImage(pos, pos);
    }
  };

  return (
    <>
      <canvas ref={canvasRef} className="max-w-full max-h-full" onPointerDown={handlePointerDown} />
      {/* maskDisplayRef is a real DOM canvas — gets painted from the offscreen mask */}
      <canvas ref={maskDisplayRef} className="max-w-full max-h-full" />
    </>
  );
};

export default ImageEditor;