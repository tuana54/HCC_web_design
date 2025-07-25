// src/components/LLMRaporu.js
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
  
  const geminiReport = apiResult?.gemini_comprehensive_report;
  const doctorNote = patientDetails?.doctor_note;

  // **DEĞİŞİKLİK BURADA BAŞLIYOR**
  // LLM rapor metnini işleme mantığı
  const renderGeminiReport = () => {
    if (!geminiReport) {
      return <p>Yapay zeka değerlendirmesi bulunamadı.</p>;
    }

    const lines = geminiReport.split("\n");
    const elements = [];
    let i = 0;

    while (i < lines.length) {
      let line = lines[i].trim();

      // Durum 1: Çift yıldız (**) ile başlayanlar ana başlık olarak işlenir
      if (line.startsWith("**") && line.endsWith("**")) {
        elements.push(<h4 key={i}>{line.replaceAll("**", "")}</h4>);
        i++;
      } 
      // Durum 2: Tek yıldız (*) ile başlayanlar alt başlık olarak işlenir
      else if (line.startsWith("* ")) {
        const titleText = line.substring(2).trim(); // "* " kısmını kaldırır
        elements.push(<p key={i} className="llm-list-item-heading">{titleText}</p>); // h4 ile kalın ve başlık gibi göster

        // Bir sonraki satırın açıklama olup olmadığını kontrol et
        if (i + 1 < lines.length) {
          let nextLine = lines[i + 1].trim();
          // Eğer bir sonraki satır başka bir başlık türü değilse, açıklama olarak işlem
          if (!nextLine.startsWith("**") && !nextLine.startsWith("* ")) {
            elements.push(<p key={`desc-${i}`}>{nextLine || <br />}</p>);
            i++; // Açıklama satırını tüket
          }
        }
        i++; // Alt başlık satırını tüket
      }
      // Durum 3: Diğer tüm satırlar (normal paragraflar veya boş satırlar)
      else {
        elements.push(<p key={i}>{line || <br />}</p>);
        i++;
      }
    }
    return elements;
  };
  // **DEĞİŞİKLİK BURADA BİTİYOR**

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

        <div className="llm-sonuclari">
            {renderGeminiReport()} {/* Yeni fonksiyonu çağırıyoruz */}
        </div>

        {doctorNote && (
          <div className="doctor-note-section">
            <h3>Doktor Notu</h3>
            <p>{doctorNote}</p>
          </div>
        )}
      </div>
      <div className="rapor-doktor-footer">
        <p><strong><i>(Bu rapor {selectedDoctor} tarafından oluşturulmuştur! Kesin sonuçlar için lütfen bir uzman ile görüşün.)</i></strong></p>
      </div>
    </div>
  );
};

export default LLMRaporu;