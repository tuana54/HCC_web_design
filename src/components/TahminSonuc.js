import { useState } from "react";
import { FaArrowLeft, FaArrowRight, FaImage, FaLaptopMedical, FaRobot, FaUserMd } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import LLMModelComparison from "./LLMModelComparison";
import "./TahminSonuc.css";

const TahminSonuc = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [doktorYorumu, setDoktorYorumu] = useState("");

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

  let riskBoxClass = "risk-kutusu";
  if (overallRisk.includes("Düşük Risk")) riskBoxClass += " risk-dusuk";
  else if (overallRisk.includes("Orta Risk")) riskBoxClass += " risk-orta";
  else if (overallRisk.includes("Yüksek Risk")) riskBoxClass += " risk-yuksek";

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

      <div className="kart hasta-kart">
        <h3><FaUserMd className="ikon-kucuk" /> Hasta Bilgisi</h3>
        <p><strong>Ad:</strong> {patientDetails?.name || "-"}</p>
        <p><strong>Soyad:</strong> {patientDetails?.surname || "-"}</p>
        <p><strong>Yaş:</strong> {patientDetails?.age || "-"}</p>
        <p><strong>Cinsiyet:</strong> {patientDetails?.gender || "-"}</p>
      </div>

      <div className="kart risk-kart">
        <h3 className="kart-baslik">Genel HCC Risk Seviyesi</h3>
        <div className="risk-icerik">
          <span className={riskBoxClass}>{overallRisk.replace(/ \(.*\)/, '')}</span>
          <p className="risk-not">
            Not: Bu risk seviyesi yaş, cinsiyet, AFP, ALT, AST gibi klinik ve laboratuvar parametreleri ile görüntüleme bulgularına göre hesaplanmıştır.
          </p>
        </div>
      </div>

      <div className="llm-kart">
        <div className="llm-header">
          <h3><FaRobot /> Yapay Zekâ Değerlendirmesi</h3>
        </div>
        {/* GÜNCELLEME: Gerekli veriler LLMModelComparison bileşenine aktarılıyor */}
        <LLMModelComparison 
            patientDetails={patientDetails} 
            apiResult={apiResult} 
        />
      </div>

      {/* Görüntü Analizi Alanları */}
      <div className="image-analysis-section">
        {patientDetails?.ultrasonFileUploaded && (
          <div className="kart image-kart">
            <FaImage className="ikon" />
            <div>
              <h3>Ultrason Görüntüsü Analizi</h3>
              {patientDetails.ultrasonImageUrl ? (
                patientDetails.ultrasonImageUrl.startsWith("blob:") ? (
                  <img src={patientDetails.ultrasonImageUrl} alt="Ultrason Görüntüsü Önizlemesi" className="loaded-image-preview" />
                ) : (
                  <p>Yüklü Dosya: {patientDetails.ultrasonImageUrl}</p>
                )
              ) : (
                <p className="usg-aciklama">USG görüntüsü önizlemesi yüklenemedi.</p>
              )}
            </div>
          </div>
        )}

        {patientDetails?.btFileUploaded && (
          <div className="kart image-kart">
            <FaLaptopMedical className="ikon" />
            <div>
              <h3>MR Görüntüsü Analizi</h3>
              {patientDetails.btImageUrl ? (
                patientDetails.btImageUrl.startsWith("blob:") ? (
                  <img src={patientDetails.btImageUrl} alt="MR Görüntüsü Önizlemesi" className="loaded-image-preview" />
                ) : (
                  <p>Yüklü Dosya: {patientDetails.btImageUrl}</p>
                )
              ) : (
                <p className="mri-aciklama">MR görüntüsü önizlemesi yüklenemedi.</p>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="kart">
        <h3><FaUserMd /> Doktor Geri Bildirimi</h3>
        <textarea
          className="doktor-textarea"
          rows={4}
          placeholder="Doktor yorumunu buraya yazabilir..."
          value={doktorYorumu}
          onChange={(e) => setDoktorYorumu(e.target.value)}
        ></textarea>
      </div>
    </div>
  );
};

export default TahminSonuc;
