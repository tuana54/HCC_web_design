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
    const day = String(today.getDate()).padStart(2, '0'); // Günü iki haneli yap (örn: 05, 12)
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Ayı iki haneli yap (0-indexed olduğu için +1 ekle)
    const year = today.getFullYear();
    const formattedDate = `${day}.${month}.${year}`; // GG.AA.YYYY formatı
    setReportDate(formattedDate);
  }, []); // Bağımlılık dizisi boş kalmalı, sadece bir kere yüklenmeli

  const handleDownloadPdf = () => {
    const input = document.getElementById('rapor-icerigi'); // Raporun ana div'inin ID'si
    if (!input) {
      console.error('PDF oluşturulacak div bulunamadı: #rapor-icerigi');
      alert('Rapor içeriği bulunamadığı için PDF oluşturulamadı.');
      return;
    }

    // Butonu ve rapor altındaki doktor metnini geçici olarak gizle (PDF'e dahil olmaması için)
    const downloadButton = document.querySelector('.download-pdf-button');
    const doctorFooter = document.querySelector('.rapor-doktor-footer');
    const reportDateElement = document.querySelector('.rapor-tarih'); // Tarih elementini de yakala
    
    if (downloadButton) downloadButton.style.display = 'none';
    if (doctorFooter) doctorFooter.style.display = 'block';
    if (reportDateElement) reportDateElement.style.display = 'none'; // Tarihi gizle

    html2canvas(input, {
      scale: 2, // Çözünürlüğü artırmak için (daha net PDF)
      useCORS: true // Eğer resimler başka bir kaynaktan geliyorsa (örn. logo), gerekli
    }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4'); // 'p' dikey, 'mm' birim, 'a4' boyut
      const imgWidth = 210; // A4 genişliği mm cinsinden
      const pageHeight = 297; // A4 yüksekliği mm cinsinden
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
      
      // Dosya adını hastanın adı ve rapor başlığı ile oluşturmak isterseniz:
      const patientName = reportData?.patientDetails?.name || 'Hasta';
      const patientSurname = reportData?.patientDetails?.surname || 'Raporu';
      const fileName = `${patientName}_${patientSurname}_HCC_Tahmin_Raporu.pdf`;

      pdf.save(fileName); // PDF'i kaydet

      // Butonu, doktor metnini ve tarihi tekrar görünür yap
      if (downloadButton) downloadButton.style.display = 'block';
      if (doctorFooter) doctorFooter.style.display = 'block';
      if (reportDateElement) reportDateElement.style.display = 'block'; // Tarihi geri göster
    }).catch(error => {
      console.error("PDF oluşturulurken hata oluştu:", error);
      alert("PDF oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.");
      // Hata durumunda da buton, doktor metni ve tarihi geri göster
      if (downloadButton) downloadButton.style.display = 'block';
      if (doctorFooter) doctorFooter.style.display = 'block';
      if (reportDateElement) reportDateElement.style.display = 'block';
    });
  };

  if (error) {
    return <div className="llm-rapor-container error">{error}</div>;
  }

  if (!reportData) {
    return <div className="llm-rapor-container">Rapor verisi yükleniyor...</div>;
  }

  const { patientDetails, apiResult } = reportData;
  const llmYanitlari = apiResult?.detailed_report_summary || [];
  const overallRiskLevel = apiResult?.overall_risk_level || 'Belirlenemedi';
  const isHighRisk = overallRiskLevel.toLowerCase().includes('yüksek'); // 'Yüksek Risk' veya 'yüksek' içeriyorsa

  return (
    <div className="llm-rapor-container" id="rapor-icerigi">
      <button className="download-pdf-button" onClick={handleDownloadPdf} title="Belgeyi İndir">
        <FontAwesomeIcon icon={faDownload} />
      </button>

      <div className="rapor-header">
        <img src={hccSentinelLogo} alt="HCCentinel Logo" className="rapor-logo" />
        <h1>YAPAY ZEKA DESTEKLİ HCC TAHMİN RAPORU</h1>
        <div className="rapor-tarih">{reportDate}</div> {/* Tarih burada gösterilecek */}
      </div>
      <div className="rapor-body">
        {/* Hasta bilgilerinin gösterildiği alan */}
        <div className="hasta-bilgileri">
          {/* Hasta Adı Soyadı ve Risk aynı satırda */}
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
          {/* Yaş ayrı satırda */}
          <div className="info-item">
            <strong>Yaş:</strong>
            <span>{patientDetails?.age || '-'}</span>
          </div>
          {/* Cinsiyet ayrı satırda */}
          <div className="info-item">
            <strong>Cinsiyet:</strong>
            <span>{patientDetails?.gender || '-'}</span>
          </div>
        </div>

        {/* LLM'den gelen sonuçların listelendiği alan */}
        <div className="llm-sonuclari">
            <p>1- Klinik Değerlendirme:
Laboratuvar bulgularını analiz edin ve yorumlayın, HCC ile ilgili anormallikleri veya örüntüleri vurgulayın.
2- Potansiyel Risk:
İlgili eşik değerleri veya klinik kriterleri referans alarak HCC risk düzeyini (düşük, orta, yüksek) tartışın.
3- Gerekçe / Kanıt:
Risk değerlendirmesinin arkasındaki kanıtları veya gerekçeleri sunun, mümkünse standart kılavuzları veya bilinen biyobelirteçleri referans alın.
4- Önerilen Eylem:
Gerekçesini de ekleyerek, ileri tanı adımları (örn. görüntüleme, biyopsi) veya klinik sevk önerin.
5- Takip Planı:
Takip test aralıkları, klinik izleme veya yeniden değerlendirme zaman çizelgeleri önerin.
6- Kırmızı Bayraklar:
Acil müdahale gerektirebilecek kritik değerleri veya bulguların kombinasyonlarını belirleyin.


              
            </p>

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
      {/* RAPORUN ALTINDAKİ DOKTOR VE UYARI METNİ */}
      <div className="rapor-doktor-footer">
        <p><strong><i>(Bu rapor {selectedDoctor} tarafından oluşturulmuştur! Kesin sonuçlar için lütfen bir uzman ile görüşün.)</i></strong></p>
      </div>
    </div>
  );
};

export default LLMRaporu;