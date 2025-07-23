// src/components/InputPage.js (GÜNCEL VERSİYON - user_id gönderiyor)
import React, { useState, useEffect } from "react"; // useEffect eklendi
import { useNavigate } from "react-router-dom";
import "./InputPage.css";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
<<<<<<< HEAD
=======
import { FaUserMd } from "react-icons/fa"; 
>>>>>>> 800093c8e226d7e237b9ad83ecae085e016bc779

const InputPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    surname: "",
    Yas: "",
    gender: "",
    alcohol: "",
    smoking: "",
    hcv: "",
    hbv: "",
    cancer_history: "",
    afp: "",
    ALT: "",
    AST: "",
    ALP: "",
    BIL: "",
    GGT: "",
    Albumin: "",
<<<<<<< HEAD
=======
    doctor_note: ""
>>>>>>> 800093c8e226d7e237b9ad83ecae085e016bc779
  });

  // YENİ: Sayfa yüklendiğinde kullanıcının giriş yapıp yapmadığını kontrol et
  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    if (!userId) {
      alert("Bu sayfayı görüntülemek için lütfen giriş yapın.");
      navigate('/'); // Giriş yapmamışsa anasayfaya yönlendir
    }
  }, [navigate]);


  const [btFile, setBtFile] = useState(null);
  const [ultrasonFile, setUltrasonFile] = useState(null);
  const [btImageUrl, setBtImageUrl] = useState(null);
  const [ultrasonImageUrl, setUltrasonImageUrl] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleFileChange = (e, type) => {
    // ... (bu fonksiyon aynı kalıyor) ...
    const file = e.target.files[0];
    if (file) {
      const fileName = file.name.toLowerCase();
      const is3DFile = fileName.endsWith(".nii") || fileName.endsWith(".nii.gz") || fileName.endsWith(".dcm");
      let previewValue = is3DFile ? file.name : URL.createObjectURL(file);
      if (type === "bt") { setBtFile(file); setBtImageUrl(previewValue); } 
      else if (type === "ultrason") { setUltrasonFile(file); setUltrasonImageUrl(previewValue); }
    } else {
      if (type === "bt") { setBtFile(null); setBtImageUrl(null); } 
      else if (type === "ultrason") { setUltrasonFile(null); setUltrasonImageUrl(null); }
    }
  };


  const handleCalculate = async () => {
    const userId = localStorage.getItem('user_id');
    if (!userId) {
        alert("Lütfen tekrar giriş yapın.");
        navigate('/');
        return;
    }

    // ... (form doğrulama kodları aynı kalıyor) ...
    if (!form.name || !form.surname || !form.Yas || !form.gender) {
        alert("Lütfen hasta bilgilerini (Ad, Soyad, Yaş, Cinsiyet) eksiksiz doldurun.");
        return;
    }

    const labDataForApi = {
        Yaş: parseFloat(form.Yas),
        Cinsiyet: form.gender === "Erkek" ? 1 : 0,
        Albumin: parseFloat(form.Albumin || 0),
        ALP: parseFloat(form.ALP || 0),
        ALT: parseFloat(form.ALT || 0),
        AST: parseFloat(form.AST || 0),
        BIL: parseFloat(form.BIL || 0),
        GGT: parseFloat(form.GGT || 0),
    };

    // FormData objesini oluşturma
    const formData = new FormData();
    
    // YENİ: Gerekli tüm verileri backend'in beklediği şekilde ekliyoruz
    formData.append("user_id", userId);
    formData.append("patient_name", form.name);
    formData.append("patient_surname", form.surname);
    formData.append("lab_data", JSON.stringify(labDataForApi));
    
    if (ultrasonFile) formData.append("usg_file", ultrasonFile);
    if (btFile) formData.append("mri_file", btFile);
    
    formData.append("afp_value", parseFloat(form.afp || 0));
    formData.append("alcohol_consumption", form.alcohol || "");
    formData.append("smoking_status", form.smoking || "");
    formData.append("hcv_status", form.hcv || "");
    formData.append("hbv_status", form.hbv || "");
    formData.append("cancer_history_status", form.cancer_history || "");

    try {
      const response = await fetch("http://localhost:8000/evaluate_hcc_risk", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API Hatası: ${errorData.detail || 'Bilinmeyen hata'}`);
      }

      const result = await response.json();
      console.log("API Yanıtı:", result);

      // Sonuç sayfasına yönlendirirken ham verileri de gönder
      const rawPatientData = { ...form, ultrasonFileUploaded: !!ultrasonFile, btFileUploaded: !!btFile, ultrasonImageUrl, btImageUrl };
      navigate("/sonuc", {
        state: {
          hastaAdiSoyadi: `${form.name} ${form.surname}`,
          apiResult: result,
          patientDetails: rawPatientData
        },
      });

    } catch (error) {
      console.error("Tahmin alınırken hata oluştu:", error);
      alert(`Tahmin yapılırken bir hata oluştu: ${error.message}.`);
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
            <input type="text" name="name" placeholder="Örn., Ayşe" value={form.name} onChange={handleChange} className="form-control" />
          </div>
          <div className="form-group">
            <label>Hasta Soyadı</label>
            <input type="text" name="surname" placeholder="Örn., Yılmaz" value={form.surname} onChange={handleChange} className="form-control" />
          </div>
          <div className="form-group">
            <label>Hasta Yaşı</label>
            <input type="text" name="Yas" placeholder="Örn., 45" value={form.Yas} onChange={handleChange} className="form-control" />
          </div>
          <div className="form-group">
            <label>Cinsiyet</label>
            <select name="gender" value={form.gender} onChange={handleChange} className="form-control">
              <option value="">Seçiniz</option>
              <option value="Kadın">Kadın</option>
              <option value="Erkek">Erkek</option>
            </select>
          </div>
          <div className="form-group">
            <label>Alkol Tüketimi</label>
            <select name="alcohol" value={form.alcohol} onChange={handleChange} className="form-control">
              <option value="">Seçiniz</option>
              <option value="Evet">Evet</option>
              <option value="Hayır">Hayır</option>
            </select>
          </div>
          <div className="form-group">
            <label>Sigara Kullanımı</label>
            <select name="smoking" value={form.smoking} onChange={handleChange} className="form-control">
              <option value="">Seçiniz</option>
              <option value="Evet">Evet</option>
              <option value="Hayır">Hayır</option>
            </select>
          </div>
          <div className="form-group">
            <label>HCV (Hepatit C)</label>
            <select name="hcv" value={form.hcv} onChange={handleChange} className="form-control">
              <option value="">Seçiniz</option>
              <option value="Evet">Evet</option>
              <option value="Hayır">Hayır</option>
            </select>
          </div>
          <div className="form-group">
            <label>HBV (Hepatit B)</label>
            <select name="hbv" value={form.hbv} onChange={handleChange} className="form-control">
              <option value="">Seçiniz</option>
              <option value="Evet">Evet</option>
              <option value="Hayır">Hayır</option>
            </select>
          </div>
          <div className="form-group">
            <label>Ailede Kanser Öyküsü</label>
            <select name="cancer_history" value={form.cancer_history} onChange={handleChange} className="form-control">
              <option value="">Seçiniz</option>
              <option value="Var">Var</option>
              <option value="Yok">Yok</option>
            </select>
          </div>
        </div>
      </div>

      {/* Laboratuvar Sonuçları */}
      <div className="right-section" style={{ marginTop: "40px" }}>
        <h3>Laboratuvar Sonuçları</h3>
        <div className="lab-grid">
          <div className="lab-item"><label>AFP</label><input type="text" name="afp" placeholder="Örn., 5.2 ng/mL" value={form.afp} onChange={handleChange} className="form-control" /></div>
          <div className="lab-item"><label>ALT</label><input type="text" name="ALT" placeholder="Örn., 25 U/L" value={form.ALT} onChange={handleChange} className="form-control" /></div>
          <div className="lab-item"><label>AST</label><input type="text" name="AST" placeholder="Örn., 30 U/L" value={form.AST} onChange={handleChange} className="form-control" /></div>
          <div className="lab-item"><label>ALP</label><input type="text" name="ALP" placeholder="Örn., 120 U/L" value={form.ALP} onChange={handleChange} className="form-control" /></div>
          <div className="lab-item"><label>GGT</label><input type="text" name="GGT" placeholder="Örn., 40 U/L" value={form.GGT} onChange={handleChange} className="form-control" /></div>
          <div className="lab-item"><label>BIL</label><input type="text" name="BIL" placeholder="Örn., 0.8 mg/dL" value={form.BIL} onChange={handleChange} className="form-control" /></div>
          <div className="lab-item"><label>Albumin</label><input type="text" name="Albumin" placeholder="Örn., 4.2 g/dL" value={form.Albumin} onChange={handleChange} className="form-control" /></div>
        </div>
      </div>

      {/* Görüntü Yükleme Alanları */}
      <div className="image-section-wrapper" style={{ marginTop: "40px" }}>
        <div className="bt-section">
          <h3>Ultrason Görüntüsü Yükleme</h3>
          <label htmlFor="ultrason-upload" className="upload-area">
            {ultrasonImageUrl ? (
              ultrasonFile && (ultrasonFile.name.toLowerCase().endsWith(".nii") || ultrasonFile.name.toLowerCase().endsWith(".nii.gz") || ultrasonFile.name.toLowerCase().endsWith(".dcm")) ? (
                <p>Yüklü: {ultrasonImageUrl}</p>
              ) : (
                <img src={ultrasonImageUrl} alt="Ultrason Önizlemesi" />
              )
            ) : (
              <div><strong>Ultrason Görüntüsü Yükle</strong><small>Sürükleyin veya gözatın</small></div>
            )}
          </label>
          <input type="file" id="ultrason-upload" name="usg_file" accept="image/*,.nii,.nii.gz,.dcm" onChange={(e) => handleFileChange(e, "ultrason")} style={{ display: "none" }} />
        </div>
        <div className="bt-section">
          <h3>MR Görüntüsü Yükleme</h3>
          <label htmlFor="bt-upload" className="upload-area">
            {btImageUrl ? (
              btFile && (btFile.name.toLowerCase().endsWith(".nii") || btFile.name.toLowerCase().endsWith(".nii.gz") || btFile.name.toLowerCase().endsWith(".dcm")) ? (
                <p>Yüklü: {btImageUrl}</p>
              ) : (
                <img src={btImageUrl} alt="MR Önizlemesi" />
              )
            ) : (
              <div><strong>MR Görüntüsü Yükle</strong><small>Sürükleyin veya gözatın</small></div>
            )}
          </label>
          <input type="file" id="bt-upload" name="mri_file" accept=".nii,.nii.gz,.dcm,image/*" onChange={(e) => handleFileChange(e, "bt")} style={{ display: "none" }} />
        </div>
      </div>

<<<<<<< HEAD
=======
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

>>>>>>> 800093c8e226d7e237b9ad83ecae085e016bc779
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
