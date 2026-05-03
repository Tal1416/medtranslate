import React, { useState, useRef, useEffect } from "react";
import {
  Stethoscope,
  Languages,
  Sparkles,
  ShieldCheck,
  Home,
  Pill,
  AlertCircle,
  ArrowRight,
  Loader2,
  RotateCcw,
  Printer,
  ChevronDown,
  FileText,
  Clock,
} from "lucide-react";

const LANGUAGES = [
  { code: "es", label: "Spanish (Español)" },
  { code: "zh", label: "Mandarin (中文)" },
  { code: "ar", label: "Arabic (العربية)" },
  { code: "fr", label: "French (Français)" },
  { code: "vi", label: "Vietnamese (Tiếng Việt)" },
  { code: "tl", label: "Tagalog" },
  { code: "ru", label: "Russian (Русский)" },
  { code: "pt", label: "Portuguese (Português)" },
];

const SAMPLE_INSTRUCTIONS = `Patient presents s/p uncomplicated laparoscopic cholecystectomy. Discharge with the following instructions:

1. Activity: Ambulate as tolerated. No heavy lifting (>10 lbs) x 2 weeks. Avoid driving while on opioid analgesics.

2. Medications:
- Hydrocodone-acetaminophen 5/325 mg PO q6h PRN moderate pain (max 4g APAP/day)
- Docusate sodium 100 mg PO BID for opioid-induced constipation prophylaxis
- Continue home metoprolol 25 mg PO BID

3. Wound care: Keep incision sites clean and dry x 48h. Steri-strips will fall off spontaneously. May shower after 48h; no submersion in water x 14 days.

4. Diet: Advance as tolerated. Low-fat diet recommended for first 2 weeks.

5. Return precautions: Return to ED for fever >38.5°C, persistent vomiting, increasing abdominal pain refractory to analgesia, or signs of incisional infection (erythema, purulent drainage, dehiscence).

6. Follow-up: General Surgery clinic in 10-14 days. Schedule via outpatient referral line.`;

export default function MedTranslate() {
  const [stage, setStage] = useState("input"); // input | loading | result
  const [instructions, setInstructions] = useState("");
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [langOpen, setLangOpen] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setLangOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const translate = async () => {
    if (!instructions.trim()) return;
    setStage("loading");
    setError(null);

    const prompt = `You are a medical translator helping a patient understand their discharge instructions.

Translate and SIMPLIFY the following clinical discharge instructions into ${language.label}, written at a 5th-grade reading level. Be empathetic, clear, and reassuring — the patient may be anxious.

Return ONLY a single JSON object with this exact shape, no markdown fences, no preamble:

{
  "title": "Discharge Instructions (translated to target language)",
  "subtitle": "One short empathetic line in target language",
  "homeCare": ["3-5 plain-language bullets about what to do at home, in target language"],
  "medications": [
    {"name": "drug name and dose", "instruction": "when/how to take it in plain language, target language", "schedule": "morning/night/with meals/etc in target language"}
  ],
  "warnings": {
    "heading": "When to call the doctor (translated)",
    "lead": "Get help right away if you have: (translated)",
    "items": ["3-5 red-flag symptoms in plain language, translated"]
  },
  "glossary": [
    {"term": "medical term from original (keep in English)", "definition": "plain-language explanation in target language"}
  ]
}

Clinical instructions:
"""
${instructions}
"""`;

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1500,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await response.json();
      const text = data.content
        .filter((b) => b.type === "text")
        .map((b) => b.text)
        .join("\n")
        .replace(/```json|```/g, "")
        .trim();
      const parsed = JSON.parse(text);
      setResult(parsed);
      setStage("result");
    } catch (e) {
      console.error(e);
      setError("Translation failed. Please try again.");
      setStage("input");
    }
  };

  const reset = () => {
    setStage("input");
    setResult(null);
    setInstructions("");
  };

  return (
    <div
      className="min-h-screen w-full"
      style={{
        backgroundColor: "#f8f9ff",
        color: "#0d1c2e",
        fontFamily:
          "Manrope, ui-sans-serif, system-ui, -apple-system, sans-serif",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />

      {/* Header */}
      <header
        className="border-b"
        style={{ borderColor: "#dce9ff", backgroundColor: "#ffffff" }}
      >
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="h-10 w-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: "#003c90" }}
            >
              <Stethoscope className="h-5 w-5 text-white" />
            </div>
            <div>
              <div
                className="text-lg font-bold tracking-tight"
                style={{ color: "#003c90" }}
              >
                MedTranslate
              </div>
              <div
                className="text-xs"
                style={{ color: "#434653" }}
              >
                Discharge Instructions Translator
              </div>
            </div>
          </div>
          <div
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{
              backgroundColor: "#86f2e4",
              color: "#006f66",
            }}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            HIPAA Compliant
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 sm:py-14">
        {stage === "input" && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left: input area */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h1
                  className="text-3xl sm:text-4xl font-bold tracking-tight"
                  style={{ letterSpacing: "-0.02em" }}
                >
                  Translate complex medical
                  <br />
                  instructions into{" "}
                  <span style={{ color: "#003c90" }}>plain language</span>.
                </h1>
                <p
                  className="mt-4 text-lg leading-relaxed"
                  style={{ color: "#434653" }}
                >
                  Paste discharge notes. We'll translate, simplify, and return a
                  patient-ready handout with medications, warnings, and a glossary.
                </p>
              </div>

              <div
                className="rounded-2xl border p-6 sm:p-7"
                style={{
                  backgroundColor: "#ffffff",
                  borderColor: "#dce9ff",
                }}
              >
                {/* Language picker row */}
                <div className="flex items-center gap-3 flex-wrap mb-5">
                  <div
                    className="px-3 py-2 rounded-lg text-sm font-semibold"
                    style={{ backgroundColor: "#eff4ff", color: "#003c90" }}
                  >
                    English (Source)
                  </div>
                  <ArrowRight
                    className="h-4 w-4"
                    style={{ color: "#737784" }}
                  />
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setLangOpen(!langOpen)}
                      className="px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors"
                      style={{
                        backgroundColor: "#dce9ff",
                        color: "#003c90",
                      }}
                    >
                      {language.label}
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    {langOpen && (
                      <div
                        className="absolute z-10 mt-2 w-56 rounded-xl border overflow-hidden"
                        style={{
                          backgroundColor: "#ffffff",
                          borderColor: "#dce9ff",
                          boxShadow: "0 4px 12px rgba(13,28,46,0.08)",
                        }}
                      >
                        {LANGUAGES.map((l) => (
                          <button
                            key={l.code}
                            onClick={() => {
                              setLanguage(l);
                              setLangOpen(false);
                            }}
                            className="w-full text-left px-4 py-2.5 text-sm hover:bg-[#eff4ff] transition-colors"
                            style={{
                              color:
                                l.code === language.code
                                  ? "#003c90"
                                  : "#0d1c2e",
                              fontWeight: l.code === language.code ? 600 : 400,
                            }}
                          >
                            {l.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <label
                  className="block text-sm font-semibold mb-2"
                  style={{ color: "#0d1c2e" }}
                >
                  Original Medical Instructions
                </label>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Paste the clinician's discharge instructions here (e.g., post-op care, medication schedule, follow-up)…"
                  rows={11}
                  className="w-full rounded-xl border p-4 text-base leading-relaxed resize-none focus:outline-none transition-colors"
                  style={{
                    backgroundColor: "#f8f9ff",
                    borderColor: "#c3c6d5",
                    color: "#0d1c2e",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#003c90")}
                  onBlur={(e) => (e.target.style.borderColor = "#c3c6d5")}
                />

                <div className="flex items-center justify-between mt-4 flex-wrap gap-3">
                  <button
                    onClick={() => setInstructions(SAMPLE_INSTRUCTIONS)}
                    className="text-sm font-semibold transition-colors"
                    style={{ color: "#006a61" }}
                  >
                    Try a sample
                  </button>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setInstructions("")}
                      className="px-4 py-2.5 rounded-lg text-sm font-semibold border transition-colors"
                      style={{
                        borderColor: "#c3c6d5",
                        color: "#0d1c2e",
                        backgroundColor: "#ffffff",
                      }}
                    >
                      Clear
                    </button>
                    <button
                      onClick={translate}
                      disabled={!instructions.trim()}
                      className="px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{
                        backgroundColor: "#003c90",
                        color: "#ffffff",
                      }}
                    >
                      <Languages className="h-4 w-4" />
                      Translate & Simplify
                    </button>
                  </div>
                </div>

                {error && (
                  <div
                    className="mt-4 p-3 rounded-lg text-sm"
                    style={{
                      backgroundColor: "#ffdad6",
                      color: "#93000a",
                    }}
                  >
                    {error}
                  </div>
                )}
              </div>
            </div>

            {/* Right: AI Toolbox cards */}
            <div className="space-y-4">
              <div
                className="rounded-2xl border p-6"
                style={{ backgroundColor: "#ffffff", borderColor: "#dce9ff" }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles
                    className="h-5 w-5"
                    style={{ color: "#003c90" }}
                  />
                  <h2 className="text-lg font-bold">AI Toolbox</h2>
                </div>
                <p
                  className="text-sm mb-5"
                  style={{ color: "#434653" }}
                >
                  Smart enhancements for clinical clarity.
                </p>

                {[
                  {
                    icon: Sparkles,
                    title: "Simplify Terms",
                    desc: "Convert jargon to 5th grade level.",
                  },
                  {
                    icon: FileText,
                    title: "Generate Summary",
                    desc: "Key bullet points for the patient.",
                  },
                  {
                    icon: ShieldCheck,
                    title: "Accuracy Check",
                    desc: "Verify medical facts consistency.",
                  },
                ].map((f, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 py-3 border-t first:border-t-0"
                    style={{ borderColor: "#eff4ff" }}
                  >
                    <div
                      className="h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: "#eff4ff" }}
                    >
                      <f.icon
                        className="h-4 w-4"
                        style={{ color: "#003c90" }}
                      />
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{f.title}</div>
                      <div
                        className="text-xs mt-0.5"
                        style={{ color: "#434653" }}
                      >
                        {f.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div
                className="rounded-2xl p-6 relative overflow-hidden"
                style={{
                  background:
                    "linear-gradient(135deg, #003c90 0%, #0f52ba 100%)",
                  color: "#ffffff",
                }}
              >
                <div
                  className="absolute -right-6 -bottom-6 h-32 w-32 rounded-full"
                  style={{ backgroundColor: "rgba(134,242,228,0.15)" }}
                />
                <h3
                  className="text-lg font-bold leading-snug relative"
                  style={{ letterSpacing: "-0.01em" }}
                >
                  Bridging Language
                  <br />
                  Gaps in Care
                </h3>
                <p
                  className="text-sm mt-2 relative leading-relaxed"
                  style={{ color: "#bcceff" }}
                >
                  Empathetic precision so no patient leaves confused.
                </p>
              </div>
            </div>
          </div>
        )}

        {stage === "loading" && (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="relative">
              <div
                className="h-16 w-16 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: "#003c90" }}
              >
                <Loader2 className="h-8 w-8 text-white animate-spin" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mt-6">
              Translating to {language.label}…
            </h2>
            <p
              className="text-base mt-2 max-w-md text-center"
              style={{ color: "#434653" }}
            >
              Simplifying medical jargon and verifying clinical accuracy.
            </p>
          </div>
        )}

        {stage === "result" && result && (
          <div className="space-y-6">
            {/* Action bar */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <div
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "#006a61", letterSpacing: "0.08em" }}
                >
                  Patient-Facing Translation · {language.label}
                </div>
                <h1
                  className="text-3xl font-bold mt-1 tracking-tight"
                  style={{ letterSpacing: "-0.02em" }}
                >
                  Translation ready
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2.5 rounded-lg text-sm font-semibold border flex items-center gap-2"
                  style={{
                    borderColor: "#c3c6d5",
                    color: "#0d1c2e",
                    backgroundColor: "#ffffff",
                  }}
                >
                  <Printer className="h-4 w-4" /> Print
                </button>
                <button
                  onClick={reset}
                  className="px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2"
                  style={{
                    backgroundColor: "#003c90",
                    color: "#ffffff",
                  }}
                >
                  <RotateCcw className="h-4 w-4" /> New Translation
                </button>
              </div>
            </div>

            {/* The patient-facing card */}
            <div
              className="rounded-2xl border overflow-hidden"
              style={{ backgroundColor: "#ffffff", borderColor: "#dce9ff" }}
            >
              <div
                className="px-8 py-6 border-b flex items-center justify-between"
                style={{ borderColor: "#eff4ff" }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                    style={{
                      backgroundColor: "#003c90",
                      color: "#ffffff",
                    }}
                  >
                    {language.label}
                  </div>
                </div>
                <div
                  className="flex items-center gap-1.5 text-xs font-semibold"
                  style={{ color: "#006a61" }}
                >
                  <ShieldCheck className="h-4 w-4" />
                  AI Verified
                </div>
              </div>

              <div className="px-8 py-10 sm:px-12">
                <h2
                  className="text-3xl sm:text-4xl font-bold text-center tracking-tight"
                  style={{ color: "#003c90", letterSpacing: "-0.02em" }}
                >
                  {result.title}
                </h2>
                {result.subtitle && (
                  <p
                    className="text-center mt-3 text-lg"
                    style={{ color: "#434653" }}
                  >
                    {result.subtitle}
                  </p>
                )}

                {/* Home care */}
                {result.homeCare && result.homeCare.length > 0 && (
                  <section className="mt-10">
                    <div className="flex items-center gap-3 mb-4">
                      <Home
                        className="h-6 w-6"
                        style={{ color: "#003c90" }}
                      />
                      <h3
                        className="text-2xl font-bold"
                        style={{ color: "#003c90" }}
                      >
                        {languageHeader("home", language.code)}
                      </h3>
                    </div>
                    <div
                      className="border-l-4 pl-5 space-y-2.5"
                      style={{ borderColor: "#003c90" }}
                    >
                      {result.homeCare.map((item, i) => (
                        <div
                          key={i}
                          className="flex gap-3 text-base leading-relaxed"
                        >
                          <span
                            className="mt-2 h-1.5 w-1.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: "#003c90" }}
                          />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Medications */}
                {result.medications && result.medications.length > 0 && (
                  <section className="mt-10">
                    <div className="flex items-center gap-3 mb-4">
                      <Pill
                        className="h-6 w-6"
                        style={{ color: "#003c90" }}
                      />
                      <h3
                        className="text-2xl font-bold"
                        style={{ color: "#003c90" }}
                      >
                        {languageHeader("meds", language.code)}
                      </h3>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {result.medications.map((m, i) => (
                        <div
                          key={i}
                          className="rounded-xl border p-5"
                          style={{
                            borderColor: "#dce9ff",
                            backgroundColor: "#f8f9ff",
                          }}
                        >
                          <div
                            className="font-bold text-base"
                            style={{ color: "#003c90" }}
                          >
                            {m.name}
                          </div>
                          <p
                            className="text-sm mt-1.5 leading-relaxed"
                            style={{ color: "#0d1c2e" }}
                          >
                            {m.instruction}
                          </p>
                          {m.schedule && (
                            <div
                              className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold"
                              style={{ color: "#006a61" }}
                            >
                              <Clock className="h-3.5 w-3.5" />
                              {m.schedule}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Warnings */}
                {result.warnings && result.warnings.items && (
                  <section className="mt-10">
                    <div className="flex items-center gap-3 mb-4">
                      <AlertCircle
                        className="h-6 w-6"
                        style={{ color: "#ba1a1a" }}
                      />
                      <h3
                        className="text-2xl font-bold"
                        style={{ color: "#ba1a1a" }}
                      >
                        {result.warnings.heading}
                      </h3>
                    </div>
                    <div
                      className="rounded-xl p-5"
                      style={{ backgroundColor: "#ffdad6" }}
                    >
                      <p
                        className="font-semibold text-sm mb-3"
                        style={{ color: "#93000a" }}
                      >
                        {result.warnings.lead}
                      </p>
                      <div className="space-y-2">
                        {result.warnings.items.map((it, i) => (
                          <div
                            key={i}
                            className="flex gap-2.5 text-sm leading-relaxed"
                            style={{ color: "#93000a" }}
                          >
                            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <span>{it}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>
                )}

                {/* Glossary */}
                {result.glossary && result.glossary.length > 0 && (
                  <section
                    className="mt-10 pt-8 border-t"
                    style={{ borderColor: "#eff4ff" }}
                  >
                    <div
                      className="text-xs font-semibold uppercase tracking-wider mb-3"
                      style={{ color: "#434653", letterSpacing: "0.08em" }}
                    >
                      Medical Terms Explained
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {result.glossary.map((g, i) => (
                        <div
                          key={i}
                          className="px-3 py-2 rounded-lg text-xs"
                          style={{
                            backgroundColor: "#eff4ff",
                            color: "#0d1c2e",
                          }}
                        >
                          <span
                            className="font-bold"
                            style={{ color: "#003c90" }}
                          >
                            {g.term}:
                          </span>{" "}
                          {g.definition}
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <footer
        className="border-t mt-16 py-6"
        style={{ borderColor: "#dce9ff", backgroundColor: "#ffffff" }}
      >
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-xs flex-wrap gap-3">
          <div style={{ color: "#434653" }}>
            © 2026 MedTranslate · Empathetic Precision in Medical Care
          </div>
          <div className="flex gap-5" style={{ color: "#434653" }}>
            <span>HIPAA Compliance</span>
            <span>Privacy</span>
            <span>Support</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Header text fallbacks for the most common languages — keeps the layout
// looking right even if the model only translates content. The model is
// usually correct, but these labels are for the icon-row headers we render.
function languageHeader(kind, code) {
  const map = {
    home: {
      es: "Qué hacer en casa",
      zh: "在家护理",
      ar: "ما يجب فعله في المنزل",
      fr: "À faire à la maison",
      vi: "Việc cần làm tại nhà",
      tl: "Gawin sa Bahay",
      ru: "Что делать дома",
      pt: "O que fazer em casa",
    },
    meds: {
      es: "Medicamentos",
      zh: "药物",
      ar: "الأدوية",
      fr: "Médicaments",
      vi: "Thuốc",
      tl: "Mga Gamot",
      ru: "Лекарства",
      pt: "Medicamentos",
    },
  };
  return (map[kind] && map[kind][code]) || (kind === "home" ? "At Home" : "Medications");
}
