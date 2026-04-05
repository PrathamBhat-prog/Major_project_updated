import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, RefreshCw, AlertCircle, Loader2 } from 'lucide-react';

const QRScanner = ({ 
  onScanSuccess, 
  onScanError 
}) => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [cameras, setCameras] = useState([]);
  const [currentCameraId, setCurrentCameraId] = useState(null);
  const [error, setError] = useState(null);
  
  const scannerRef = useRef(null);
  const regionId = "native-qr-reader";

  // 1. Initialize Cameras
  useEffect(() => {
    Html5Qrcode.getCameras()
      .then(devices => {
        if (devices && devices.length > 0) {
          setCameras(devices);
          setCurrentCameraId(devices[0].id);
        } else {
          setError("No cameras found on this device.");
        }
        setIsInitializing(false);
      })
      .catch(err => {
        console.error("Camera access error:", err);
        setError("Camera permission denied or not accessible.");
        setIsInitializing(false);
      });

    return () => {
      stopScanner();
    };
  }, []);

  // 2. Start/Restart Scanner when cameraId changes
  useEffect(() => {
    if (currentCameraId) {
      startScanner(currentCameraId);
    }
  }, [currentCameraId]);

  const startScanner = async (cameraId) => {
    try {
      if (scannerRef.current && scannerRef.current.isScanning) {
        await scannerRef.current.stop();
      }

      const html5QrCode = new Html5Qrcode(regionId);
      scannerRef.current = html5QrCode;

      const config = {
        fps: 15,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      };

      await html5QrCode.start(
        cameraId,
        config,
        (decodedText, decodedResult) => {
          if (onScanSuccess) onScanSuccess(decodedText, decodedResult);
        },
        (errorMessage) => {
          if (onScanError) onScanError(errorMessage);
        }
      );
      setError(null);
    } catch (err) {
      console.error("Failed to start scanner:", err);
      setError("Failed to initialize camera stream.");
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
      } catch (err) {
        console.error("Failed to stop scanner:", err);
      }
    }
  };

  const toggleCamera = () => {
    if (cameras.length < 2) return;
    const currentIndex = cameras.findIndex(c => c.id === currentCameraId);
    const nextIndex = (currentIndex + 1) % cameras.length;
    setCurrentCameraId(cameras[nextIndex].id);
  };

  if (isInitializing) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
        <Loader2 size={40} className="text-indigo-600 animate-spin mb-4" />
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest text-center leading-relaxed">
          Initializing Native Lens...<br/>Requesting Hardware Access
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-rose-50 rounded-3xl border-2 border-dashed border-rose-100 text-rose-600">
        <AlertCircle size={40} className="mb-4" />
        <p className="text-sm font-bold text-center leading-relaxed max-w-xs uppercase tracking-tight">
          {error}
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-6 px-6 py-2.5 bg-rose-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-rose-200 active:scale-95 transition-all"
        >
          Retry Permission
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-sm mx-auto overflow-hidden rounded-[2.5rem] bg-black shadow-2xl group border-4 border-white">
      
      {/* NATIVE VIEWPORT */}
      <div id={regionId} className="w-full aspect-square overflow-hidden" />

      {/* CUSTOM UI OVERLAY */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        
        {/* SCANNING FRAME (Targeting Box) */}
        <div className="w-[250px] h-[250px] border-2 border-white/40 rounded-[2rem] relative flex items-center justify-center animate-pulse-indigo">
          
          {/* CORNER BRACKETS */}
          <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-indigo-500 rounded-tl-xl"></div>
          <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-indigo-500 rounded-tr-xl"></div>
          <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-indigo-500 rounded-bl-xl"></div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-indigo-500 rounded-br-xl"></div>

          {/* SCAN LINE ANIMATION */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-500/80 shadow-[0_0_15px_rgba(79,70,229,1)] opacity-70 animate-scan rounded-full"></div>
        </div>

        {/* DIMMED SIDES */}
        <div className="absolute inset-x-0 top-0 h-[calc(50%-125px)] bg-black/40 backdrop-blur-[2px]"></div>
        <div className="absolute inset-x-0 bottom-0 h-[calc(50%-125px)] bg-black/40 backdrop-blur-[2px]"></div>
        <div className="absolute left-0 top-[calc(50%-125px)] bottom-[calc(50%-125px)] w-[calc(50%-125px)] bg-black/40 backdrop-blur-[2px]"></div>
        <div className="absolute right-0 top-[calc(50%-125px)] bottom-[calc(50%-125px)] w-[calc(50%-125px)] bg-black/40 backdrop-blur-[2px]"></div>
      </div>

      {/* TOP CONTROLS */}
      <div className="absolute top-6 inset-x-6 flex justify-between items-center z-10">
        <div className="px-4 py-2 bg-black/40 backdrop-blur-md rounded-full border border-white/20 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] font-black text-white uppercase tracking-widest leading-none">Live Stream</span>
        </div>
        
        {cameras.length > 1 && (
          <button 
            onClick={toggleCamera}
            className="w-10 h-10 bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-full border border-white/20 flex items-center justify-center text-white transition-all active:scale-90"
            title="Switch Camera"
          >
            <RefreshCw size={18} />
          </button>
        )}
      </div>

      {/* BOTTOM FOOTER */}
      <div className="absolute bottom-6 inset-x-6 z-10">
         <div className="p-4 bg-black/40 backdrop-blur-xl rounded-[1.5rem] border border-white/10 flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
               <Camera size={20} />
            </div>
            <div className="text-left">
               <p className="text-[10px] font-black text-white uppercase tracking-widest leading-none mb-1">Optical Search</p>
               <p className="text-[8px] font-bold text-white/50 leading-none">CephaAI Integrated Vision</p>
            </div>
         </div>
      </div>

    </div>
  );
};

export default QRScanner;
