"use client";
import { useEditorStore } from "@/store/useEditorState";
import { useRef, useEffect } from "react";

const ImageEditor = () => {
const { imageUrl } = useEditorStore();
const canvasRef = useRef<HTMLCanvasElement>(null);
if (!imageUrl) return null;

useEffect(() => {
    if(!imageUrl) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const image = new Image();
    image.src = imageUrl;
    image.onload = () => {
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        ctx.drawImage(image, 0, 0);
   
    }
}, [imageUrl])





  return (
     <>
     <canvas ref={canvasRef} className="max-w-full max-h-full">
     </canvas>
    </>
  )
};

export default ImageEditor;