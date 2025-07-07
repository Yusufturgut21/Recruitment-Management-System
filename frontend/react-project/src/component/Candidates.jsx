import React, { useState, useEffect } from 'react';
import '../css/Candidates.css';
// Candidates.js en üste ekleyin


const updateStatus = async (candidateEmail, jobName, status) => {
  try {
    console.log('Gönderilen veri:', {
      candidateEmail,
      jobName,
      applicationStatus: status
    });

    const response = await fetch('http://localhost:8080/userside/status/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        candidateEmail: candidateEmail,
        jobName: jobName,
        applicationStatus: status // PENDING, APPROVED veya REJECTED olmalı
      }),
    });

    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`Durum güncellenemedi: ${response.status} - ${errorText}`);
    }

    const result = await response.text();
    console.log('Success response:', result);
    // Alert mesajını kaldırdık
    return result;
  } catch (error) {
    console.error('Hata oluştu:', error);
    alert('Durum güncellenirken hata oluştu: ' + error.message);
    throw error;
  }
};

// Status değerlerini CSS sınıflarına eşleştiren nesne
const statusClasses = {
  accept: 'candidate-approved',
  reject: 'candidate-rejected',
  pending: 'candidate-pending',
  none: '',
}; // Bu fonksiyonu global olarak erişilebilir yap

export default function Candidates() {
  const [candidates, setCandidates] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // State'e onay modalı için yeni değişkenler ekleyelim
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmStatus, setConfirmStatus] = useState('');

  // Sayfa yüklendiğinde adayları getir
  useEffect(() => {
    // Farklı filtrelerle birden fazla istek gönder
    const fetchAllCandidates = async () => {
      setLoading(true);
      try {
        // Önce tüm üniversiteleri çek
        const uniResponse = await fetch('http://localhost:8080/userside/get/universities');
        if (!uniResponse.ok) {
          throw new Error(`Failed to fetch universities: ${uniResponse.status}`);
        }
        const universities = await uniResponse.json();

        // Eğer üniversite listesi boşsa, tüm adayları getir
        if (!universities || universities.length === 0) {
          const response = await fetch('http://localhost:8080/userside/filter/candidates', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify([{}]) // Boş filtre ile tüm adayları getir
          });

          if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.status}`);
          }

          const data = await response.json();
          processAndSetCandidates(data);
          return;
        }

        // Her üniversite için ayrı istek gönder
        let allCandidates = [];

        for (const university of universities) {
          const response = await fetch('http://localhost:8080/userside/filter/candidates', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify([{
              candidateUniversities: [university]
            }])
          });

          if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.status}`);
          }

          const data = await response.json();
          allCandidates = [...allCandidates, ...data];
        }

        processAndSetCandidates(allCandidates);
      } catch (error) {
        console.error('Error fetching candidates:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    // Adayları işle ve state'e kaydet
    const processAndSetCandidates = (candidates) => {
      // Tekrarlanan adayları kaldır
      const uniqueCandidates = Array.from(new Map(candidates.map(c =>
        [c.candidateEmail, c])).values());

      setCandidates(uniqueCandidates.map(c => ({
        id: c.candidateId || c.candidateEmail,
        name: c.candidateName,
        surname: c.candidateSurname,
        email: c.candidateEmail,
        university: c.candidateUniversity,
        major: c.candidateMajor,
        jobName: c.jobName,
        age: c.candidateAge,
        gpa: c.candidateGPA,
        currentYear: c.candidateCurrentYear,
        englishLevel: c.candidateEnglishLevel || "Not specified",
        status: c.status || 'none',
      })));

      setLoading(false);
    };

    fetchAllCandidates();
  }, []);

  // GPA'ya göre sıralama fonksiyonu
  function sortByGPA() {
    setCandidates(prev =>
      [...prev].sort((a, b) => b.gpa - a.gpa)
    );
  }

  // GPA sıralama fonksiyonunu global olarak erişilebilir yap
  useEffect(() => {
    window.sortCandidatesByGPA = sortByGPA;
    return () => {
      delete window.sortCandidatesByGPA;
    };
  }, []);

  // Yaşa göre sıralama fonksiyonu (küçükten büyüğe)
  function sortByAge() {
    setCandidates(prev =>
      [...prev].sort((a, b) => a.age - b.age)
    );
  }

  // Yaş sıralama fonksiyonunu global olarak erişilebilir yap
  useEffect(() => {
    window.sortCandidatesByAge = sortByAge;
    return () => {
      delete window.sortCandidatesByAge;
    };
  }, []);


  // İngilizce seviyesine göre sıralama fonksiyonu
  function sortByEnglishLevel() {
    // Sıralama için seviyeleri belirle
    const levels = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2'];
    setCandidates(prev =>
      [...prev].sort(
        (a, b) =>
          levels.indexOf((b.englishLevel || '').toLowerCase()) -
          levels.indexOf((a.englishLevel || '').toLowerCase())
      )
    );
  }

  // İngilizce seviyesi sıralama fonksiyonunu global olarak erişilebilir yap
  useEffect(() => {
    window.sortCandidatesByEnglishLevel = sortByEnglishLevel;
    return () => {
      delete window.sortCandidatesByEnglishLevel;
    };
  }, []);

  // Eğitim durumuna göre sıralama fonksiyonu
  function sortByEducationalStatus() {
    // Sıralama için seviyeleri belirle (örnek: graduated > senior > junior > sophomore > freshman)
    const order = ['graduated', 'senior', 'junior', 'sophomore', 'freshman'];
    setCandidates(prev =>
      [...prev].sort(
        (a, b) =>
          order.indexOf((a.currentYear || '').toLowerCase()) -
          order.indexOf((b.currentYear || '').toLowerCase())
      )
    );
  }

  // Eğitim durumu sıralama fonksiyonunu global olarak erişilebilir yap
  useEffect(() => {
    window.sortCandidatesByEducationalStatus = sortByEducationalStatus;
    return () => {
      delete window.sortCandidatesByEducationalStatus;
    };
  }, []);

  useEffect(() => {
    window.updateCandidates = function (filteredCandidates) {
      setCandidates(
        filteredCandidates.map(c => ({
          id: c.candidateId || c.candidateEmail,
          name: c.candidateName,
          surname: c.candidateSurname,
          email: c.candidateEmail,
          university: c.candidateUniversity,
          major: c.candidateMajor,
          jobName: c.jobName,
          age: c.candidateAge,
          gpa: c.candidateGPA,
          currentYear: c.candidateCurrentYear,
          englishLevel: c.candidateEnglishLevel, // İngilizce seviyesi bilgisini ekledik
          status: c.status || 'none',
        }))
      );
    };

    return () => {
      delete window.updateCandidates;
    };
  }, []);


  // updateStatus fonksiyonu artık global olarak tanımlanmış
  // const updateStatus = (id, newStatus) => {
  //   setCandidates(prev =>
  //     prev.map(c => (c.id === id ? { ...c, status: newStatus } : c))
  //   );
  //   setSelected(null);
  // };

  const downloadCV = candidate => {
    fetch(`http://localhost:8080/userside/download/cv`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `email=${encodeURIComponent(candidate.email)}`,
    })
      .then(async res => {
        if (!res.ok) {
          const errorText = await res.text();
          console.error('Server error response:', errorText);

          if (res.status === 404) {
            throw new Error('Bu aday için CV bulunamadı');
          } else if (res.status === 500) {
            throw new Error('Sunucu hatası: CV indirilemedi');
          } else {
            throw new Error(`CV indirilemedi (${res.status})`);
          }
        }
        return res.blob();
      })
      .then(blob => {
        if (blob.size === 0) {
          throw new Error('İndirilen CV dosyası boş');
        }

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute(
          'download',
          `${candidate.name}_${candidate.surname}_CV.pdf`
        );
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      })
      .catch(err => {
        console.error('Error downloading CV:', err);
        alert('CV indirilirken bir hata oluştu: ' + err.message);
      });
  };


  if (loading) {
    return <div className="loader">Loading candidates...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }
  function calculateAge(birthday) {
    const birth = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }
  return (

    <div className="candidates-container">
      {candidates.length === 0 ? (
        <p className="no-data">No candidates found.</p>
      ) : (
        candidates.map(candidate => (
          <div
            key={candidate.id}
            className={`candidate-card ${statusClasses[candidate.status]}`}
          >
            <div className="candidate-info">
              <p>
                <strong></strong> {candidate.name} {candidate.surname} {candidate.age ? `(${candidate.age})` : ''}
              </p>

              <p>
                <strong>University:</strong> {candidate.university || 'Not specified'}
              </p>
              <p>
                <strong>Major:</strong> {candidate.major || 'Not specified'}
              </p>

              <p>
                <strong>Class Year:</strong> {candidate.currentYear || 'Not specified'}
              </p>
            </div>
            <button
              className="detail-btn"
              onClick={() => {
                // Önce adayı seçili olarak ayarla
                setSelected(candidate);

                // Ardından API'den detaylı bilgileri al
                fetch('http://127.0.0.1:8080/userside/get/candidate/details', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    candidateEmail: candidate.email,
                    jobName: candidate.jobName
                  })
                })
                  .then(response => {
                    if (!response.ok) {
                      throw new Error('Failed to fetch candidate details');
                    }
                    return response.json();
                  })
                  .then(data => {
                    console.log("API response:", data); // Debug için API yanıtını logla
                    // API'den gelen detaylı bilgilerle seçili adayı güncelle
                    setSelected({
                      ...candidate,
                      phone: data.candidatePhone || "Not specified",
                      birthDay: data.candidateBirthDay || "Not specified",
                      sex: data.candidateSex || "Not specified",
                      expectedGraduateYear: data.candidateExpectedGraduateYear || "Not specified",
                      cityName: data.cityName || "Not specified",
                      applicationStatus: data.applicationStatus || "Not specified",
                      englishLevel: data.candidateEnglishLevel || "Not specified", // İngilizce seviyesi
                      // Diğer alanları da ekleyebilirsiniz
                    });
                  })
                  .catch(error => {
                    console.error('Error fetching candidate details:', error);
                    // Hata durumunda mevcut bilgilerle devam et
                  });
              }}
            >
              Detay
            </button>
          </div>
        ))
      )}

      {selected && (
        <div
          className="popup-overlay"
          onClick={() => setSelected(null)}
        >
          <div
            className="popup-content"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="close-btn"
              onClick={() => setSelected(null)}
            >
              &times;
            </button>
            <h3>Detaylar</h3>
            <div className="details">
              {Object.entries(selected).map(([key, value]) => {
                if (['status', 'id'].includes(key)) return null;

                // Değer kontrolü yap, undefined veya null ise "Not specified" göster
                const displayValue = value !== undefined && value !== null ? String(value) : "Not specified";

                // Alan isimlerini daha kullanıcı dostu hale getir
                let label;
                switch (key) {
                  case 'university':
                    label = 'University';
                    break;
                  case 'major':
                    label = 'Major';
                    break;
                  case 'currentYear':
                    label = 'Current Year';
                    break;
                  case 'jobName':
                    label = 'Job';
                    break;
                  case 'age':
                    label = 'Age';
                    break;
                  case 'gpa':
                    label = 'GPA';
                    break;
                  case 'email':
                    label = 'Email';
                    break;
                  case 'englishLevel': // İngilizce seviyesi için durum ekledik
                    label = 'English Level';
                    break;
                  // Eksik alanlar için yer tutucu
                  case 'phone':
                    label = 'Phone';
                    break;
                  case 'expectedGraduateYear':
                    label = 'Expected Graduation Year';
                    break;
                  case 'sex':
                    label = 'Gender';
                    break;
                  default:
                    label = key.charAt(0).toUpperCase() + key.slice(1);
                }

                return (
                  <p key={key}>
                    <strong>{label}:</strong> {displayValue}
                  </p>
                );
              })}

              {/* Eksik alanlar için bilgi mesajını kaldırdık */}
            </div>

            <button
              className="download-jv-btn"
              onClick={() => downloadCV(selected)}
            >
              CV İndir
            </button>

            <div className="popup-buttons">
              <button
                className="btn approve"
                onClick={() => {
                  // Onay modalını göster ve onay işlemini hazırla
                  setConfirmStatus('accept');
                  setConfirmAction(() => async () => {
                    try {
                      await updateStatus(selected.email, selected.jobName, 'accept');
                      // UI'ı güncelle
                      setCandidates(prev =>
                        prev.map(c => (c.email === selected.email ? { ...c, status: 'accept' } : c))
                      );
                      setSelected(null);
                      setShowConfirmModal(false);
                    } catch (error) {
                      console.error('Status update failed:', error);
                      setShowConfirmModal(false);
                    }
                  });
                  setShowConfirmModal(true);
                }}
              >
                Onayla
              </button>
              <button
                className="btn pending"
                onClick={() => {
                  // Onay modalını göster ve onay işlemini hazırla
                  setConfirmStatus('pending');
                  setConfirmAction(() => async () => {
                    try {
                      await updateStatus(selected.email, selected.jobName, 'pending');
                      // UI'ı güncelle
                      setCandidates(prev =>
                        prev.map(c => (c.email === selected.email ? { ...c, status: 'pending' } : c))
                      );
                      setSelected(null);
                      setShowConfirmModal(false);
                    } catch (error) {
                      console.error('Status update failed:', error);
                      setShowConfirmModal(false);
                    }
                  });
                  setShowConfirmModal(true);
                }}
              >
                Beklet
              </button>
              <button
                className="btn reject"
                onClick={() => {
                  // Onay modalını göster ve onay işlemini hazırla
                  setConfirmStatus('reject');
                  setConfirmAction(() => async () => {
                    try {
                      await updateStatus(selected.email, selected.jobName, 'reject');
                      // UI'ı güncelle
                      setCandidates(prev =>
                        prev.map(c => (c.email === selected.email ? { ...c, status: 'reject' } : c))
                      );
                      setSelected(null);
                      setShowConfirmModal(false);
                    } catch (error) {
                      console.error('Status update failed:', error);
                      setShowConfirmModal(false);
                    }
                  });
                  setShowConfirmModal(true);
                }}
              >
                Reddet
              </button>
            </div>

          </div>
        </div>
      )}
      {/* Onay modalı */}
      {showConfirmModal && (
        <div
          className="popup-overlay"
          onClick={() => setShowConfirmModal(false)}
        >
          <div
            className="popup-content confirm-modal"
            onClick={e => e.stopPropagation()}
          >
            <h3>Onay</h3>
            <p>
              {confirmStatus === 'accept' && "Adayı onayladığınızdan emin misiniz?"}
              {confirmStatus === 'pending' && "Adayı bekletmek istediğinizden emin misiniz?"}
              {confirmStatus === 'reject' && "Adayı reddetmek istediğinizden emin misiniz?"}
            </p>
            <div className="confirm-buttons">
              <button
                className="btn confirm-yes"
                onClick={confirmAction}
              >
                Onayla
              </button>
              <button
                className="btn confirm-no"
                onClick={() => setShowConfirmModal(false)}
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
