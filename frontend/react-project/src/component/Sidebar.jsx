import React, { useState, useEffect } from 'react';
import '../css/Sidebar.css';

function Sidebar({ onFilterApply = () => { } }) {
  const [bufferCount, setBufferCount] = useState(1);

  // Backend'den gelecek filtre seçenekleri
  const [UNIVERSITIES, setUniversities] = useState([]);
  const [MAJORS, setMajors] = useState([]);
  const [jobNames, setJobNames] = useState([]);

  // Filtre state'leri
  const [secilenCinsiyet, setSecilenCinsiyet] = useState('');
  const [secilenCinsiyetler, setSecilenCinsiyetler] = useState([]);

  const [secilenSehir, setSecilenSehir] = useState('');
  const [secilenSehirler, setSecilenSehirler] = useState([]);

  const [secilenDil, setSecilenDil] = useState('');
  const [secilenDiller, setSecilenDiller] = useState([]);

  const [secilenBolum, setSecilenBolum] = useState('');
  const [secilenBolumler, setSecilenBolumler] = useState([]);

  const [secilenUniversite, setSecilenUniversite] = useState('');
  const [secilenUniversiteler, setSecilenUniversiteler] = useState([]);

  const [secilenJobName, setSecilenJobName] = useState('');
  const [secilenJobNames, setSecilenJobNames] = useState([]);

  const [secilenBasvuruDurumu, setSecilenBasvuruDurumu] = useState('');
  const [secilenBasvuruDurumlari, setSecilenBasvuruDurumlari] = useState([]);

  const [SecilenEgitim, setSecilenEgitim] = useState('');
  const [secilenEgitimler, setSecilenEgitimler] = useState([]);

  // Mezuniyet yılı state'ini dizi olarak değiştir
  const [secilenMezuniyetYili, setSecilenMezuniyetYili] = useState('');
  const [candidateExpectedGraduateYears, setCandidateExpectedGraduateYears] = useState([]);

  const [applicationsDates, setApplicationsDates] = useState('');

  const [applicationMinDate, setApplicationMinDate] = useState('');
  const [applicationMaxDate, setApplicationMaxDate] = useState('');


  // Tek select için yaş ve GPA state'leri
  const yas_araligi = ['22-27', '28-33', '34-39', '40-45', '46-51', '52-57', '58-63'];
  const GpaOptions = [
    'Between 3.50 and 4.00',
    'Between 3.00 and 3.50',
    'Between 2.50 and 3.00',
    'Between 2.00 and 2.50'
  ];
  const [selectedYasAraligi, setSelectedYasAraligi] = useState('');
  const [selectedGpaOption, setSelectedGpaOption] = useState('');
  const [candidateMinAge, setCandidateMinAge] = useState(22);
  const [candidateMaxAge, setCandidateMaxAge] = useState(63);
  const [candidateMinGPA, setCandidateMinGPA] = useState(0.0);
  const [candidateMaxGPA, setCandidateMaxGPA] = useState(4.0);

  // Diğer filtre seçenekleri
  const Sex = ['female', 'male'];
  const EnglishLevels = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2'];
  const educations = ["first", "second", "third","fourth","graduated"];
  const Cities = ['İstanbul', 'Ankara', 'İzmir'];
  const ApplicationStatus = ['accept', 'reject', 'pending'];

  // Backend'den filtre seçeneklerini çek
  useEffect(() => {
    // Daha önce yüklendiyse tekrar istek atma
    if (UNIVERSITIES.length > 0) return;
    
    console.log('Fetching universities...');
    fetch("http://localhost:8080/userside/get/universities")
      .then((response) => response.json())
      .then((data) => {
        console.log('Universities fetched:', data.length);
        setUniversities(Array.isArray(data) ? data : []);
      })
      .catch((error) => console.error("Error fetching universities:", error));
  }, [UNIVERSITIES.length]);

  useEffect(() => {
    // Daha önce yüklendiyse tekrar istek atma
    if (MAJORS.length > 0) return;
    
    console.log('Fetching majors...');
    fetch("http://localhost:8080/userside/get/majors")
      .then((response) => response.json())
      .then((data) => {
        console.log('Majors fetched:', data.length);
        setMajors(Array.isArray(data) ? data : []);
      })
      .catch((error) => console.error("Error fetching majors:", error));
  }, [MAJORS.length]);

  useEffect(() => {
    // Daha önce yüklendiyse tekrar istek atma
    if (jobNames.length > 0) return;
    
    console.log('Fetching job names...');
    fetch('http://localhost:8080/userside/get/jobs')
      .then(response => {
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Fetched job names:', data.length);
        setJobNames(Array.isArray(data) ? data : []);
      })
      .catch(error => {
        console.error('Error fetching job names:', error);
        setJobNames([]);
      });
  }, [jobNames.length]);

  // Ortak fonksiyonlar
  const handleSelectChange = (setter) => (e) => setter(e.target.value);
  const handleAddItem = (item, list, setList, reset) => {
    if (item && !list.includes(item)) {
      setList([...list, item]);
      reset('');
    }
  };
  const handleRemoveItem = (item, list, setList) => {
    setList(list.filter((i) => i !== item));
  };

  
  const applyFilter = () => {
    const bufferName = `Filter ${bufferCount}`;

    const filters = {
      candidateSexes: secilenCinsiyetler.length > 0 ? secilenCinsiyetler : null,
      candidateMinAge: candidateMinAge, // Her zaman gönder
      candidateMaxAge: candidateMaxAge, // Her zaman gönder
      candidateEnglishLevels: secilenDiller.length > 0 ? secilenDiller : null,
      candidateMajors: secilenBolumler.length > 0 ? secilenBolumler : null,
      candidateUniversities: secilenUniversiteler.length > 0 ? secilenUniversiteler : null,
      jobNames: secilenJobNames.length > 0 ? secilenJobNames : null,
      candidateMinGPA: candidateMinGPA !== 0.0 ? candidateMinGPA : null,
      candidateMaxGPA: candidateMaxGPA !== 0.0 ? candidateMaxGPA : null,
      candidateCurrentYears: secilenEgitimler.length > 0 ? secilenEgitimler : null,
      candidateApplicationStatuses: secilenBasvuruDurumlari.length > 0 ? secilenBasvuruDurumlari : null,
      candidateExpectedGraduateYears: candidateExpectedGraduateYears.length > 0 ? candidateExpectedGraduateYears.map(Number) : null,
      applicationDates: applicationsDates ? [applicationsDates] : null,
      applicationMinDate: applicationMinDate || null,
      applicationMaxDate: applicationMaxDate || null,
      cityNames: secilenSehirler.length > 0 ? secilenSehirler : null,
    };

    onFilterApply(bufferName, filters);
    setBufferCount(bufferCount + 1);
  };

  // ...existing code...

  return (
    <div className="sidebar">

      {/* Şehirler */}
      <FilterSection
        title="City"
        value={secilenSehir}
        options={Cities}
        onChange={handleSelectChange(setSecilenSehir)}
        onAdd={() => handleAddItem(secilenSehir, secilenSehirler, setSecilenSehirler, setSecilenSehir)}
        items={secilenSehirler}
        onDelete={(item) => handleRemoveItem(item, secilenSehirler, setSecilenSehirler)}
      />

      {/* Üniversiteler */}
      <FilterSection
        title="University"
        value={secilenUniversite}
        options={UNIVERSITIES}
        onChange={handleSelectChange(setSecilenUniversite)}
        onAdd={() => handleAddItem(secilenUniversite, secilenUniversiteler, setSecilenUniversiteler, setSecilenUniversite)}
        items={secilenUniversiteler}
        onDelete={(item) => handleRemoveItem(item, secilenUniversiteler, setSecilenUniversiteler)}
      />

      {/* Bölümler */}
      <FilterSection
        title="Major"
        value={secilenBolum}
        options={MAJORS}
        onChange={handleSelectChange(setSecilenBolum)}
        onAdd={() => handleAddItem(secilenBolum, secilenBolumler, setSecilenBolumler, setSecilenBolum)}
        items={secilenBolumler}
        onDelete={(item) => handleRemoveItem(item, secilenBolumler, setSecilenBolumler)}
      />

      {/* Job Names */}
      <FilterSection
        title="Job Name"
        value={secilenJobName}
        options={jobNames}
        onChange={handleSelectChange(setSecilenJobName)}
        onAdd={() => handleAddItem(secilenJobName, secilenJobNames, setSecilenJobNames, setSecilenJobName)}
        items={secilenJobNames}
        onDelete={(item) => handleRemoveItem(item, secilenJobNames, setSecilenJobNames)}
      />

      {/* Status */}
      <FilterSection
        title="Applications Status"
        value={secilenBasvuruDurumu}
        options={ApplicationStatus}
        onChange={handleSelectChange(setSecilenBasvuruDurumu)}
        onAdd={() => handleAddItem(secilenBasvuruDurumu, secilenBasvuruDurumlari, setSecilenBasvuruDurumlari, setSecilenBasvuruDurumu)}
        items={secilenBasvuruDurumlari}
        onDelete={(item) => handleRemoveItem(item, secilenBasvuruDurumlari, setSecilenBasvuruDurumlari)}
      />

      {/* Cinsiyet */}
      <FilterSection
        title="Sex"
        value={secilenCinsiyet}
        options={Sex}
        onChange={handleSelectChange(setSecilenCinsiyet)}
        onAdd={() => handleAddItem(secilenCinsiyet, secilenCinsiyetler, setSecilenCinsiyetler, setSecilenCinsiyet)}
        items={secilenCinsiyetler}
        onDelete={(item) => handleRemoveItem(item, secilenCinsiyetler, setSecilenCinsiyetler)}
      />

      {/* Yaş Aralığı (tek select) */}
      <div className="filter-container">
        <h3 className="sidebar-title">Age Range</h3>
        <div className="filter-selector">
          <label>Age Range Select</label>
          <select
            value={selectedYasAraligi}
            onChange={e => {
              const val = e.target.value;
              setSelectedYasAraligi(val);
              if (val) {
                const [min, max] = val.split('-').map(Number);
                setCandidateMinAge(min);
                setCandidateMaxAge(max);
              } else {
                setCandidateMinAge(20);
                setCandidateMaxAge(28);
              }
            }}
          >
            <option value="">--Select--</option>
            {yas_araligi.map((opt, i) => (
              <option key={i} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
        <hr className="sidebar-divider" />
      </div>

      {/* İngilizce Seviyesi */}
      <FilterSection
        title="English Level"
        value={secilenDil}
        options={EnglishLevels}
        onChange={handleSelectChange(setSecilenDil)}
        onAdd={() => handleAddItem(secilenDil, secilenDiller, setSecilenDiller, setSecilenDil)}
        items={secilenDiller}
        onDelete={(item) => handleRemoveItem(item, secilenDiller, setSecilenDiller)}
      />

      {/* GPA Aralığı (tek select) */}
      <div className="filter-container">
        <h3 className="sidebar-title">GPA Range</h3>
        <div className="filter-selector">
          <label>GPA Range Select</label>
          <select
            value={selectedGpaOption}
            onChange={e => {
              const val = e.target.value;
              setSelectedGpaOption(val);
              if (val === 'Between 3.50 and 4.00') {
                setCandidateMinGPA(3.5);
                setCandidateMaxGPA(4.0);
              } else if (val === 'Between 3.00 and 3.50') {
                setCandidateMinGPA(3.0);
                setCandidateMaxGPA(3.5);
              } else if (val === 'Between 2.50 and 3.00') {
                setCandidateMinGPA(2.5);
                setCandidateMaxGPA(3.0);
              } else if (val === 'Between 2.00 and 2.50') {
                setCandidateMinGPA(2.0);
                setCandidateMaxGPA(2.5);
              } else {
                setCandidateMinGPA(0.0);
                setCandidateMaxGPA(4.0);
              }
            }}
          >
            <option value="">--Select--</option>
            {GpaOptions.map((opt, i) => (
              <option key={i} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
        <hr className="sidebar-divider" />
      </div>

      {/* Eğitim */}
      <FilterSection
        title="Class Year"
        value={SecilenEgitim}
        options={educations}
        onChange={handleSelectChange(setSecilenEgitim)}
        onAdd={() => handleAddItem(SecilenEgitim, secilenEgitimler, setSecilenEgitimler, setSecilenEgitim)}
        items={secilenEgitimler}
        onDelete={(item) => handleRemoveItem(item, secilenEgitimler, setSecilenEgitimler)}
      />

      {/* Mezuniyet Yılı */}
      <FilterSection
        title="Expected Graduation Year"
        value={secilenMezuniyetYili}
        options={Array.from({ length: 26 }, (_, i) => (2000 + i).toString())}  // 2000–2025
        onChange={handleSelectChange(setSecilenMezuniyetYili)}
        onAdd={() => handleAddItem(
          secilenMezuniyetYili,
          candidateExpectedGraduateYears,
          setCandidateExpectedGraduateYears,
          setSecilenMezuniyetYili
        )}
        items={candidateExpectedGraduateYears}
        onDelete={(year) => handleRemoveItem(
          year,
          candidateExpectedGraduateYears,
          setCandidateExpectedGraduateYears
        )}
      />

      {/* Application Date */}
      <div className="filter-container">
        <h3 className="sidebar-title">Application Date</h3>
        <div className="filter-selector">
          <label>Date:</label>
          <input
            type="date"
            value={applicationsDates}
            onChange={e => setApplicationsDates(e.target.value)}
            style={{ width: 150 }}
            placeholder="YYYY-MM-DD"
          />
        </div>
        <hr className="sidebar-divider" />
      </div>

      {/* Application Date Range */}
      <div className="filter-container">
        <h3 className="sidebar-title">Application Date Range</h3>
        <div className="filter-selector">
          <div style={{ marginBottom: '10px' }}>
            <label>Start Date:</label>
            <input
              type="date"
              value={applicationMinDate}
              onChange={e => setApplicationMinDate(e.target.value)}
              style={{ width: 150 }}
            />
          </div>
          <div>
            <label>End Date:</label>
            <input
              type="date"
              value={applicationMaxDate}
              onChange={e => setApplicationMaxDate(e.target.value)}
              style={{ width: 150 }}
            />
          </div>
        </div>
        <hr className="sidebar-divider" />
      </div>

      <div className="filter-container" style={{ textAlign: 'center' }}>
        <button className="apply-filter-button" onClick={applyFilter}>
          Apply Filter
        </button>
      </div>
    </div>
  );
}

// FilterSection component aynı kalabilir
function FilterSection({ title, value, options, onChange, onAdd, items, onDelete }) {
  return (
    <div className="filter-container">
      <h3 className="sidebar-title">{title}</h3>
      <div className="filter-selector">
        <label>{title} Select</label>
        <select value={value} onChange={onChange}>
          <option value="">--Select --</option>
          {options.map((opt, i) => (
            <option key={i} value={typeof opt === 'string' ? opt : opt.name || opt.title || opt}>
              {typeof opt === 'string' ? opt : opt.name || opt.title || opt}
            </option>
          ))}
        </select>
        <button onClick={onAdd}>Add</button>
      </div>

      {items.length > 0 && (
        <ul className="filter-list">
          {items.map((item, i) => (
            <li key={i}>
              {item}
              <button onClick={() => onDelete(item)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
      <hr className="sidebar-divider" />
    </div>
  );
}

export default Sidebar;
