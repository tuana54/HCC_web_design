import { useEffect, useState } from 'react';
import './LLMRaporu.css'; // Kendi CSS dosyasını kullanacak
import hccSentinelLogo from '../assets/HCCentinel.png'; // Logonuzu import ettik
import jsPDF from 'jspdf'; // jsPDF kütüphanesini import edin
import html2canvas from 'html2canvas'; // html2canvas kütüphanesini import edin

// Font Awesome ikonlarını import edin
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons'; // İndirme (aşağı ok) ikonunu import edin

const LLMRaporu = () => {
  const [reportData, setReportData] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState('bir model');
  const [reportDate, setReportDate] = useState(''); // Tarih state'i eklendi
  const [error, setError] = useState('');

  useEffect(() => {
    // Veriyi yeni sekmede alabilmek için sessionStorage'dan okuyoruz.
    try {
      const data = sessionStorage.getItem('reportDataForLlm');
      if (data) {
        const parsedData = JSON.parse(data);
        setReportData(parsedData);
        
        // selectedDoctor bilgisini parsedData içinden oku
        if (parsedData.selectedDoctor) {
          setSelectedDoctor(parsedData.selectedDoctor);
        }

      } else {
        setError('Rapor verisi bulunamadı. Lütfen önceki sayfadan tekrar deneyin.');
      }
    } catch (err) {
      setError('Rapor verisi okunurken bir hata oluştu.');
      console.error(err);
    }

    // Raporun oluşturulduğu tarihi GG.AA.YYYY formatında ayarla
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    const formattedDate = `${day}.${month}.${year}`;
    setReportDate(formattedDate);
  }, []); // Bağımlılık dizisi boş kalmalı, sadece bir kere yüklenmeli

  const handleDownloadPdf = () => {
    const input = document.getElementById('rapor-icerigi');
    if (!input) {
      console.error('PDF oluşturulacak div bulunamadı: #rapor-icerigi');
      alert('Rapor içeriği bulunamadığı için PDF oluşturulamadı.');
      return;
    }

    const downloadButton = document.querySelector('.download-pdf-button');
    if (downloadButton) downloadButton.style.display = 'none';

    html2canvas(input, {
      scale: 2,
      useCORS: true
    }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      const patientName = reportData?.patientDetails?.name || 'Hasta';
      const patientSurname = reportData?.patientDetails?.surname || 'Raporu';
      const fileName = `${patientName}_${patientSurname}_HCC_Tahmin_Raporu.pdf`;

      pdf.save(fileName);

      if (downloadButton) downloadButton.style.display = 'block';
    }).catch(error => {
      console.error("PDF oluşturulurken hata oluştu:", error);
      alert("PDF oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.");
      if (downloadButton) downloadButton.style.display = 'block';
    });
  };

  if (error) {
    return <div className="llm-rapor-container error">{error}</div>;
  }

  if (!reportData) {
    return <div className="llm-rapor-container">Rapor verisi yükleniyor...</div>;
  }

  const { patientDetails, apiResult } = reportData;
  const overallRiskLevel = apiResult?.overall_risk_level || 'Belirlenemedi';
  const isHighRisk = overallRiskLevel.toLowerCase().includes('yüksek');
  
  // DEĞİŞİKLİK: Bütünsel LLM raporunu buradan alıyoruz.
  const geminiReport = apiResult?.gemini_comprehensive_report;

  return (
    <div className="llm-rapor-container" id="rapor-icerigi">
      <button className="download-pdf-button" onClick={handleDownloadPdf} title="Belgeyi İndir">
        <FontAwesomeIcon icon={faDownload} />
      </button>

      <div className="rapor-header">
        <img src={hccSentinelLogo} alt="HCCentinel Logo" className="rapor-logo" />
        <h1>YAPAY ZEKA DESTEKLİ HCC TAHMİN RAPORU</h1>
        <div className="rapor-tarih">{reportDate}</div>
      </div>
      <div className="rapor-body">
        {/* Hasta bilgilerinin gösterildiği alan */}
        <div className="hasta-bilgileri">
          <div className="info-row-first">
            <div className="info-item">
              <strong>Hasta Adı Soyadı:</strong>
              <span>{patientDetails?.name || '-'} {patientDetails?.surname || ''}</span>
            </div>
            <div className="info-item">
              <strong>Risk:</strong>
              <span className={isHighRisk ? 'risk-kalin' : ''}>
                {overallRiskLevel}
              </span>
            </div>
          </div>
          <div className="info-item">
            <strong>Yaş:</strong>
            <span>{patientDetails?.age || '-'}</span>
          </div>
          <div className="info-item">
            <strong>Cinsiyet:</strong>
            <span>{patientDetails?.gender || '-'}</span>
          </div>
        </div>

        {/* DEĞİŞİKLİK: LLM'den gelen bütünsel raporun listelendiği alan */}
        <div className="llm-sonuclari">
            {geminiReport ? (
                // Gelen rapor metnini satır satır bölüp ekrana yazdırıyoruz
                geminiReport.split("\n").map((line, index) => {
                    // Kalın başlıkları (**) ayırmak için
                    if (line.startsWith("**") && line.endsWith("**")) {
                        return <h4 key={index}>{line.replaceAll("**", "")}</h4>;
                    }
                    // Liste elemanlarını (*) ayırmak için
                    if (line.trim().startsWith("* ")) {
                        return <p key={index} style={{ paddingLeft: "20px" }}>{line}</p>;
                    }
                    // Diğer düz satırlar ve boşluklar
                    return <p key={index}>{line || <br />}</p>;
                })
            ) : (
                // Rapor yoksa gösterilecek mesaj
                <p>Yapay zeka değerlendirmesi bulunamadı.</p>
            )}
        </div>
      </div>
      {/* RAPORUN ALTINDAKİ DOKTOR VE UYARI METNİ */}
      <div className="rapor-doktor-footer">
        <p><strong><i>(Bu rapor {selectedDoctor} tarafından oluşturulmuştur! Kesin sonuçlar için lütfen bir uzman ile görüşün.)</i></strong></p>
      </div>
    </div>
  );
};

export default LLMRaporu;
