import React, { useState, useEffect, useRef } from 'react';

interface LiveVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LiveVoiceModal: React.FC<LiveVoiceModalProps> = ({ isOpen, onClose }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [conversation, setConversation] = useState<
    { sender: 'Tú' | 'Compadre Live'; text: string; time: string }[]
  >([
    {
      sender: 'Compadre Live',
      text: '¡Buenas tardes compadre! Soy tu compañero gaucho en vivo con Gemini 3.8 Live. Hablame de tus cartas o tus dudas de truco y te respondo en el acto.',
      time: 'Ahora',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);

  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Initialize or connect WebSocket when modal opens
  useEffect(() => {
    if (!isOpen) {
      cleanupAudio();
      if (wsRef.current) {
        wsRef.current.close();
      }
      setIsConnected(false);
      return;
    }

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/live`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.text) {
            setConversation((prev) => [
              ...prev,
              {
                sender: 'Compadre Live',
                text: data.text,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            ]);
          }
          if (data.audio) {
            playRawPCM(data.audio);
          }
        } catch (e) {
          console.error('Error parsing live WS response:', e);
        }
      };

      ws.onerror = () => {
        setIsConnected(false);
      };

      ws.onclose = () => {
        setIsConnected(false);
      };

      wsRef.current = ws;
    } catch (e) {
      console.error('WebSocket connection error:', e);
      setIsConnected(false);
    }

    return () => {
      cleanupAudio();
      if (wsRef.current) wsRef.current.close();
    };
  }, [isOpen]);

  const cleanupAudio = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setIsRecording(false);
  };

  const playRawPCM = (base64Data: string) => {
    try {
      if (!outputAudioContextRef.current) {
        outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
          sampleRate: 24000,
        });
      }
      const ctx = outputAudioContextRef.current;
      const binaryString = window.atob(base64Data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const pcm16 = new Int16Array(bytes.buffer);
      const float32 = new Float32Array(pcm16.length);
      for (let i = 0; i < pcm16.length; i++) {
        float32[i] = pcm16[i] / 32768.0;
      }
      const audioBuffer = ctx.createBuffer(1, float32.length, 24000);
      audioBuffer.copyToChannel(float32, 0);
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.start();
    } catch (e) {
      console.warn('Playback error or raw audio unsupported:', e);
    }
  };

  const toggleMicrophone = async () => {
    if (isRecording) {
      cleanupAudio();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000,
      });
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const processor = audioCtx.createScriptProcessor(4096, 1, 1);
      source.connect(processor);
      processor.connect(audioCtx.destination);

      setIsRecording(true);

      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        let sum = 0;
        for (let i = 0; i < inputData.length; i++) {
          sum += inputData[i] * inputData[i];
        }
        const rms = Math.sqrt(sum / inputData.length);
        setAudioLevel(Math.min(100, Math.round(rms * 200)));

        // Convert Float32 to Int16 PCM
        const pcm16 = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          const s = Math.max(-1, Math.min(1, inputData[i]));
          pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
        }

        // Base64 encode
        let binary = '';
        const bytes = new Uint8Array(pcm16.buffer);
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const base64 = window.btoa(binary);

        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ audio: base64 }));
        }
      };
    } catch (err) {
      console.warn('Microphone access denied or error:', err);
      alert('Por favor, permite el acceso al micrófono para hablar en vivo con el compadre.');
    }
  };

  const handleSendPrompt = async (text: string) => {
    if (!text.trim()) return;
    const userMsg = text.trim();
    setInputText('');
    setConversation((prev) => [
      ...prev,
      {
        sender: 'Tú',
        text: userMsg,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);

    // Send to WebSocket if open
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ text: userMsg }));
      return;
    }

    // Otherwise use server-side REST fallback
    setIsLoading(true);
    try {
      const res = await fetch('/api/voice-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userMsg }),
      });
      const data = await res.json();
      setConversation((prev) => [
        ...prev,
        {
          sender: 'Compadre Live',
          text: data.reply || '¡Hay que jugar con coraje y picardía, chamigo!',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-surface-container-lowest/80 backdrop-blur-md p-gutter"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl bg-surface-container p-space-lg rounded-2xl shadow-2xl border border-secondary/30 flex flex-col gap-space-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-space-xs border-b border-surface-container-high">
          <div className="flex items-center gap-space-sm">
            <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center text-secondary border border-secondary/40">
              <span className="material-symbols-outlined text-title-lg animate-pulse">record_voice_over</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-headline-md text-headline-md text-on-surface font-bold">
                  Compadre Criollo en Vivo
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-primary-container text-primary font-label-sm font-bold text-[10px] border border-primary/30">
                  gemini-3.8-live
                </span>
              </div>
              <p className="font-label-sm text-on-surface-variant text-[11px]">
                Conversación por voz en tiempo real con la Live API de Gemini.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Live Audio Visualizer / Microphone Trigger */}
        <div className="flex flex-col items-center justify-center py- space-xs bg-surface-container-lowest/60 rounded-xl p-space-md border border-surface-container-high/40 text-center">
          <div className="relative flex items-center justify-center mb-3">
            <div
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
                isRecording
                  ? 'bg-secondary text-on-secondary shadow-lg shadow-secondary/40 scale-105'
                  : 'bg-surface-container-high text-primary hover:bg-surface-container-highest'
              }`}
            >
              <button
                onClick={toggleMicrophone}
                className="w-full h-full rounded-full flex items-center justify-center cursor-pointer"
                title={isRecording ? 'Detener micrófono' : 'Hablar con el compadre en vivo'}
                type="button"
              >
                <span className="material-symbols-outlined text-display-lg-mobile">
                  {isRecording ? 'mic' : 'mic_none'}
                </span>
              </button>
            </div>
            {isRecording && (
              <span
                className="absolute inset-0 rounded-full border-2 border-secondary animate-ping pointer-events-none"
                style={{ opacity: Math.max(0.2, audioLevel / 100) }}
              ></span>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span
              className={`w-2 h-2 rounded-full ${
                isRecording ? 'bg-secondary animate-pulse' : isConnected ? 'bg-primary' : 'bg-outline'
              }`}
            ></span>
            <span className="font-bold text-on-surface">
              {isRecording
                ? 'Escuchando tu voz... (gemini-3.8-live activo)'
                : isConnected
                ? 'Conectado a Live API. Tocá el micrófono o escribí abajo.'
                : 'Conectando con el salón...'}
            </span>
          </div>
        </div>

        {/* Chat / Speech History */}
        <div className="max-h-56 overflow-y-auto space-y-2 p-2 bg-surface-container-low rounded-xl border border-surface-container-high/40 text-xs">
          {conversation.map((msg, i) => (
            <div
              key={i}
              className={`p-2.5 rounded-lg ${
                msg.sender === 'Tú'
                  ? 'bg-primary-container/40 text-primary border border-primary/20 ml-6'
                  : 'bg-surface-container border border-surface-container-high text-on-surface mr-6'
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold">{msg.sender}</span>
                <span className="text-[10px] text-on-surface-variant">{msg.time}</span>
              </div>
              <p className="text-on-surface leading-relaxed">{msg.text}</p>
            </div>
          ))}
          {isLoading && (
            <div className="p-2 text-center text-xs text-secondary animate-pulse">
              El compadre está barajando la respuesta...
            </div>
          )}
        </div>

        {/* Quick Gaucho Phrases */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          <button
            onClick={() => handleSendPrompt('¿Qué hago si tengo 33 de mano y el rival me canta truco de entrada?')}
            className="px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high text-[11px] text-on-surface border border-surface-container-high transition-colors cursor-pointer"
          >
            "Tengo 33 de mano, ¿qué hago?"
          </button>
          <button
            onClick={() => handleSendPrompt('¿Cómo disimulo las señas en el 2 vs 2?')}
            className="px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high text-[11px] text-on-surface border border-surface-container-high transition-colors cursor-pointer"
          >
            "¿Cómo disimulo las señas?"
          </button>
          <button
            onClick={() => handleSendPrompt('Tirá un refrán criollo bien pícaro para intimidar al rival.')}
            className="px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high text-[11px] text-on-surface border border-surface-container-high transition-colors cursor-pointer"
          >
            "Tirá un refrán para intimidar"
          </button>
        </div>

        {/* Input box */}
        <div className="flex items-center gap-2 pt-space-xs">
          <input
            type="text"
            placeholder="Preguntale o hablá con el compadre..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendPrompt(inputText);
            }}
            className="flex-1 bg-surface-container-lowest text-xs text-on-surface px-3 py-2 rounded-lg border border-surface-container-high focus:outline-none focus:ring-1 focus:ring-secondary"
          />
          <button
            onClick={() => handleSendPrompt(inputText)}
            className="px-4 py-2 bg-secondary text-on-secondary font-bold text-xs rounded-lg shadow hover:bg-secondary-container transition-colors cursor-pointer"
            type="button"
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
};
