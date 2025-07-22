// src/components/TahminSonuc.js (YENİ VERSİYON - API Çıktılarına Tam Uygun, Yapı Korundu)
import React, { useState } from "react"; // useState artık kullanılıyor (doktorYorumu için)
import "./TahminSonuc.css"; // CSS dosyasını içe aktarın
import { useLocation, useNavigate } from "react-router-dom";
import {FaUserMd, FaRobot, FaStethoscope, FaFlask, FaLaptopMedical, FaImage } from "react-icons/fa";
import { FaArrowLeft , FaArrowRight} from "react-icons/fa";
const TahminSonuc = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [doktorYorumu, setDoktorYorumu] = useState(""); // React.useState yerine useState kullandık
  
  const { hastaAdiSoyadi, apiResult, patientDetails } = location.state || {};
const [selectedDoctor, setSelectedDoctor] = useState("");
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
<div className="doktor-secim-alani">
<label htmlFor="doktorSecimi"></label>
<select
id="doktorSecimi"
className="doktor-select"
value={selectedDoctor}
onChange={(e) => setSelectedDoctor(e.target.value)}
>
<option value="">-- Doktor Seçin --</option>
<option value="Dr. Ayşe">Dr. Ayşe</option>
<option value="Dr. Can">Dr. Can</option>
<option value="Dr. Elif">Dr. Elif</option>
<option value="Dr. Murat">Dr. Murat</option>
<option value="Dr. Zeynep">Dr. Zeynep</option>
</select>
</div>
</div>


      {/* Görüntü Analizi Alanları (USG ve MRI) */}
      <div className="image-analysis-section">
        {patientDetails?.ultrasonFileUploaded && ( // USG dosyası yüklendiyse göster
          <div className="kart image-kart">
            <FaImage className="ikon" />
            <div>
              <h3>Ultrason Görüntüsü Analizi</h3>
              {patientDetails.ultrasonImageUrl ? (
                 // 2D görüntü ise önizleme (blob: ile başlıyorsa), 3D ise dosya adını göster
                patientDetails.ultrasonImageUrl.startsWith("blob:") ? (
                  <img src={patientDetails.ultrasonImageUrl} alt="Ultrason Görüntüsü Önizlemesi" className="loaded-image-preview" />
                ) : (
                  <p>Yüklü Dosya: {patientDetails.ultrasonImageUrl}</p> // 3D dosya adı
                )
              ) : (
                <p className="usg-aciklama">USG görüntüsü önizlemesi yüklenemedi.</p>
              )}
            </div>
          </div>
        )}

        {patientDetails?.btFileUploaded && ( // MR (BT) dosyası yüklendiyse göster
          <div className="kart image-kart">
            <FaLaptopMedical className="ikon" /> {/* MR için LaptopMedical ikonu */}
            <div>
              <h3>MR Görüntüsü Analizi</h3>
              {patientDetails.btImageUrl ? (
                patientDetails.btImageUrl.startsWith("blob:") ? (
                  <img src={patientDetails.btImageUrl} alt="MR Görüntüsü Önizlemesi" className="loaded-image-preview" />
                ) : (
                  <p>Yüklü Dosya: {patientDetails.btImageUrl}</p> // 3D dosya adı
                )
              ) : (
                <p className="mri-aciklama">MR görüntüsü önizlemesi yüklenemedi.</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Doktor Geri Bildirim Alanı */}
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

      {/* Butonlar Alanı */}
      <div className="button-container">
        <button
          className="calculate-btn" // PDF Raporu Oluştur butonu, ana buton stilini kullanıyor
          onClick={() =>
            navigate("/pdfrapor", {
              state: {
                hastaAdiSoyadi: hastaAdiSoyadi,
                apiResult: apiResult,
                patientDetails: patientDetails,
                doktorYorumu: doktorYorumu, // Doktor yorumu burdan aktarılıyor
              },
            })
          }
        >
          PDF Raporu Oluştur
        </button>
      </div>

    </div>
  );
};

export default TahminSonuc;