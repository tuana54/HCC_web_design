// src/components/LLMModelComparison.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./TahminSonuc.css";

const modelSummaries = {
  "Dr. Ayşe": "Görüntü analizine dayalı düşük risk tahmini sunar.",
  "Dr. Can": "Laboratuvar verilerine göre değerlendirme yapan modeldir.",
  "Dr. Elif": "Hibrit sistem: klinik + görüntüleme ile entegre analiz yapar.",
  "Dr. Murat": "Gelişmiş derin öğrenme modeli; çok yönlü analiz sağlar.",
  "Dr. Zeynep": "Uzun vadeli hasta takibine odaklı yapay zekâ modelidir.",
};

const modelReports = {
  "Dr. Ayşe": `Detaylı rapor: Görüntü tabanlı analizlerle model düşük risk göstermiştir...`,
  "Dr. Can": `Detaylı rapor: AFP, ALT, AST ve ALP düzeyleri değerlendirildi...`,
  "Dr. Elif": `Detaylı rapor: Hem laboratuvar hem de görüntüleme verileri entegre edilerek...`,
  "Dr. Murat": `Detaylı rapor: Modelimiz, derin sinir ağlarıyla öğrenim sağladı...`,
  "Dr. Zeynep": `Detaylı rapor: Bu model, geçmiş hasta verileriyle uzun vadeli takip analizi sunar...`,
};

const LLMModelComparison = () => {
  const [selectedModel, setSelectedModel] = useState("Dr. Ayşe");
  const navigate = useNavigate();

  const handleBoxClick = () => {
    if (selectedModel) {
      navigate("/llmrapor", {
        state: {
          doctor: selectedModel,
          rapor: modelReports[selectedModel],
        },
      });
    }
  };

  return (
    <div className="llm-yapay-kapsayici">
      <div className="llm-yatay-alan">
        {/* Dropdown */}
        <select
          className="doktor-select"
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
        >
          {Object.keys(modelSummaries).map((model) => (
            <option key={model} value={model}>
              {model}
            </option>
          ))}
        </select>

        {/* Özet kutusu */}
        <div className="doktor-ozet-kutu" onClick={handleBoxClick}>
          <strong>{selectedModel}:</strong> {modelSummaries[selectedModel]}
        </div>
      </div>
    </div>
  );
};

export default LLMModelComparison;
