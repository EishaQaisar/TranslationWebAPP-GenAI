"use client"

import { useState, useRef } from "react"
import "./App.css"

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000"

// Language options with flags
const LANG_OPTIONS = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "es", label: "Spanish", flag: "🇪🇸" },
  { code: "ru", label: "Russian", flag: "🇷🇺" },
  { code: "zh", label: "Chinese", flag: "🇨🇳" },
  { code: "fr", label: "French", flag: "🇫🇷" },
  { code: "de", label: "German", flag: "🇩🇪" },
  { code: "it", label: "Italian", flag: "🇮🇹" },
  { code: "ar", label: "Arabic", flag: "🇸🇦" },
  { code: "hi", label: "Hindi", flag: "🇮🇳" },
  { code: "ja", label: "Japanese", flag: "🇯🇵" },
  { code: "ko", label: "Korean", flag: "🇰🇷" },
  { code: "ur", label: "Urdu", flag: "🇵🇰" },
]

// Map of valid translations (keep your existing logic)
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
}

export default function App() {
  const [original, setOriginal] = useState("")
  const [translated, setTranslated] = useState("")
  const [srcLang, setSrcLang] = useState("en")
  const [tgtLang, setTgtLang] = useState("es")
  const [loading, setLoading] = useState(false)
  const [recording, setRecording] = useState(false)
  const recognitionRef = useRef(null)

  // Available target languages
  const availableTargets = VALID_TARGETS[srcLang] || []
  if (!availableTargets.includes(tgtLang)) setTgtLang(availableTargets[0] || "")

  // Get language info
  const getSrcLangInfo = () => LANG_OPTIONS.find((l) => l.code === srcLang) || { label: srcLang, flag: "🌐" }
  const getTgtLangInfo = () => LANG_OPTIONS.find((l) => l.code === tgtLang) || { label: tgtLang, flag: "🌐" }

  // Voice-to-text (keep your existing logic)
  const toggleRecording = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Speech recognition not supported in this browser.")
      return
    }

    if (!recognitionRef.current) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      const recognition = new SpeechRecognition()
      recognition.lang = srcLang
      recognition.interimResults = true
      recognition.continuous = false

      recognition.onresult = (event) => {
        let transcript = ""
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript
        }
        setOriginal(transcript)
      }

      recognition.onend = () => setRecording(false)
      recognitionRef.current = recognition
    }

    if (recording) {
      recognitionRef.current.stop()
      setRecording(false)
    } else {
      recognitionRef.current.lang =
        srcLang === "en"
          ? "en-US"
          : srcLang === "es"
            ? "es-ES"
            : srcLang === "fr"
              ? "fr-FR"
              : srcLang === "ru"
                ? "ru-RU"
                : srcLang === "zh"
                  ? "zh-CN"
                  : srcLang === "hi"
                    ? "hi-IN"
                    : srcLang === "ar"
                      ? "ar-SA"
                      : srcLang === "ja"
                        ? "ja-JP"
                        : srcLang === "de"
                          ? "de-DE"
                          : "en-US"
      recognitionRef.current.start()
      setRecording(true)
    }
  }

  // Translation (keep your existing logic)
  const handleTranslate = async () => {
    if (!original.trim() || !tgtLang) return

    setLoading(true)
    try {
      const res = await fetch(`${BACKEND_URL}/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: original, src_lang: srcLang, tgt_lang: tgtLang }),
      })
      const data = await res.json()
      if (data.translated_text) setTranslated(data.translated_text)
      else if (data.error) alert("Translate error: " + data.error)
    } catch (err) {
      console.error("Translate request failed:", err)
      alert("Translate request failed. Check backend.")
    } finally {
      setLoading(false)
    }
  }

  // Text-to-speech (keep your existing logic)
  const speakText = (text, lang) => {
    if (!("speechSynthesis" in window)) return
    const u = new SpeechSynthesisUtterance(text)
    const langMap = {
      ur: "ur-PK",
      es: "es-ES",
      fr: "fr-FR",
      de: "de-DE",
      it: "it-IT",
      ar: "ar-SA",
      hi: "hi-IN",
      ja: "ja-JP",
      ko: "ko-KR",
      zh: "zh-CN",
      ru: "ru-RU",
      en: "en-US",
    }
    u.lang = langMap[lang] || "en-US"
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(u)
  }

  return (
    <div className="app-container">
      <div className="app-header">
        <div className="header-icon">
          <div className="medical-cross">
            <div className="cross-horizontal"></div>
            <div className="cross-vertical"></div>
          </div>
        </div>
        <h1 className="app-title">Healthcare Translation AI</h1>
        <p className="app-subtitle">Professional medical translation powered by AI</p>
        <div className="trust-indicators">
          <span className="trust-badge">🔒 HIPAA Compliant</span>
          <span className="trust-badge">⚡ Real-time</span>
          <span className="trust-badge">🎯 Medical Accuracy</span>
        </div>
      </div>

      <div className="translation-card">
        {/* Language Selector */}
        <div className="language-selector">
          <div className="language-group">
            <label className="language-label">From</label>
            <div className="select-wrapper">
              <select className="language-select" value={srcLang} onChange={(e) => setSrcLang(e.target.value)}>
                {LANG_OPTIONS.map((o) => (
                  <option key={o.code} value={o.code}>
                    {o.flag} {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="language-swap">
            <button
              className="swap-btn"
              onClick={() => {
                if (availableTargets.includes(srcLang)) {
                  const temp = srcLang
                  setSrcLang(tgtLang)
                  setTgtLang(temp)
                }
              }}
            >
              ⇄
            </button>
          </div>

          <div className="language-group">
            <label className="language-label">To</label>
            <div className="select-wrapper">
              <select className="language-select" value={tgtLang} onChange={(e) => setTgtLang(e.target.value)}>
                {availableTargets.map((code) => {
                  const lang = LANG_OPTIONS.find((l) => l.code === code)
                  return (
                    <option key={code} value={code}>
                      {lang?.flag} {lang?.label || code}
                    </option>
                  )
                })}
              </select>
            </div>
          </div>
        </div>

        {/* Translation Areas */}
        <div className="translation-grid">
          <div className="text-panel input-panel">
            <div className="panel-header">
              <h3 className="panel-title">
                <span className="language-flag">{getSrcLangInfo().flag}</span>
                Original Text
                <span className="panel-subtitle">({getSrcLangInfo().label})</span>
              </h3>
              <div className="character-count">{original.length}/1000</div>
            </div>
            <div className="textarea-wrapper">
              <textarea
                className="textarea"
                value={original}
                onChange={(e) => setOriginal(e.target.value)}
                placeholder="Enter medical text to translate or use voice recording..."
                maxLength={1000}
              />
            </div>
            <div className="input-controls">
              <button
                className={`btn btn-record ${recording ? "recording" : ""}`}
                onClick={toggleRecording}
                title="Voice input"
              >
                <span className="btn-icon">{recording ? "⏹️" : "🎤"}</span>
                {recording ? "Stop Recording" : "Voice Input"}
              </button>
              {original && (
                <button className="btn btn-clear" onClick={() => setOriginal("")} title="Clear text">
                  <span className="btn-icon">🗑️</span>
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="text-panel output-panel">
            <div className="panel-header">
              <h3 className="panel-title">
                <span className="language-flag">{getTgtLangInfo().flag}</span>
                Translation
                <span className="panel-subtitle">({getTgtLangInfo().label})</span>
              </h3>
              {translated && (
                <div className="translation-status">
                  <span className="status-indicator success">✓ Translated</span>
                </div>
              )}
            </div>
            <div className="textarea-wrapper">
              <textarea
                className="textarea output-textarea"
                value={translated}
                readOnly
                placeholder="Professional medical translation will appear here..."
              />
            </div>
            <div className="input-controls">
              <button
                className="btn btn-secondary"
                onClick={() => speakText(translated, tgtLang)}
                disabled={!translated}
                title="Listen to translation"
              >
                <span className="btn-icon">🔊</span>
                Listen
              </button>
              {translated && (
                <button
                  className="btn btn-secondary"
                  onClick={() => navigator.clipboard.writeText(translated)}
                  title="Copy translation"
                >
                  <span className="btn-icon">📋</span>
                  Copy
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="action-bar">
          <button
            className="btn btn-primary btn-large"
            onClick={handleTranslate}
            disabled={loading || !tgtLang || !original.trim()}
          >
            {loading ? (
              <>
                <div className="loading-spinner"></div>
                Translating...
              </>
            ) : (
              <>
                <span className="btn-icon">🔄</span>
                Translate Now
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
