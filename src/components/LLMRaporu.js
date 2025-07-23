import { useEffect, useState } from 'react';
import './LLMRaporu.css'; // Kendi CSS dosyasını kullanacak

const LLMRaporu = () => {
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // Veriyi yeni sekmede alabilmek için sessionStorage'dan okuyoruz.
    try {
      const data = sessionStorage.getItem('reportDataForLlm');
      if (data) {
        setReportData(JSON.parse(data));
      } else {
        setError('Rapor verisi bulunamadı. Lütfen önceki sayfadan tekrar deneyin.');
      }
    } catch (err) {
      setError('Rapor verisi okunurken bir hata oluştu.');
      console.error(err);
    }
  }, []);

  if (error) {
    return <div className="llm-rapor-container error">{error}</div>;
  }

  if (!reportData) {
    return <div className="llm-rapor-container">Rapor verisi yükleniyor...</div>;
  }

  const { patientDetails, apiResult } = reportData;
  const llmYanitlari = apiResult?.detailed_report_summary || [];

  return (
    <div className="llm-rapor-container">
        <div className="rapor-header">
          <h1>Rapor Başlığı</h1>
        </div>
        <div className="rapor-body">
          {/* Hasta bilgilerinin gösterildiği alan */}
          <div className="hasta-bilgileri">
            <div className="info-item">
              <strong>Hasta Adı Soyadı:</strong>
              <span>{patientDetails?.name || '-'} {patientDetails?.surname || ''}</span>
            </div>
            <div className="info-row">
              <div className="info-item">
                <strong>Yaş:</strong>
                <span>{patientDetails?.age || '-'}</span>
              </div>
              <div className="info-item">
                <strong>Cinsiyet:</strong>
                <span>{patientDetails?.gender || '-'}</span>
              </div>
            </div>
            <div className="info-item">
              <strong>Risk:</strong>
              <span>{apiResult?.overall_risk_level || 'Belirlenemedi'}</span>
            </div>
          </div>

          {/* LLM'den gelen sonuçların listelendiği alan */}
          <div className="llm-sonuclari">
            {llmYanitlari.length > 0 ? (
              llmYanitlari.map((yanit, index) => (
                <div key={index} className="llm-kutu">
                  <p>{yanit}</p>
                </div>
              ))
            ) : (
              Array.from({ length: 3 }).map((_, index) => (
                <div key={`empty-${index}`} className="llm-kutu empty">
                  <p>LLM'den gelecek</p>
                </div>
              ))
            )}
          </div>
        </div>
    </div>
  );
};

export default LLMRaporu;