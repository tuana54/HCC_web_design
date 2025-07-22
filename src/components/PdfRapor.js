// src/components/PdfRapor.js (GÜNCEL VERSİYON - API ve InputPage.js ile tam uyumlu, yapı korundu)
import React from "react";
import "./PdfRapor.css"; // CSS dosyasını içe aktarın
import logo from "../assets/HCCentinel.png"; // Logo yolunuzu doğrulayın
import { useLocation } from "react-router-dom";

const PdfRapor = () => { // Component adını PdfRapor olarak değiştirdim (App.js ile uyumlu olması için)
  const location = useLocation();
  // TahminSonuc'tan gelen verileri alıyoruz
  // navigate ile aktarılan state objesi: { hastaAdiSoyadi, apiResult, patientDetails, doktorYorumu }
  const { hastaAdiSoyadi, apiResult, patientDetails, doktorYorumu } = location.state || {};

  // Gelen verilerin doğruluğunu kontrol edelim
  if (!patientDetails || !apiResult || !hastaAdiSoyadi) {
    return (
      <div className="pdf-container">
        <h2 className="rapor-baslik">Rapor Görüntülenemiyor</h2>
        <p>Gerekli hasta veya değerlendirme bilgileri eksik.</p>
        {/* PDF sayfasında direkt anasayfaya yönlendirmek yerine yazdırma butonu bırakalım
            veya bu sayfayı direkt açanlar için bir uyarı verelim */}
        <button onClick={() => window.location.href = "/"} className="pdf-button" style={{marginTop: "20px"}}>Ana Sayfaya Dön</button>
      </div>
    );
  }

  // API yanıtından ilgili bilgileri çıkaralım
  const overallRisk = apiResult?.overall_risk_level || "Belirlenemedi";
  const finalRecommendation = apiResult?.final_recommendation || "Detaylı öneri bulunamadı.";
  const detailedSummary = apiResult?.detailed_report_summary || ["Yapay zeka değerlendirmesi bekleniyor."];

  // patientDetails'ten gelen Lab testlerini ve diğer hasta bilgilerini doğru anahtar isimleriyle al
  // InputPage.js'deki form state'iyle aynı isimleri kullanıyoruz.
  const getOrDefault = (value, unit = "") => {
    return (value !== undefined && value !== null && value !== "") ? `${value} ${unit}` : "Belirtilmemiş";
  };

  // Genel Risk için renk sınıfı (CSS ile uyumlu hale getirildi)
  let riskClass = "risk-rapor";
  if (overallRisk.includes("Düşük Risk")) riskClass += " düşük-risk"; // API'den gelen stringi kontrol et
  else if (overallRisk.includes("Orta Risk")) riskClass += " orta-risk";
  else if (overallRisk.includes("Yüksek Risk")) riskClass += " yüksek-risk";

  return (
    <div className="pdf-container">
      <div className="pdf-header">
        <img src={logo} alt="HCCentinel Logo" className="logo" />
        <h2>KARACİĞER HASTALIĞI RİSK DEĞERLENDİRME RAPORU</h2>
      </div>

      {/* Genel HCC Risk Seviyesi */}
      <div className="pdf-section">
        <h3>Genel HCC Risk Seviyesi</h3>
        <p>
          <strong>Değerlendirme:</strong>{" "}
          <span className={riskClass}>{overallRisk.replace(/ \(.*\)/, '')}</span> {/* Parantez içini kaldır */}
        </p>
        <p className="risk-not-pdf">
          Not: Bu risk seviyesi girilen tüm klinik, laboratuvar ve görüntüleme bulgularına göre yapay zeka tarafından hesaplanmıştır.
        </p>
      </div>

      <div className="pdf-section">
        <h3>1. Hasta Bilgileri</h3>
        <p><strong>Ad Soyad:</strong> {patientDetails?.name} {patientDetails?.surname}</p>
        <p><strong>Yaş:</strong> {getOrDefault(patientDetails?.Yas)}</p> {/* 'Yas' olarak güncellendi */}
        <p><strong>Cinsiyet:</strong> {patientDetails?.gender || "Belirtilmemiş"}</p>
        <p><strong>Alkol Tüketimi:</strong> {patientDetails?.alcohol || "Belirtilmemiş"}</p>
        <p><strong>Sigara Kullanımı:</strong> {patientDetails?.smoking || "Belirtilmemiş"}</p>
        <p><strong>HCV (Hepatit C):</strong> {patientDetails?.hcv || "Belirtilmemiş"}</p> {/* Yeni eklenen */}
        <p><strong>HBV (Hepatit B):</strong> {patientDetails?.hbv || "Belirtilmemiş"}</p> {/* Yeni eklenen */}
        <p><strong>Ailede Kanser Öyküsü:</strong> {patientDetails?.cancer_history || "Belirtilmemiş"}</p> {/* Yeni eklenen */}
      </div>

      <div className="pdf-section">
        <h3>2. Laboratuvar Sonuçları</h3>
        <p><strong>AFP:</strong> {getOrDefault(patientDetails?.afp, "ng/mL")}</p>
        <p><strong>ALT:</strong> {getOrDefault(patientDetails?.ALT, "U/L")}</p> {/* InputPage'den gelen 'ALT' */}
        <p><strong>AST:</strong> {getOrDefault(patientDetails?.AST, "U/L")}</p> {/* InputPage'den gelen 'AST' */}
        <p><strong>ALP (Alkaline Phosphotase):</strong> {getOrDefault(patientDetails?.ALP, "U/L")}</p> {/* InputPage'den gelen 'ALP' */}
        <p><strong>GGT:</strong> {getOrDefault(patientDetails?.GGT, "U/L")}</p> {/* InputPage'den gelen 'GGT' */}
        <p><strong>BIL (Total Bilirubin):</strong> {getOrDefault(patientDetails?.BIL, "mg/dL")}</p> {/* InputPage'den gelen 'BIL' */}
        {/* Direct Bilirubin ve Total Proteins: patientDetails'ten alınıyor. */}
        <p><strong>Direct Bilirubin:</strong> {getOrDefault(patientDetails?.direct_bilirubin, "mg/dL")}</p>
        <p><strong>Total Proteins:</strong> {getOrDefault(patientDetails?.total_protiens, "g/dL")}</p>
        <p><strong>Albumin:</strong> {getOrDefault(patientDetails?.Albumin, "g/dL")}</p>
        <p><strong>Alb/Glob Oranı:</strong> {getOrDefault(patientDetails?.Albumin_and_Globulin_Ratio)}</p>
      </div>

      {/* Görüntü Yükleme Durumu ve Önizleme */}
      {(patientDetails?.ultrasonFileUploaded || patientDetails?.btFileUploaded) && (
        <div className="pdf-section">
          <h3>3. Yüklenen Görüntüler ve Analiz Durumu</h3>
          {patientDetails?.ultrasonFileUploaded && patientDetails?.ultrasonImageUrl && (
            <div className="image-preview-item">
              <p><strong>Ultrason Görüntüsü:</strong> Yüklendi</p>
              {patientDetails.ultrasonImageUrl.startsWith("blob:") ? (
                <img src={patientDetails.ultrasonImageUrl} alt="Ultrason Önizleme" className="rapor-gorsel" />
              ) : (
                <p className="rapor-gorsel-text">Dosya Adı: {patientDetails.ultrasonImageUrl}</p> // 3D dosya ise adı
              )}
            </div>
          )}
          {patientDetails?.btFileUploaded && patientDetails?.btImageUrl && (
            <div className="image-preview-item">
              <p><strong>MR Görüntüsü:</strong> Yüklendi</p>
              {patientDetails.btImageUrl.startsWith("blob:") ? (
                <img src={patientDetails.btImageUrl} alt="MR Önizleme" className="rapor-gorsel" />
              ) : (
                <p className="rapor-gorsel-text">Dosya Adı: {patientDetails.btImageUrl}</p> // 3D dosya ise adı
              )}
            </div>
          )}
        </div>
      )}

      <div className="pdf-section">
        <h3>4. Yapay Zekâ (AI) Değerlendirmesi</h3>
        <div className="pdf-box pdf-llm-box">
          {detailedSummary.length > 0 ? (
            detailedSummary.map((item, index) => (
              <p key={index}>{item}</p>
            ))
          ) : (
            <p>[Yapay zeka değerlendirmesi henüz alınmadı.]</p>
          )}
        </div>
      </div>

      <div className="pdf-section">
        <h3>5. Uzman Önerisi</h3>
        <div className="pdf-box pdf-final-öneri-box">
          <p>{finalRecommendation}</p>
        </div>
      </div>

      <div className="pdf-section doktor-yorum-bolumu">
        <h3>6. Doktor Geri Bildirimi</h3>
        <div className="pdf-box">
          <p>{doktorYorumu || "[Doktor tarafından herhangi bir değerlendirme girilmedi.]"}</p>
        </div>
        <p className="imza-alani"><strong>Hekim Adı Soyadı:</strong> ....................................................</p>
        <p className="imza-alani"><strong>İmza:</strong> ....................................................</p>
        <p className="imza-alani"><strong>Tarih:</strong> {new Date().toLocaleDateString()}</p>
      </div>

      <div className="pdf-footer">
        <button onClick={() => window.print()} className="print-button">
          PDF Olarak Yazdır
        </button>
      </div>
    </div>
  );
};

export default PdfRapor; // PdfRaporYeni yerine PdfRapor