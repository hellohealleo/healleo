import { Icon } from "./Icon.jsx";
import { useState, useRef, useEffect } from "react";

const SpeechRecognition = typeof window !== "undefined"
  ? window.SpeechRecognition || window.webkitSpeechRecognition
  : null;

export function VoiceInput({ value, onChange, placeholder, style, multiline, rows, onKeyDown, disabled }) {
  const [listening, setListening] = useState(false);
  const recRef = useRef(null);

  useEffect(() => { return () => { recRef.current?.abort(); }; }, []);

  const toggle = () => {
    if (listening) {
      recRef.current?.stop();
      setListening(false);
      return;
    }

    const rec = new SpeechRecognition();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.continuous = true;
    recRef.current = rec;

    rec.onresult = (e) => {
      const transcript = Array.from(e.results)
        .filter(r => r.isFinal)
        .map(r => r[0].transcript)
        .join(" ");
      if (transcript) {
        const spacer = value && !value.endsWith(" ") ? " " : "";
        onChange({ target: { value: value + spacer + transcript } });
      }
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    rec.start();
    setListening(true);
  };

  const Tag = multiline ? "textarea" : "input";

  if (!SpeechRecognition) {
    return <Tag value={value} onChange={onChange} placeholder={placeholder} style={style}
      rows={multiline ? rows : undefined} onKeyDown={onKeyDown} disabled={disabled} />;
  }

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <Tag
        value={value}
        onChange={onChange}
        placeholder={listening ? "Listening..." : placeholder}
        style={{ ...style, paddingRight: 40 }}
        rows={multiline ? rows : undefined}
        onKeyDown={onKeyDown}
        disabled={disabled}
      />
      <button
        onClick={toggle}
        type="button"
        style={{
          position: "absolute",
          right: 8,
          top: multiline ? 10 : "50%",
          transform: multiline ? "none" : "translateY(-50%)",
          background: listening ? "var(--danger)" : "none",
          border: listening ? "none" : "1.5px solid var(--muted)",
          borderRadius: "50%",
          width: 28,
          height: 28,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 14,
          color: listening ? "#fff" : "var(--dim)",
          transition: "all 0.2s",
          animation: listening ? "pulse 1.5s ease infinite" : "none",
        }}
        title={listening ? "Stop listening" : "Voice input"}
      >
        <Icon name="search" size={14}/>
      </button>
    </div>
  );
}
