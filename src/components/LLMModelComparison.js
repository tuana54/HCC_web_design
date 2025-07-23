import { useState } from "react";
import "./TahminSonuc.css";

const modelSummaries = {
  "Dr. Ayşe": "Görüntü analizine dayalı düşük risk tahmini sunar.",
  "Dr. Can": "Laboratuvar verilerine göre değerlendirme yapan modeldir.",
  "Dr. Elif": "Hibrit sistem: klinik + görüntüleme ile entegre analiz yapar.",
  "Dr. Murat": "Gelişmiş derin öğrenme modeli; çok yönlü analiz sağlar.",
  "Dr. Zeynep": "Uzun vadeli hasta takibine odaklı yapay zekâ modelidir.",
};

// Component'in artık (patientDetails, apiResult) props'larını aldığından emin olun
const LLMModelComparison = ({ patientDetails, apiResult }) => {
  const [selectedModel, setSelectedModel] = useState("Dr. Ayşe");

  const handleBoxClick = () => {
    // Verilerin gelip gelmediğini kontrol et
    if (!patientDetails || !apiResult) {
      alert("Rapor verisi bulunamadı. Lütfen sayfayı yenileyin.");
      return;
    }

    // Yeni sekmeye aktarılacak verileri hazırla
    const reportData = {
      patientDetails,
      apiResult,
      selectedDoctor: selectedModel,
      doctorSummary: modelSummaries[selectedModel],
    };

    // Veriyi tarayıcının oturum deposuna kaydet
    sessionStorage.setItem('reportDataForLlm', JSON.stringify(reportData));
    
    // Rapor sayfasını yeni bir sekmede aç
    window.open('/llmrapor', '_blank');
  };

  return (
    <div className="llm-yapay-kapsayici">
      <div className="llm-yatay-alan">
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

        <div className="doktor-ozet-kutu" onClick={handleBoxClick}>
          <strong>{selectedModel}:</strong> {modelSummaries[selectedModel]}
        </div>
      </div>
    </div>
  );
};

export default LLMModelComparison;
