// src/components/InputPage.js (GÜNCEL VERSİYON - API'deki yeni LabData modeliyle ve son eklemelerinizle tam uyumlu)
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./InputPage.css"; // CSS dosyasını içe aktarın
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { FaUserMd } from "react-icons/fa"; 
const InputPage = () => {
  const [form, setForm] = useState({
    name: "",
    surname: "",
    // API'deki LabData modeline uygun isimler
    Yas: "", // 'age' yerine 'Yas'
    gender: "", // "Erkek", "Kadın", "Belirtmek istemiyorum"
    alcohol: "",
    smoking: "",
    hcv: "", // Yeni eklenen
    hbv: "", // Yeni eklenen
    cancer_history: "", // Yeni eklenen

    afp: "", // AFP değeri API'deki LabData modelinde yok ama ayrı Form parametresi olarak gönderiliyor
    
    // API'deki LabData modeline uygun Lab test isimleri
    ALT: "",
    AST: "",
    ALP: "",
    BIL: "", // Total Bilirubin yerine BIL
    GGT: "",
    Albumin: "",
    Albumin_and_Globulin_Ratio: "",
    // Direct_Bilirubin ve Total_Protiens API'nin LabData modelinden çıkarıldı.
  });

  // Dosya objelerini tutmak için state'ler
  const [btFile, setBtFile] = useState(null); // MR (BT) görüntü dosyası objesi
  const [ultrasonFile, setUltrasonFile] = useState(null); // USG görüntü dosyası objesi

  // Görüntü önizlemeleri için URL'ler (3D ise dosya adı, değilse URL)
  const [btImageUrl, setBtImageUrl] = useState(null);
  const [ultrasonImageUrl, setUltrasonImageUrl] = useState(null);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const fileName = file.name.toLowerCase();
      // 3D medikal dosya formatları
      const is3DFile = fileName.endsWith(".nii") || fileName.endsWith(".nii.gz") || fileName.endsWith(".dcm");

      let previewValue;
      if (is3DFile) {
        previewValue = file.name; // 3D dosya ise önizleme olarak sadece adını göster
      } else {
        previewValue = URL.createObjectURL(file); // 2D (JPG/PNG) ise URL oluştur
      }

      if (type === "bt") {
        setBtFile(file);
        setBtImageUrl(previewValue);
      } else if (type === "ultrason") {
        setUltrasonFile(file);
        setUltrasonImageUrl(previewValue);
      }
    } else {
      // Dosya seçimi iptal edilirse veya dosya yoksa sıfırla
      if (type === "bt") {
        setBtFile(null);
        setBtImageUrl(null);
      } else if (type === "ultrason") {
        setUltrasonFile(null);
        setUltrasonImageUrl(null);
      }
    }
  };


  const handleCalculate = async () => {
    const api_url = "http://localhost:8000/evaluate_hcc_risk";

    // Tüm form değerlerini toplayalım (patientDetails için kullanılacak)
    const rawPatientData = {
        name: form.name,
        surname: form.surname,
        age: form.Yas, // API'ye Yas olarak gidiyor ama patientDetails'te age olarak saklayalım
        gender: form.gender,
        alcohol: form.alcohol,
        smoking: form.smoking,
        hcv: form.hcv,
        hbv: form.hbv,
        cancer_history: form.cancer_history,
        afp: form.afp,
        // Diğer Lab değerleri formdan geldiği gibi (isimleriyle) patientDetails'e gidecek
        ALT: form.ALT, AST: form.AST, ALP: form.ALP, GGT: form.GGT,
        BIL: form.BIL, Albumin: form.Albumin, "Albumin_and_Globulin_Ratio": form.Albumin_and_Globulin_Ratio,
    };

    // Zorunlu hasta bilgileri kontrolü
    if (!rawPatientData.name || !rawPatientData.surname || !rawPatientData.age || !rawPatientData.gender) {
        alert("Lütfen hasta bilgilerini (Ad, Soyad, Yaş, Cinsiyet) eksiksiz doldurun.");
        return;
    }
    // Yaşın sayısal bir değer olduğundan emin olun (API'nin 'Yaş'ına karşılık gelen)
    if (isNaN(parseFloat(rawPatientData.age))) {
        alert("Hata: 'Hasta Yaşı' alanı sayı formatında değil veya boş. Lütfen kontrol edin.");
        return;
    }


    // API için lab verilerini temizleme ve sayıya dönüştürme
    const labDataForApi = {};
    
    // API'nin LabData modelindeki beklentilere göre doğrudan eşleme
    labDataForApi.Yaş = parseFloat(rawPatientData.age); // 'Age' yerine 'Yas'
    labDataForApi.Cinsiyet = rawPatientData.gender === "Erkek" ? 1 : 0; // 'Gender' dönüşümü
    labDataForApi.Albumin = parseFloat(rawPatientData.Albumin || 0);
    labDataForApi.ALP = parseFloat(rawPatientData.ALP || 0);
    labDataForApi.ALT = parseFloat(rawPatientData.ALT || 0);
    labDataForApi.AST = parseFloat(rawPatientData.AST || 0);
    labDataForApi.BIL = parseFloat(rawPatientData.BIL || 0); // Total Bilirubin yerine BIL
    labDataForApi.GGT = parseFloat(rawPatientData.GGT || 0);
    labDataForApi.Albumin_and_Globulin_Ratio = parseFloat(rawPatientData.Albumin_and_Globulin_Ratio || 0);

    // Zorunlu Lab değerlerinin sayısal format kontrolü (API'nin LabData'sındaki isimleri kullanıyoruz)
    const requiredLabApiFields = [
        "Yaş", "Albumin", "ALP", "ALT", "AST", "BIL", "GGT", "Albumin_and_Globulin_Ratio"
    ];
    for (const field of requiredLabApiFields) {
        if (isNaN(labDataForApi[field])) {
            alert(`Hata: '${field}' laboratuvar değeri sayı formatında değil veya boş. Lütfen kontrol edin.`);
            return;
        }
    }


    // 2. FormData objesini oluşturma
    const formData = new FormData();
    formData.append("lab_data", JSON.stringify(labDataForApi));

    if (ultrasonFile) {
      formData.append("usg_file", ultrasonFile);
    }
    if (btFile) { // btFile, MR görüntüsü için kullanılıyor
      formData.append("mri_file", btFile);
    }
    
    // AFP, Alkol ve Sigara kullanımını da ayrı Form alanları olarak ekleyelim,
    // API'nin evaluate_hcc_risk endpoint'i bunları ayrı Form parametreleri olarak bekliyor.
    // patientDetails'teki ham değerleri kullanıyoruz, API bunları Python tarafında işleyecek.
    formData.append("afp_value", parseFloat(rawPatientData.afp || 0));
    formData.append("alcohol_consumption", rawPatientData.alcohol || "");
    formData.append("smoking_status", rawPatientData.smoking || "");
    formData.append("hcv_status", rawPatientData.hcv || ""); // Yeni eklendi
    formData.append("hbv_status", rawPatientData.hbv || ""); // Yeni eklendi
    formData.append("cancer_history_status", rawPatientData.cancer_history || ""); // Yeni eklendi


    try {
      const response = await fetch(api_url, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API Hatası: ${response.status} - ${errorData.detail || response.statusText}`);
      }

      const result = await response.json();
      console.log("API Yanıtı:", result);

      navigate("/sonuc", {
        state: {
          hastaAdiSoyadi: `${form.name} ${form.surname}`,
          apiResult: result, // API'den gelen tüm sonucu aktar
          patientDetails: rawPatientData // Tüm ham form verisini aktaralım (patientDetails için)
        },
      });

    } catch (error) {
      console.error("Tahmin alınırken hata oluştu:", error);
      alert(`Tahmin yapılırken bir hata oluştu: ${error.message}. Lütfen console'a ve API terminaline bakın.`);
    }
  };


  return (
    <div className="input-page">
    <div className="nav-buttons-inside">
         <button className="nav-btn" onClick={() => navigate(-1)}>
           <FaArrowLeft className="nav-icon" />
         </button>
         <button className="nav-btn" onClick={() => navigate(+1)}>
           <FaArrowRight className="nav-icon" />
         </button>
       </div>
      <h2>Hasta Bilgileri ve Laboratuvar Verileri</h2>

      {/* Hasta Bilgileri */}
      <div className="left-section">
        <h3>Hasta Bilgileri</h3>
        <div className="hasta-grid-2col">
          <div className="form-group">
            <label>Hasta Adı</label>
            <input
              type="text"
              name="name"
              placeholder="Örn., Ayşe"
              value={form.name}
              onChange={handleChange}
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label>Hasta Soyadı</label>
            <input
              type="text"
              name="surname"
              placeholder="Örn., Yılmaz"
              value={form.surname}
              onChange={handleChange}
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label>Hasta Yaşı</label>
            <input
              type="text"
              name="Yas" // "age" yerine "Yas" - API'ye uygun
              placeholder="Örn., 45"
              value={form.Yas} // form.age yerine form.Yas
              onChange={handleChange}
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label>Cinsiyet</label>
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className="form-control"
            >
              <option value="">Seçiniz</option>
              <option value="Kadın">Kadın</option>
              <option value="Erkek">Erkek</option>
              <option value="Belirtmek istemiyorum">Belirtmek istemiyorum</option>
            </select>
          </div>

          <div className="form-group">
            <label>Alkol Tüketimi</label>
            <select
              name="alcohol"
              value={form.alcohol}
              onChange={handleChange}
              className="form-control"
            >
              <option value="">Seçiniz</option>
              <option value="Evet">Evet</option>
              <option value="Hayır">Hayır</option>
            </select>
          </div>

          <div className="form-group">
            <label>Sigara Kullanımı</label>
            <select
              name="smoking"
              value={form.smoking}
              onChange={handleChange}
              className="form-control"
            >
              <option value="">Seçiniz</option>
              <option value="Evet">Evet</option>
              <option value="Hayır">Hayır</option>
            </select>
          </div>

          {/* YENİ EKLENEN HASTA BİLGİLERİ */}
          <div className="form-group">
            <label>HCV (Hepatit C)</label>
            <select
              name="hcv"
              value={form.hcv}
              onChange={handleChange}
              className="form-control"
            >
              <option value="">Seçiniz</option>
              <option value="Evet">Evet</option>
              <option value="Hayır">Hayır</option>
            </select>
          </div>

          <div className="form-group">
            <label>HBV (Hepatit B)</label>
            <select
              name="hbv"
              value={form.hbv}
              onChange={handleChange}
              className="form-control"
            >
              <option value="">Seçiniz</option>
              <option value="Evet">Evet</option>
              <option value="Hayır">Hayır</option>
            </select>
          </div>

          <div className="form-group">
            <label>Ailede Kanser Öyküsü</label>
            <select
              name="cancer_history"
              value={form.cancer_history}
              onChange={handleChange}
              className="form-control"
            >
              <option value="">Seçiniz</option>
              <option value="Var">Var</option>
              <option value="Yok">Yok</option>
            </select>
          </div>
        </div>
      </div>

      {/* Laboratuvar Sonuçları - GÜNCEL HALİ (API'deki yeni isimlerle eşleşiyor) */}
      <div className="right-section" style={{ marginTop: "40px" }}>
        <h3>Laboratuvar Sonuçları</h3>
        <div className="lab-grid">
          <div className="lab-item" key="afp">
            <label>AFP</label>
            <input
              type="text"
              name="afp"
              placeholder="Örn., 5.2 ng/mL"
              value={form.afp}
              onChange={handleChange}
              className="form-control"
            />
          </div>

          <div className="lab-item" key="ALT">
            <label>ALT</label>
            <input
              type="text"
              name="ALT"
              placeholder="Örn., 25 U/L"
              value={form.ALT}
              onChange={handleChange}
              className="form-control"
            />
          </div>

          <div className="lab-item" key="AST">
            <label>AST</label>
            <input
              type="text"
              name="AST"
              placeholder="Örn., 30 U/L"
              value={form.AST}
              onChange={handleChange}
              className="form-control"
            />
          </div>

          <div className="lab-item" key="ALP">
            <label>ALP (Alkaline Phosphotase)</label>
            <input
              type="text"
              name="ALP"
              placeholder="Örn., 120 U/L"
              value={form.ALP}
              onChange={handleChange}
              className="form-control"
            />
          </div>

          <div className="lab-item" key="GGT">
            <label>GGT</label>
            <input
              type="text"
              name="GGT"
              placeholder="Örn., 40 U/L"
              value={form.GGT}
              onChange={handleChange}
              className="form-control"
            />
          </div>

          <div className="lab-item" key="BIL">
            <label>BIL (Total Bilirubin)</label>
            <input
              type="text"
              name="BIL"
              placeholder="Örn., 0.8 mg/dL"
              value={form.BIL}
              onChange={handleChange}
              className="form-control"
            />
          </div>

          {/* Direct Bilirubin ve Total Proteins artık API'nin LabData modelinde yok */}
          {/* <div className="lab-item" key="direct_bilirubin"> ... </div> */}
          {/* <div className="lab-item" key="total_protiens"> ... </div> */}

          <div className="lab-item" key="Albumin">
            <label>Albumin</label>
            <input
              type="text"
              name="Albumin"
              placeholder="Örn., 4.2 g/dL"
              value={form.Albumin}
              onChange={handleChange}
              className="form-control"
            />
          </div>

          <div className="lab-item" key="Albumin_and_Globulin_Ratio">
            <label>Albumin/Globulin Oranı</label>
            <input
              type="text"
              name="Albumin_and_Globulin_Ratio"
              placeholder="Örn., 1.2"
              value={form.Albumin_and_Globulin_Ratio}
              onChange={handleChange}
              className="form-control"
            />
          </div>
        </div>
      </div>

      {/* Görüntü Yükleme Alanları */}
      <div className="image-section-wrapper" style={{ marginTop: "40px" }}>
        <div className="bt-section">
          <h3>Ultrason Görüntüsü Yükleme</h3>
          <label htmlFor="ultrason-upload" className="upload-area">
            {ultrasonImageUrl ? (
              // 2D görüntü ise önizleme, 3D ise dosya adını göster
              ultrasonFile && (ultrasonFile.name.toLowerCase().endsWith(".nii") || ultrasonFile.name.toLowerCase().endsWith(".nii.gz") || ultrasonFile.name.toLowerCase().endsWith(".dcm")) ? (
                <p>Yüklü: {ultrasonImageUrl}</p>
              ) : (
                <img src={ultrasonImageUrl} alt="Ultrason Görüntüsü Önizlemesi" />
              )
            ) : (
              <div>
                <strong>Ultrason Görüntüsü Yükle</strong>
                <small>Görüntüyü buraya sürükleyin veya gözatın</small>
              </div>
            )}
          </label>
          <input
            type="file"
            id="ultrason-upload"
            name="usg_file" // FormData için name
            accept="image/*,.nii,.nii.gz,.dcm" // USG için de 3D formatlar eklendi
            onChange={(e) => handleFileChange(e, "ultrason")}
            style={{ display: "none" }}
          />
        </div>

        <div className="bt-section">
          <h3>MR Görüntüsü Yükleme</h3>
          <label htmlFor="bt-upload" className="upload-area">
            {btImageUrl ? (
              // 2D görüntü ise önizleme, 3D ise dosya adını göster
              btFile && (btFile.name.toLowerCase().endsWith(".nii") || btFile.name.toLowerCase().endsWith(".nii.gz") || btFile.name.toLowerCase().endsWith(".dcm")) ? (
                <p>Yüklü: {btImageUrl}</p>
              ) : (
                <img src={btImageUrl} alt="MR Görüntüsü Önizlemesi" />
              )
            ) : (
              <div>
                <strong>MR Görüntüsü Yükle</strong>
                <small>Görüntüyü buraya sürükleyin veya gözatın</small>
              </div>
            )}
          </label>
          <input
            type="file"
            id="bt-upload"
            name="mri_file" // FormData için name
            accept=".nii,.nii.gz,.dcm,image/*" // NIfTI ve DICOM formatları eklendi
            onChange={(e) => handleFileChange(e, "bt")}
            style={{ display: "none" }}
          />
        </div>
      </div>


      {/* Hesapla Butonu */}
      <div className="button-container" style={{ marginTop: "40px" }}>
        <button className="calculate-btn" onClick={handleCalculate}>
          Hesapla
        </button>
      </div>
    </div>
  );
};

export default InputPage;