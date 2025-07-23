// src/components/TahminSonuc.js (YENİ VERSİYON - API Çıktılarına Tam Uygun, Yapı Korundu)
import React, { useState, useEffect } from "react";
import "./TahminSonuc.css";
import { useLocation, useNavigate } from "react-router-dom";
import { FaUserMd, FaRobot, FaStethoscope, FaFlask, FaLaptopMedical, FaImage, FaPaperPlane, FaArrowLeft, FaArrowRight } from "react-icons/fa";
import LLMModelComparison from "./LLMModelComparison";

const TahminSonuc = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [doktorYorumu, setDoktorYorumu] = useState(""); 
  const [doctorSummary, setDoctorSummary] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const { hastaAdiSoyadi, apiResult, patientDetails } = location.state || {};


  if (!apiResult || !hastaAdiSoyadi) {
    return (
      <div className="tahmin-container">
        <h2 className="baslik">Sonuç Bulunamadı</h2>
        <p>Lütfen tahmin yapmak için ana sayfaya geri dönün.</p>
        <button className="calculate-btn" onClick={() => navigate("/")} style={{ marginTop: "20px" }}>Ana Sayfaya Dön</button>
      </div>
    );
  }

  const overallRisk = apiResult?.overall_risk_level || "Belirlenemedi";
  const mriRecommendation = apiResult?.mri_recommendation || false;
  const finalRecommendation = apiResult?.final_recommendation || "Detaylı öneri bulunamadı.";
  const detailedSummary = apiResult?.detailed_report_summary || ["Yapay zeka değerlendirmesi bekleniyor."];

  // API'den gelen detailedSummary bir dizi olduğu için, her bir maddeyi ayrı bir paragraf olarak render ediyoruz.
  const llmYanitElements = detailedSummary.map((item, index) => (
    <p key={index} className="llm-yanit">{item}</p>
  ));

  // Risk kutusunun arka plan rengini belirleme (CSS sınıfları TahminSonuc.css'de tanımlı)
  let riskBoxClass = "risk-kutusu";
  if (overallRisk.includes("Düşük Risk")) riskBoxClass += " risk-dusuk"; // Stringin tamamı yerine 'includes'
  else if (overallRisk.includes("Orta Risk")) riskBoxClass += " risk-orta";
  else if (overallRisk.includes("Yüksek Risk")) riskBoxClass += " risk-yuksek";

  // Lab değerleri için yardımcı fonksiyon (varsayılan değer ve birim ekler)
  const getOrDefault = (value, unit = "") => {
    return (value !== undefined && value !== null && value !== "") ? `${value} ${unit}` : "Belirtilmemiş";
  };

  return (
    <div className="tahmin-container" id="tahmin-container">
      <div className="nav-buttons-inside">
        <button className="nav-btn" onClick={() => navigate(-1)}>
          <FaArrowLeft className="nav-icon" />
        </button>
        <button className="nav-btn" onClick={() => navigate(+1)}>
          <FaArrowRight className="nav-icon" />
        </button>
      </div>

      <h2 className="baslik">AI Destekli Değerlendirme Sonucu</h2>

      {/* Hasta Bilgisi */}
      <div className="kart hasta-kart">
        <h3><FaUserMd className="ikon-kucuk" /> Hasta Bilgisi</h3>
        <p><strong>Ad:</strong> {patientDetails?.name || "-"}</p>
        <p><strong>Soyad:</strong> {patientDetails?.surname || "-"}</p>
        <p><strong>Yaş:</strong> {patientDetails?.age || "-"}</p>
        <p><strong>Cinsiyet:</strong> {patientDetails?.gender || "-"}</p>
      </div>

      {/* GENEL HCC RİSK SEVİYESİ */}
      <div className="kart risk-kart">
        <h3 className="kart-baslik">Genel HCC Risk Seviyesi</h3>
        <div className="risk-icerik">
          <span className={riskBoxClass}>{overallRisk.replace(/ \(.*\)/, '')}</span> {/* Açıklamayı kaldır */}
          <p className="risk-not">
            Not: Bu risk seviyesi yaş, cinsiyet, AFP, ALT, AST gibi klinik ve laboratuvar parametreleri ile görüntüleme bulgularına göre hesaplanmıştır.
          </p>
        </div>
      </div>

      {/* Yapay Zekâ Modelinin Detaylı Değerlendirmesi */}
      <div className="llm-kart">
        <div className="llm-header">
          <h3><FaRobot /> Yapay Zekâ Değerlendirmesi</h3>
        </div>
        <LLMModelComparison />
      </div>

  <div className="kart usg-goruntu-kart">
  <h3>
    <i className="fas fa-image ikon"></i> USG Görüntü Analizi
  </h3>

  <div className="usg-icerik-grid">
    {/* Sol: Görüntü kutusu */}
    <div className="usg-goruntu-alani">
      {patientDetails?.ultrasonImageUrl && patientDetails.ultrasonImageUrl.startsWith("blob:") ? (
        <img
          src={patientDetails.ultrasonImageUrl}
          alt="USG Görüntüsü"
          className="usg-image-preview"
        />
      ) : (
        <div className="usg-image-placeholder">
          Görüntü burada görüntülenecek (placeholder)
        </div>
      )}
    </div>

    {/* Sağ: VLM Yorum */}
    <div className="vlm-yorum-alani">
      {apiResult?.vlm_yanit ? (
        <p>{apiResult.vlm_yanit}</p>
      ) : (
        <p className="usg-placeholder">USG analizi henüz sağlanmadı.</p>
      )}
    </div>
  </div>
</div>





      {/* Doktor Geri Bildirim Alanı */}
      <div className="kart doktor-yorum-kapsayici">
        <h3><FaUserMd /> Doktor Geri Bildirimi</h3>
        <div className="doktor-yorum-wrapper">
          <textarea 
            className="doktor-textarea"
            placeholder="Doktor yorumunu buraya yazabilir..."
            value={doktorYorumu}
            onChange={(e) => setDoktorYorumu(e.target.value)}
          />
          <button
            className="ikon-gonder-btn"
            onClick={() => alert("Yorumladığınız için teşekkür ederiz.")}
          >
            <FaPaperPlane />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TahminSonuc;
