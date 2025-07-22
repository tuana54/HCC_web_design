// src/components/LLMRaporu.js
import React from "react";
import "./LLMRaporu.css";

const LLMRaporu = ({ hastaVerileri, llmYanit, finalRecommendation }) => {
  const {
    ad,
    soyad,
    yas,
    cinsiyet,
    alt,
    ast,
    afp,
    ggt,
    alp,
    totalBilirubin,
    directBilirubin,
    albumin,
    totalProtein,
    hcv,
    hbv,
    aileOykusu,
    riskYuzdesi,
    riskSeviyesi,
    uploadedImage
  } = hastaVerileri;

  return (
    <div className="rapor-container">
      <h2 className="rapor-baslik">Yapay Zeka Destekli Karaciğer Değerlendirme Raporu</h2>

      <section className="rapor-bolum">
        <h3>Hasta Bilgileri</h3>
        <p><strong>Ad Soyad:</strong> {ad} {soyad}</p>
        <p><strong>Yaş:</strong> {yas}</p>
        <p><strong>Cinsiyet:</strong> {cinsiyet}</p>
        <p><strong>HCV:</strong> {hcv}</p>
        <p><strong>HBV:</strong> {hbv}</p>
        <p><strong>Ailede Kanser Öyküsü:</strong> {aileOykusu}</p>
      </section>

      <section className="rapor-bolum">
        <h3>Laboratuvar Sonuçları</h3>
        <p><strong>ALT:</strong> {alt}</p>
        <p><strong>AST:</strong> {ast}</p>
        <p><strong>ALP:</strong> {alp}</p>
        <p><strong>AFP:</strong> {afp}</p>
        <p><strong>GGT:</strong> {ggt}</p>
        <p><strong>Total Bilirubin:</strong> {totalBilirubin}</p>
        <p><strong>Direct Bilirubin:</strong> {directBilirubin}</p>
        <p><strong>Albumin:</strong> {albumin}</p>
        <p><strong>Total Protein:</strong> {totalProtein}</p>
      </section>

      <section className="rapor-bolum">
        <h3>Yapay Zeka Analizi</h3>
        <p><strong>Risk Yüzdesi:</strong> %{riskYuzdesi}</p>
        <p><strong>Risk Seviyesi:</strong> {riskSeviyesi}</p>
        <div className="llm-yanit">
          <h4>Model Değerlendirmesi:</h4>
          <p>{llmYanit}</p>
        </div>
        <div className="final-oneri">
          <h4>Uzman Önerisi:</h4>
          <p>{finalRecommendation}</p>
        </div>
      </section>

      {uploadedImage && (
        <section className="rapor-bolum">
          <h3>Yüklenen Görüntü (USG/MR)</h3>
          <img src={uploadedImage} alt="Yüklenen Görüntü" className="rapor-gorsel" />
        </section>
      )}
    </div>
  );
};

export default LLMRaporu;
