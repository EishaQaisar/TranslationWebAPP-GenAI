import React, { useState, useRef , useEffect} from "react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";
console.log("HEHENWEWE")
console.log(BACKEND_URL)

// Full language list
const LANG_OPTIONS = [
  { code: "en", label: "English" },
  { code: "es", label: "Spanish" },
  { code: "ru", label: "Russian" },
  { code: "zh", label: "Chinese" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "it", label: "Italian" },
  { code: "ar", label: "Arabic" },
  { code: "hi", label: "Hindi" },
  { code: "ja", label: "Japanese" },
  { code: "ko", label: "Korean" },
  { code: "ur", label: "Urdu" }
];

// Map of valid translations
const VALID_TARGETS = {
  en: ["es", "ru", "zh", "hi", "ar", "fr"],
  es: ["en"],
  ru: ["en", "zh", "hi"],
  zh: ["en", "ru", "es", "fr", "hi", "ar", "ja"],
  fr: ["en", "zh", "hi"],
  de: ["en", "ru", "hi"],
  ar: ["en", "zh", "hi"],
  hi: ["en"],
  ja: ["en", "es", "zh", "hi"],
};

export default function App() {
  const [original, setOriginal] = useState("");
  const [translated, setTranslated] = useState("");
  const [srcLang, setSrcLang] = useState("en");
  const [tgtLang, setTgtLang] = useState("es");
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const recognitionRef = useRef(null);

  // Available target languages
  const availableTargets = VALID_TARGETS[srcLang] || [];
  if (!availableTargets.includes(tgtLang)) setTgtLang(availableTargets[0] || "");

  // Voice-to-text
  const toggleRecording = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Speech recognition not supported in this browser.");
      return;
    }

    if (!recognitionRef.current) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = srcLang; // language code like 'en-US'
      recognition.interimResults = true;
      recognition.continuous = false;

      recognition.onresult = (event) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        setOriginal(transcript);
      };

      recognition.onend = () => setRecording(false);

      recognitionRef.current = recognition;
    }

    if (recording) {
      recognitionRef.current.stop();
      setRecording(false);
    } else {
      recognitionRef.current.lang = srcLang === "en" ? "en-US" :
                                    srcLang === "es" ? "es-ES" :
                                    srcLang === "fr" ? "fr-FR" :
                                    srcLang === "ru" ? "ru-RU" :
                                    srcLang === "zh" ? "zh-CN" :
                                    srcLang === "hi" ? "hi-IN" :
                                    srcLang === "ar" ? "ar-SA" :
                                    srcLang === "ja" ? "ja-JP" :
                                    srcLang === "de" ? "de-DE" : "en-US";
      recognitionRef.current.start();
      setRecording(true);
    }
  };

  const handleTranslate = async () => {
    if (!original.trim() || !tgtLang) return;

    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: original, src_lang: srcLang, tgt_lang: tgtLang }),
      });
      const data = await res.json();
      if (data.translated_text) setTranslated(data.translated_text);
      else if (data.error) alert("Translate error: " + data.error);
    } catch (err) {
      console.error("Translate request failed:", err);
      alert("Translate request failed. Check backend.");
    } finally {
      setLoading(false);
    }
  };

  const speakText = (text, lang) => {
    if (!("speechSynthesis" in window)) return;
    const u = new SpeechSynthesisUtterance(text);
    const langMap = {
      ur: "ur-PK", es: "es-ES", fr: "fr-FR", de: "de-DE", it: "it-IT",
      ar: "ar-SA", hi: "hi-IN", ja: "ja-JP", ko: "ko-KR", zh: "zh-CN",
      ru: "ru-RU", en: "en-US"
    };
    u.lang = langMap[lang] || "en-US";
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  };

  return (
    <div style={{ maxWidth: 720, margin: "24px auto", padding: 16, fontFamily: "Inter, Arial, sans-serif" }}>
      <h1>Healthcare Translation AI</h1>
      <h1>BACKEND_URL</h1>
      <h1>Healthcare Translation AI</h1>


      {/* Language Select */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        <div>
          <label style={{ display: "block", fontSize: 12 }}>From</label>
          <select value={srcLang} onChange={(e) => setSrcLang(e.target.value)}>
            {LANG_OPTIONS.map((o) => <option key={o.code} value={o.code}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: "block", fontSize: 12 }}>To</label>
          <select value={tgtLang} onChange={(e) => setTgtLang(e.target.value)}>
            {availableTargets.map((code) => {
              const lang = LANG_OPTIONS.find(l => l.code === code);
              return <option key={code} value={code}>{lang?.label || code}</option>;
            })}
          </select>
        </div>
      </div>

      {/* Translation Areas */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={{ background: "#fff", padding: 12, borderRadius: 8 }}>
          <h3>Original ({srcLang})</h3>
          <div style={{ display: "flex", gap: 8 }}>
            <textarea value={original} readOnly style={{ width: "100%", minHeight: 160 }} />
            <button onClick={toggleRecording} style={{ padding: "8px 12px" }}>
              {recording ? "Stop 🎙️" : "Record 🎤"}
            </button>
          </div>
          <button onClick={handleTranslate} disabled={loading || !tgtLang} style={{ marginTop: 8, padding: "8px 12px" }}>
            {loading ? "Translating..." : "Translate"}
          </button>
        </div>

        <div style={{ background: "#fff", padding: 12, borderRadius: 8 }}>
          <h3>Translated ({tgtLang})</h3>
          <textarea value={translated} readOnly style={{ width: "100%", minHeight: 160 }} />
          <button onClick={() => speakText(translated, tgtLang)} disabled={!translated} style={{ marginTop: 8, padding: "8px 12px" }}>
            🔊 Speak Translation
          </button>
        </div>
      </div>

      <p style={{ marginTop: 12, color: "#666", fontSize: 13 }}>
        Speak to enter text. Only supported translations are shown in the "To" dropdown.
      </p>
    </div>
  );
}
