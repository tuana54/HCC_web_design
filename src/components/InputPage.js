// src/components/InputPage.js
import { useEffect, useState } from "react";
import { FaArrowLeft, FaArrowRight, FaUserMd } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./InputPage.css";

const InputPage = () => {
  const navigate = useNavigate();

  const getInitialForm = () => {
    const savedForm = localStorage.getItem("hastaFormData");
    return savedForm ? JSON.parse(savedForm) : {
      name: "",
      surname: "",
      Yas: "",
      gender: "",
      alcohol: "",
      smoking: "",
      hcv: "",
      hbv: "",
      cancer_history: "",
      AFP: "",
      ALT: "",
      AST: "",
      ALP: "",
      BIL: "",
      GGT: "",
      Albumin: "",
      PST: "",  // Performans Skoru
      doctor_note: ""
    };
  };

  const [form, setForm] = useState(getInitialForm);
  const [btFile, setBtFile] = useState(null);
  const [ultrasonFile, setUltrasonFile] = useState(null);
  const [btImageUrl, setBtImageUrl] = useState(null);
  const [ultrasonImageUrl, setUltrasonImageUrl] = useState(null);

  useEffect(() => {
    localStorage.setItem("hastaFormData", JSON.stringify(form));
  }, [form]);

  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    if (!userId) {
      alert("Bu sayfayı görüntülemek için lütfen giriş yapın.");
      navigate('/');
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const fileName = file.name.toLowerCase();
      const is3DFile = fileName.endsWith(".nii") || fileName.endsWith(".nii.gz") || fileName.endsWith(".dcm");
      const previewUrl = is3DFile ? file.name : URL.createObjectURL(file);
      if (type === "bt") {
        setBtFile(file);
        setBtImageUrl(previewUrl);
      } else {
        setUltrasonFile(file);
        setUltrasonImageUrl(previewUrl);
      }
    } else {
      if (type === "bt") {
        setBtFile(null);
        setBtImageUrl(null);
      } else {
        setUltrasonFile(null);
        setUltrasonImageUrl(null);
      }
    }
  };

  const handleCalculate = async () => {
    const userId = localStorage.getItem('user_id');
    if (!userId) {
      alert("Lütfen tekrar giriş yapın.");
      navigate('/');
      return;
    }

    if (!form.name || !form.surname || !form.Yas || !form.gender) {
      alert("Lütfen hasta bilgilerini eksiksiz doldurun.");
      return;
    }

    const labData = {
      Yaş: parseFloat(form.Yas),
      Cinsiyet: form.gender === "Erkek" ? 1 : 0,
      Albumin: parseFloat(form.Albumin || 0),
      ALP: parseFloat(form.ALP || 0),
      ALT: parseFloat(form.ALT || 0),
      AST: parseFloat(form.AST || 0),
      BIL: parseFloat(form.BIL || 0),
      GGT: parseFloat(form.GGT || 0),
    };

    const payload = new FormData();
    payload.append("user_id", userId);
    payload.append("patient_name", form.name);
    payload.append("patient_surname", form.surname);
    payload.append("lab_data", JSON.stringify(labData));
    payload.append("afp_value", parseFloat(form.afp || 0));
    payload.append("alcohol_consumption", form.alcohol || "");
    payload.append("smoking_status", form.smoking || "");
    payload.append("hcv_status", form.hcv || "");
    payload.append("hbv_status", form.hbv || "");
    payload.append("cancer_history_status", form.cancer_history || "");
    if (ultrasonFile) payload.append("usg_file", ultrasonFile);
    if (btFile) payload.append("mri_file", btFile);
    payload.append("pst", form.PST);  // <-- eklendi
    try {
      const response = await fetch("https://hcc-web-design-api.onrender.com", { //http://localhost:8000/evaluate_hcc_risk
        method: "POST",
        body: payload,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Sunucu hatası");
      }

      const result = await response.json();
      const receivedVlmReport = result.vlm_radiology_report || null;

      navigate("/sonuc", {
        state: {
          hastaAdiSoyadi: `${form.name} ${form.surname}`,
          apiResult: result,
          vlmReport: receivedVlmReport,
          patientDetails: {
            ...form,
            age: form.Yas,
            ultrasonFileUploaded: !!ultrasonFile,
            btFileUploaded: !!btFile,
            ultrasonImageUrl,
            btImageUrl,
          },
        },
      });
    } catch (error) {
      console.error("Hesaplama hatası:", error);
      alert("Hesaplama sırasında hata oluştu: " + error.message);
    }
  };
  
        const placeholderMap = {
  AFP: "Örn., 12 ng/mL (0-10)",
  ALT: "Örn., 35 U/L (7–40)",
  AST: "Örn., 30 U/L (5–40)",
  ALP: "Örn., 100 U/L (45–120)",
  GGT: "Örn., 50 U/L (9–48)",
  BIL: "Örn., 1.0 mg/dL (0.1–1.2)",          // Total Bilirubin
  Albumin: "Örn., 4.2 g/dL (3.5–5.0)",
};



  return (
  <div className="input-page">
    <div className="nav-buttons-inside">

      {/* Geri Butonu */}
      <button className="nav-btn" onClick={() => navigate("/")}>
        <FaArrowLeft className="nav-icon" />
      </button>

      {/* İleri Butonu */}
      <button
        className="nav-btn"
        onClick={() => {
          const apiResult = sessionStorage.getItem("apiResult");
          const vlmReport = sessionStorage.getItem("vlmReport");
          const patientDetails = sessionStorage.getItem("patientDetails");

          if (apiResult && vlmReport && patientDetails) {
            navigate("/sonuc");
          } else {
            alert("Henüz hesaplama yapılmadı. Lütfen önce 'Hesapla' butonuna basın.");
          }
        }}
      >
        <FaArrowRight className="nav-icon" />
      </button>

    </div>


      <h2>Hasta Bilgileri ve Laboratuvar Verileri</h2>

      <div className="left-section">
        <h3>Hasta Bilgileri</h3>
        <div className="hasta-grid-2col">
          {[
            { name: "name", label: "Ad", placeholder: "Örn., Ayşe" },
            { name: "surname", label: "Soyad", placeholder: "Örn., Yılmaz" },
            { name: "Yas", label: "Yaş", placeholder: "Örn., 45" },
          ].map(({ name, label, placeholder }) => (
            <div className="form-group" key={name}>
              <label>{label}</label>
              <input type="text" name={name} value={form[name]} placeholder={placeholder} onChange={handleChange} className={`form-control ${form[name] ? "input-filled" : ""}`} />
            </div>
          ))}

          <div className="form-group">
            <label>Cinsiyet</label>
            <select name="gender" value={form.gender} onChange={handleChange} className={`form-control ${form.gender ? "input-filled" : ""}`}>
              <option value="">Seçiniz</option>
              <option value="Kadın">Kadın</option>
              <option value="Erkek">Erkek</option>
            </select>
          </div>

          {["alcohol", "smoking", "hcv", "hbv"].map((key) => (
            <div className="form-group" key={key}>
              <label>{{
                alcohol: "Alkol Tüketimi",
                smoking: "Sigara Kullanımı",
                hcv: "HCV (Hepatit C)",
                hbv: "HBV (Hepatit B)"
              }[key]}</label>
              <select name={key} value={form[key]} onChange={handleChange} className={`form-control ${form[key] ? "input-filled" : ""}`}>
                <option value="">Seçiniz</option>
                <option value="Evet">Evet</option>
                <option value="Hayır">Hayır</option>
              </select>
            </div>
          ))}

          <div className="form-group">
            <label>Ailede Kanser Öyküsü</label>
            <select name="cancer_history" value={form.cancer_history} onChange={handleChange} className={`form-control ${form.cancer_history ? "input-filled" : ""}`}>
              <option value="">Seçiniz</option>
              <option value="Var">Var</option>
              <option value="Yok">Yok</option>
            </select>
          </div>
        </div>
      </div>

            {/* Laboratuvar verileri */}
      <div className="right-section">
        <h3>Laboratuvar Sonuçları</h3>
        <div className="lab-grid">
 
{["AFP", "ALT", "AST", "ALP", "GGT", "BIL", "Albumin"].map((key, i) => (
  <div className="lab-item" key={i}>
    <label>{key}</label>
    <input
      type="text"
      name={key}
      value={form[key]}
      placeholder={placeholderMap[key]}
      onChange={handleChange}
      className={`form-control ${form[key] ? "input-filled" : ""}`}
    />
  </div>
          ))}
          <div className="lab-item">
  <label htmlFor="PST">PST (Performans Skoru)</label>
  <select
    id="PST"
    name="PST"
    value={form.PST}
    onChange={handleChange}
    className={`form-control ${form.PST ? "input-filled" : ""}`}
  >
    <option value="">Seçiniz</option>
    <option value="0">0 - Normal (aktif)</option>
    <option value="1">1 - Hafif aktivite kısıtlılığı</option>
    <option value="2">2 - Çalışamaz ama kendi bakımını yapabilir</option>
    <option value="3">3 - Günlük aktivite yapamaz</option>
    <option value="4">4 - Yatalak, tam bağımlı</option>
  </select>
</div>
        </div>
      </div>

      {/* Görüntü Yükleme */}
      <div className="image-section-wrapper">
        {[
          { label: "Ultrason", file: ultrasonFile, url: ultrasonImageUrl, type: "ultrason" },
          { label: "MR", file: btFile, url: btImageUrl, type: "bt" },
        ].map(({ label, file, url, type }, i) => (
          <div className="bt-section" key={i}>
            <h3>{label} Görüntüsü Yükleme</h3>
            <label htmlFor={`${type}-upload`} className="upload-area">
              {url ? (
                file.name.toLowerCase().match(/\.(nii|nii.gz|dcm)$/)
                  ? <p>Yüklü: {url}</p>
                  : <img src={url} alt={`${label} Önizleme`} />
              ) : (
                <div><strong>{label} Görüntüsü Yükle</strong><small>Sürükleyin veya gözatın</small></div>
              )}
            </label>
            <input type="file" id={`${type}-upload`} accept=".nii,.nii.gz,.dcm,image/*" style={{ display: "none" }} onChange={(e) => handleFileChange(e, type)} />
          </div>
        ))}
      </div>

      {/* Doktor notu */}
      <div className="doktor-note-kart">
        <h3><FaUserMd /> Doktorun Notu</h3>
        <textarea
          name="doctor_note"
          value={form.doctor_note}
          onChange={handleChange}
          placeholder="Doktorun bu hasta için özel notu..."
          className="doktor-textarea"
        />
      </div>

      {/* Buton */}
      <div className="button-container">
        <button className="calculate-btn" onClick={handleCalculate}>Hesapla</button>
      </div>
    </div>
  );
};

export default InputPage;
