// frontend/src/components/MessageInput.jsx  (UPGRADED)
// Key changes:
//   1. Emits "typing" / "stopTyping" socket events
//   2. Dark-themed styling with indigo accents
//   3. Cleaner layout using inline styles matching design system

import { useRef, useState, useEffect, useCallback } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { Image, Send, X, Smile, Mic, Square, Play, Pause, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import EmojiPicker from "emoji-picker-react";

const BTN_STYLE = {
  base: "flex items-center justify-center w-9 h-9 rounded-xl transition-colors cursor-pointer",
  muted: { color: "#94a3b8" },
  accent: { color: "#6366f1" },
};

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceBlob, setVoiceBlob] = useState(null);
  const [voiceUrl, setVoiceUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const fileInputRef   = useRef(null);
  const emojiPickerRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef   = useRef([]);
  const audioRef       = useRef(null);
  const timerRef       = useRef(null);
  const typingTimerRef = useRef(null);
  const isTypingRef    = useRef(false);

  const { sendMessage, selectedUser } = useChatStore();
  const { socket }                    = useAuthStore();

  // ── Typing events ────────────────────────────────────────────
  const emitTyping = useCallback(() => {
    if (!socket || !selectedUser) return;
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      socket.emit("typing", { receiverId: selectedUser._id });
    }
    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      isTypingRef.current = false;
      socket.emit("stopTyping", { receiverId: selectedUser._id });
    }, 2000);
  }, [socket, selectedUser]);

  const handleTextChange = (e) => {
    setText(e.target.value);
    emitTyping();
  };

  // Stop typing when component unmounts
  useEffect(() => () => {
    clearTimeout(typingTimerRef.current);
    if (socket && selectedUser && isTypingRef.current) {
      socket.emit("stopTyping", { receiverId: selectedUser._id });
    }
  }, [socket, selectedUser]);

  // ── Emoji picker outside click ────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target))
        setShowEmojiPicker(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Recording timer ───────────────────────────────────────────
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => setRecordingTime((p) => p + 1), 1000);
    } else {
      clearInterval(timerRef.current);
      setRecordingTime(0);
    }
    return () => clearInterval(timerRef.current);
  }, [isRecording]);

  const formatTime = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  // ── Image ─────────────────────────────────────────────────────
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file?.type.startsWith("image/")) return toast.error("Please select an image file");
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };
  const removeImage = () => { setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = ""; };

  // ── Voice ─────────────────────────────────────────────────────
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setVoiceBlob(blob);
        setVoiceUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
      };
      mediaRecorder.start();
      setIsRecording(true);
    } catch {
      toast.error("Microphone access denied");
    }
  };
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) { mediaRecorderRef.current.stop(); setIsRecording(false); }
  };
  const discardVoice = () => {
    setVoiceBlob(null); setVoiceUrl(null); setIsPlaying(false);
    audioRef.current?.pause(); audioRef.current = null;
  };
  const togglePlayVoice = () => {
    if (!voiceUrl) return;
    if (isPlaying) { audioRef.current?.pause(); setIsPlaying(false); }
    else {
      const audio = new Audio(voiceUrl);
      audioRef.current = audio;
      audio.play(); setIsPlaying(true);
      audio.onended = () => setIsPlaying(false);
    }
  };
  const blobToBase64 = (blob) =>
    new Promise((res) => { const r = new FileReader(); r.onloadend = () => res(r.result); r.readAsDataURL(blob); });

  // ── Send ──────────────────────────────────────────────────────
  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview && !voiceBlob) return;
    try {
      // Stop typing signal immediately
      clearTimeout(typingTimerRef.current);
      isTypingRef.current = false;
      socket?.emit("stopTyping", { receiverId: selectedUser._id });

      await sendMessage({
        text: text.trim(),
        image: imagePreview,
        voice: voiceBlob ? await blobToBase64(voiceBlob) : null,
      });
      setText(""); setImagePreview(null); discardVoice();
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch {
      console.error("Send failed");
    }
  };

  return (
    <div
      className="p-3"
      style={{ background: "#1e293b", borderTop: "1px solid rgba(255,255,255,0.06)" }}
    >
      {/* Image preview */}
      {imagePreview && (
        <div className="mb-2 flex items-center gap-2">
          <div className="relative">
            <img src={imagePreview} alt="preview" className="w-16 h-16 object-cover rounded-xl" />
            <button onClick={removeImage} className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "#0f172a", color: "#94a3b8" }}>
              <X size={11} />
            </button>
          </div>
        </div>
      )}

      {/* Voice preview */}
      {voiceBlob && !isRecording && (
        <div className="mb-2 flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: "#0f172a" }}>
          <button type="button" onClick={togglePlayVoice} className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "#6366f1", color: "#fff" }}>
            {isPlaying ? <Pause size={12} /> : <Play size={12} />}
          </button>
          <div className="flex-1 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.1)" }}>
            <div className="h-full w-1/3 rounded-full" style={{ background: "#6366f1" }} />
          </div>
          <span className="text-xs" style={{ color: "#94a3b8" }}>Voice</span>
          <button type="button" onClick={discardVoice} style={{ color: "#ef4444" }}><Trash2 size={13} /></button>
        </div>
      )}

      {/* Recording indicator */}
      {isRecording && (
        <div className="mb-2 flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }}>
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#ef4444" }} />
          <span className="text-xs font-medium" style={{ color: "#ef4444" }}>Recording… {formatTime(recordingTime)}</span>
        </div>
      )}

      {/* Input row */}
      <form onSubmit={handleSend} className="flex items-center gap-2">

        {/* Emoji */}
        <div className="relative" ref={emojiPickerRef}>
          <button type="button" onClick={() => setShowEmojiPicker((p) => !p)}
            className={BTN_STYLE.base} style={showEmojiPicker ? BTN_STYLE.accent : BTN_STYLE.muted}>
            <Smile size={18} />
          </button>
          {showEmojiPicker && (
            <div className="absolute bottom-12 left-0 z-50">
              <EmojiPicker onEmojiClick={(d) => setText((p) => p + d.emoji)} theme="dark" height={380} width={300} />
            </div>
          )}
        </div>

        {/* Text input */}
        <input
          type="text"
          value={text}
          onChange={handleTextChange}
          disabled={isRecording}
          placeholder={isRecording ? "Recording…" : "Type a message…"}
          className="flex-1 text-sm rounded-xl px-4 py-2.5 outline-none transition-colors"
          style={{ background: "#0f172a", color: "#e2e8f0", border: "1px solid rgba(255,255,255,0.08)" }}
          onFocus={(e) => (e.target.style.borderColor = "rgba(99,102,241,0.5)")}
          onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
        />
        <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageChange} />

        {/* Image attach */}
        <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isRecording}
          className={BTN_STYLE.base} style={imagePreview ? { color: "#22c55e" } : BTN_STYLE.muted}>
          <Image size={18} />
        </button>

        {/* Mic */}
        {!voiceBlob && (
          <button type="button" onMouseDown={startRecording} onMouseUp={stopRecording}
            onTouchStart={startRecording} onTouchEnd={stopRecording}
            className={BTN_STYLE.base} style={isRecording ? { color: "#ef4444", background: "rgba(239,68,68,0.15)" } : BTN_STYLE.muted}>
            {isRecording ? <Square size={15} /> : <Mic size={18} />}
          </button>
        )}

        {/* Send */}
        <button type="submit" disabled={!text.trim() && !imagePreview && !voiceBlob}
          className={`${BTN_STYLE.base} transition-all`}
          style={{ background: "#6366f1", color: "#fff", opacity: (!text.trim() && !imagePreview && !voiceBlob) ? 0.4 : 1 }}>
          <Send size={16} />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
