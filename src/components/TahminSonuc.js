import React, { useState, useEffect } from "react";
import "./TahminSonuc.css";
import { useLocation, useNavigate } from "react-router-dom";
import { FaUserMd, FaRobot, FaImage, FaPaperPlane, FaArrowLeft, FaArrowRight, FaUserPlus } from "react-icons/fa";
import LLMModelComparison from "./LLMModelComparison";

const TahminSonuc = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [doktorYorumu, setDoktorYorumu] = useState("");

  const { hastaAdiSoyadi, apiResult, patientDetails, vlmReport } = location.state || {};

  const handleYeniHasta = () => {
  localStorage.removeItem("hastaFormData");  // eski formu sil
  navigate("/input");  // doğrudan input sayfasına git
};


  useEffect(() => {
    console.log("VLM Report (ilk 100 karakter):", vlmReport?.substring(0, 100) || "Yok");
  }, [vlmReport]);

  if (!apiResult || !hastaAdiSoyadi) {
    return (
      <div className="tahmin-container">
        <h2 className="baslik">Sonuç Bulunamadı</h2>
        <p>Lütfen tahmin yapmak için ana sayfaya geri dönün.</p>
        <button className="calculate-btn" onClick={() => navigate("/")}>
          Ana Sayfaya Dön
        </button>
      </div>
    );
  }

  const overallRisk = apiResult?.overall_risk_level || "Belirlenemedi";
  const detailedSummary = apiResult?.detailed_report_summary || ["Yapay zeka değerlendirmesi bekleniyor."];

  const llmYanitElements = detailedSummary.map((item, index) => (
    <p key={index} className="llm-yanit">{item}</p>
  ));

  let riskBoxClass = "risk-kutusu";
  if (overallRisk.includes("Düşük Risk")) riskBoxClass += " risk-dusuk";
  else if (overallRisk.includes("Orta Risk")) riskBoxClass += " risk-orta";
  else if (overallRisk.includes("Yüksek Risk")) riskBoxClass += " risk-yuksek";

  const veriListesi = [];
  if (patientDetails.age) veriListesi.push("yaş");
  if (patientDetails.gender) veriListesi.push("cinsiyet");
  if (patientDetails.afp) veriListesi.push("AFP");
  if (patientDetails.ALT) veriListesi.push("ALT");
  if (patientDetails.AST) veriListesi.push("AST");
  if (patientDetails.ALP) veriListesi.push("ALP");
  if (patientDetails.BIL) veriListesi.push("Bilirubin");
  if (patientDetails.GGT) veriListesi.push("GGT");
  if (patientDetails.Albumin) veriListesi.push("Albumin");
  if (patientDetails.ultrasonFileUploaded) veriListesi.push("Ultrason görüntüsü");
  if (patientDetails.btFileUploaded) veriListesi.push("MR görüntüsü");

  const son = veriListesi.pop();
  const riskNotu = son
    ? `Not: Bu risk seviyesi ${veriListesi.length > 0 ? veriListesi.join(", ") + " ve " : ""}${son} verilerine göre hesaplanmıştır.`
    : "Not: Risk hesaplaması için yeterli veri sağlanmamıştır.";

  return (
    <div className="tahmin-container" id="tahmin-container">
      
      {/* Yeni Hasta Butonu */}
      <button className="yeni-hasta-buton" onClick={handleYeniHasta}>
        <FaUserPlus className="yeni-hasta-ikon" />
        <span className="yeni-hasta-tooltip">Yeni Hasta Ekle</span>
      </button>

      {/* Navigasyon Butonları */}
      <div className="nav-buttons-inside">
  <button className="nav-btn" onClick={() => navigate("/input")}>
    <FaArrowLeft className="nav-icon" />
  </button>
  <button className="nav-btn" onClick={() => navigate("/")}>
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

      {/* Risk Seviyesi */}
      <div className="kart risk-kart">
        <h3 className="kart-baslik">Genel HCC Risk Seviyesi</h3>
        <div className="risk-icerik">
          <span className={riskBoxClass}>{overallRisk.replace(/ \(.*\)/, '')}</span>
          <p className="risk-not">{riskNotu}</p>
        </div>
      </div>

      {/* LLM Model Değerlendirmesi */}
      <div className="llm-kart">
        <div className="llm-header">
          <h3><FaRobot /> Yapay Zekâ Değerlendirmesi</h3>
        </div>
        <LLMModelComparison 
          patientDetails={patientDetails} 
          apiResult={apiResult} 
        />
      </div>

      {/* Görüntü + VLM Analizi */}
      <div className="kart usg-goruntu-kart">
        <h3><FaImage className="ikon" /> Görüntü Analizi (VLM Destekli)</h3>
        <div className="usg-icerik-grid">
          <div className="usg-goruntu-alani">
            {patientDetails?.ultrasonImageUrl?.startsWith("blob:") ? (
              <img src={patientDetails.ultrasonImageUrl} alt="USG Görüntüsü" className="usg-image-preview" />
            ) : patientDetails?.btImageUrl?.startsWith("blob:") ? (
              <img src={patientDetails.btImageUrl} alt="BT Görüntüsü" className="usg-image-preview" />
            ) : (
              <div className="usg-image-placeholder">Görüntü yüklenmedi.</div>
            )}
          </div>
          <div className="vlm-yorum-alani">
            {vlmReport ? (
              <div
                className="vlm-report-content"
                dangerouslySetInnerHTML={{ __html: vlmReport }}
              />
            ) : (
              <p className="usg-placeholder">VLM raporu oluşturulmadı.</p>
            )}
          </div>
        </div>
      </div>

      {/* Doktor Geri Bildirim */}
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
