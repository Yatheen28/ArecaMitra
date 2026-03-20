import React, { useState, useRef } from 'react';
import { Leaf, Camera, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

type AppState = 'upload' | 'loading' | 'result';
type Language = 'en' | 'kn';

interface Prediction {
  class: string;
  display_en: string;
  display_kn: string;
  confidence: number;
  is_healthy: boolean;
  treatment: string[];
}

const UI_TEXT = {
  en: {
    title: 'ArecaMitra',
    uploadTitle: 'Upload Leaf Photo',
    galleryTab: 'Gallery',
    cameraTab: 'Camera',
    dragDrop: 'Click or Drag & Drop Image Here',
    supportsFormat: 'Supports JPG, PNG',
    openCamera: 'Open Device Camera',
    analyze: 'Analyze Image',
    analysisResult: 'Analysis Result',
    confidence: 'Confidence',
    treatmentSteps: 'Treatment Steps',
    scanAnother: 'Scan Another Image',
    healthyBadge: 'Healthy',
    diseaseBadge: 'Action Required',
    loading: 'Analyzing leaf...',
    error: 'Analysis failed. Please try again.',
  },
  kn: {
    title: 'ಅಡಿಕೆ ಮಿತ್ರ',
    uploadTitle: 'ಎಲೆಯ ಫೋಟೋ ಅಪ್ಲೋಡ್ ಮಾಡಿ',
    galleryTab: 'ಗ್ಯಾಲರಿ',
    cameraTab: 'ಕ್ಯಾಮೆರಾ',
    dragDrop: 'ಇಲ್ಲಿ ಕ್ಲಿಕ್ ಮಾಡಿ ಅಥವಾ ಇಮೇಜ್ ಎಳೆಯಿರಿ',
    supportsFormat: 'JPG, PNG ಬೆಂಬಲಿಸುತ್ತದೆ',
    openCamera: 'ಕ್ಯಾಮೆರಾ ತೆರೆಯಿರಿ',
    analyze: 'ಫೋಟೋ ವಿಶ್ಲೇಷಿಸಿ',
    analysisResult: 'ವಿಶ್ಲೇಷಣಾ ಫಲಿತಾಂಶ',
    confidence: 'ವಿಶ್ವಾಸಾರ್ಹತೆ',
    treatmentSteps: 'ಚಿಕಿತ್ಸಾ ಕ್ರಮಗಳು',
    scanAnother: 'ಮತ್ತೊಂದು ಫೋಟೋ ಒದಗಿಸಿ',
    healthyBadge: 'ಆರೋಗ್ಯಕರ',
    diseaseBadge: 'ಕ್ರಮ ಅಗತ್ಯವಿದೆ',
    loading: 'ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...',
    error: 'ವಿಶ್ಲೇಷಣೆ ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
  }
};

export default function App() {
  const [lang, setLang] = useState<Language>('en');
  const [appState, setAppState] = useState<AppState>('upload');
  const [activeTab, setActiveTab] = useState<'gallery' | 'camera'>('gallery');

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const t = UI_TEXT[lang];

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setErrorMsg(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setErrorMsg(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    setAppState('loading');
    setErrorMsg(null);

    const formData = new FormData();
    formData.append('image', selectedImage);

    try {
      const response = await fetch(`${API_BASE}/predict`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('API failed');

      const data = await response.json();
      setPrediction(data);
      setAppState('result');
    } catch (err) {
      console.error(err);
      setErrorMsg(t.error);
      setAppState('upload');
    }
  };

  const resetState = () => {
    setSelectedImage(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPrediction(null);
    setErrorMsg(null);
    setAppState('upload');
  };

  const ConfidenceRing = ({ value }: { value: number }) => {
    const radius = 35;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (value / 100) * circumference;

    return (
      <div className="relative w-24 h-24 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="48" cy="48" r="35"
            className="stroke-[#2A6B2C] fill-none"
            strokeWidth="8"
          />
          <motion.circle
            cx="48" cy="48" r="35"
            className="stroke-[#4CAF50] fill-none drop-shadow-md"
            strokeWidth="8"
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            style={{ strokeDasharray: circumference }}
          />
        </svg>
        <div className="absolute font-bold text-white text-lg">
          {value}%
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0D2414] text-[#E3E3DE] font-['Manrope',sans-serif] selection:bg-[#1B5E20] selection:text-white flex flex-col">
      <header className="p-6 flex justify-between items-center max-w-2xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-[#00450d] to-[#1B5E20] p-2.5 rounded-xl shadow-lg shadow-[#000000]/20">
            <Leaf className="w-6 h-6 text-[#90d689]" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-[#fafaf5]">{t.title}</h1>
        </div>

        <button
          onClick={() => setLang(lang === 'en' ? 'kn' : 'en')}
          className="bg-[#1A3A24] hover:bg-[#2A6B2C] transition-colors rounded-full px-4 py-1.5 text-sm font-semibold flex items-center shadow-inner border border-[#2f7f33]/30"
        >
          <span className={`${lang === 'en' ? 'text-white' : 'text-[#90d689]/70'}`}>EN</span>
          <span className="mx-2 text-[#41493e]">|</span>
          <span className={`${lang === 'kn' ? 'text-white' : 'text-[#90d689]/70'}`}>ಕನ</span>
        </button>
      </header>

      <main className="flex-1 flex flex-col justify-center p-4 w-full max-w-md mx-auto relative h-full">
        <AnimatePresence mode="wait">

          {appState === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-[#18231c] border-none shadow-[0_12px_32px_rgba(0,0,0,0.4)] rounded-3xl p-8 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-[#4ade80] to-[#22c55e] rounded-[1.25rem] flex items-center justify-center mb-5 shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                    <Leaf className="w-10 h-10 text-white stroke-[1.5]" />
                  </div>
                  <h2 className="text-[28px] font-bold text-white text-center leading-tight mb-2">Areca Mitra</h2>
                  <p className="text-[#a1a1aa] text-center mb-8 font-medium">AI-Powered Areca Nut Disease Detection</p>
                  <p className="text-[#d4d4d8] text-center mb-4 text-[15px] font-medium">Choose how you want to upload the crop image</p>
                </div>

                <div className="flex bg-[#09090b] rounded-xl p-1.5 mb-8 relative z-10 w-full max-w-[280px] mx-auto">
                  <button
                    onClick={() => setActiveTab('gallery')}
                    className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${activeTab === 'gallery' ? 'bg-[#22c55e] text-white shadow-md' : 'text-[#a1a1aa] hover:text-white'}`}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
                    {t.galleryTab}
                  </button>
                  <button
                    onClick={() => setActiveTab('camera')}
                    className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${activeTab === 'camera' ? 'bg-[#22c55e] text-white shadow-md' : 'text-[#a1a1aa] hover:text-white'}`}
                  >
                    <Camera className="w-[18px] h-[18px]" /> {t.cameraTab}
                  </button>
                </div>

                <div className="flex flex-col justify-center items-center relative z-10">
                  {!previewUrl ? (
                    <div
                      className="w-full min-h-[200px] p-8 border-[1.5px] border-dashed rounded-[1.5rem] flex flex-col items-center justify-center cursor-pointer transition-colors hover:bg-[#22c55e]/10 border-[#4a5f51] bg-[#1a2e22]/30"
                      onClick={() => activeTab === 'camera' ? cameraInputRef.current?.click() : fileInputRef.current?.click()}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                    >
                      {activeTab === 'camera' ? (
                        <>
                          <div className="mb-4 text-[#4ade80]">
                            <Camera className="w-10 h-10" />
                          </div>
                          <p className="font-bold text-white text-center text-[15px]">{t.openCamera}</p>
                        </>
                      ) : (
                        <>
                          <div className="mb-4 text-[#4ade80]">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></svg>
                          </div>
                          <p className="font-bold text-white text-center text-[15px] mb-2">{t.dragDrop}</p>
                          <p className="text-sm text-[#a1a1aa] font-medium">{t.supportsFormat}</p>
                        </>
                      )}
                    </div>
                  ) : (
                    <motion.div
                      className="w-full relative rounded-[1.5rem] overflow-hidden shadow-lg"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <img src={previewUrl} alt="Preview" className="w-full h-[220px] object-cover" />
                      <button
                        onClick={(e) => { e.stopPropagation(); setPreviewUrl(null); setSelectedImage(null); }}
                        className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 backdrop-blur-sm transition-colors"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                      </button>
                    </motion.div>
                  )}
                </div>

                <input type="file" className="hidden" ref={fileInputRef} accept="image/jpeg, image/png" onChange={handleImageSelect} />
                <input type="file" className="hidden" ref={cameraInputRef} accept="image/*" capture="environment" onChange={handleImageSelect} />

                {errorMsg && (
                  <p className="text-[#ffdad6] text-sm mt-4 text-center bg-[#93000a]/20 py-2 rounded-lg">{errorMsg}</p>
                )}

                {previewUrl && (
                  <Button
                    onClick={handleAnalyze}
                    className="w-full mt-6 bg-gradient-to-br from-[#1B5E20] to-[#00450d] hover:from-[#2a6b2c] hover:to-[#0c5216] text-white rounded-xl py-6 text-lg shadow-[0_8px_16px_rgba(0,0,0,0.25)] border-t border-[#4CAF50]/30 transition-all font-semibold"
                  >
                    {t.analyze}
                  </Button>
                )}
              </Card>
            </motion.div>
          )}

          {appState === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center flex-1 py-12"
            >
              <motion.div
                animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="bg-gradient-to-br from-[#1B5E20] to-[#00450d] p-6 rounded-2xl shadow-xl outline outline-8 outline-[#1B5E20]/20 mb-6"
              >
                <Leaf className="w-12 h-12 text-[#90d689]" />
              </motion.div>
              <h3 className="text-xl font-medium text-white">{t.loading}</h3>
            </motion.div>
          )}

          {appState === 'result' && prediction && (
            <motion.div
              key="result"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col gap-4"
            >
              <button
                onClick={resetState}
                className="flex items-center gap-2 text-[#c0c9bb] hover:text-white transition-colors self-start py-2 font-medium"
              >
                <ArrowLeft className="w-5 h-5" />
                {t.analysisResult}
              </button>

              <Card className="bg-[#1A3A24] border-none shadow-[0_12px_32px_rgba(0,0,0,0.4)] rounded-3xl p-6 relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-[#1B5E20]/40 to-transparent pointer-events-none" />

                <div className="flex gap-5 relative z-10 items-center">
                  <img src={previewUrl!} alt="Crop" className="w-[100px] h-[100px] object-cover rounded-2xl shadow-lg border border-[#2a6b2c]" />
                  <div className="flex-1">
                    <Badge variant="outline" className={`mb-2 border-0 ${prediction.is_healthy ? 'bg-[#1B5E20]/50 text-[#91d78a]' : 'bg-[#6b1d3d]/50 text-[#ffaec6]'}`}>
                      {prediction.is_healthy ? t.healthyBadge : t.diseaseBadge}
                    </Badge>
                    <h2 className={`text-2xl font-bold leading-tight ${prediction.is_healthy ? 'text-[#4CAF50]' : 'text-[#ef5350]'}`}>
                      {lang === 'en' ? prediction.display_en : prediction.display_kn}
                    </h2>
                  </div>
                </div>

                <div className="mt-8 bg-[#0D2414] rounded-2xl p-5 flex items-center justify-between border border-[#2a6b2c]/30 shadow-inner">
                  <div>
                    <p className="text-[#c0c9bb] text-sm mb-1">{t.confidence}</p>
                    <p className="text-white font-semibold text-lg">{prediction.confidence.toFixed(1)}%</p>
                  </div>
                  <ConfidenceRing value={prediction.confidence} />
                </div>

                {!prediction.is_healthy && prediction.treatment && prediction.treatment.length > 0 && (
                  <div className="mt-8 relative z-10">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-[#91d78a]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {t.treatmentSteps}
                    </h3>
                    <ul className="space-y-3">
                      {prediction.treatment.map((step, idx) => (
                        <li key={idx} className="flex gap-3 text-[#e3e3de] bg-[#2f312e]/30 p-3 rounded-xl border border-[#41493e]/50">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#1B5E20] text-white flex items-center justify-center text-xs font-bold shadow-sm">{idx + 1}</span>
                          <span className="text-[15px] leading-snug">{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Button
                  onClick={resetState}
                  variant="outline"
                  className="w-full mt-8 border-[#717a6d] text-[#e3e3de] hover:bg-[#2a6b2c] hover:text-white hover:border-[#2a6b2c] rounded-xl py-6 text-md font-medium"
                >
                  {t.scanAnother}
                </Button>
              </Card>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}