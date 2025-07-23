import React from "react";
import "./LLMRaporu.css";
import { useLocation } from "react-router-dom";

const LLMRaporu = () => {
  const location = useLocation();
  const { doctor, rapor } = location.state || {};

  return (
    <div className="rapor-container">
      <h2 className="rapor-baslik">Yapay Zekâ Değerlendirme Raporu</h2>

      <section className="rapor-bolum">
        <h3>Seçilen Model</h3>
        <p><strong>Doktor:</strong> {doctor}</p>
      </section>

      <section className="rapor-bolum">
        <h3>Model Raporu</h3>
        <p>{rapor}</p>
      </section>
    </div>
  );
};

export default LLMRaporu;
