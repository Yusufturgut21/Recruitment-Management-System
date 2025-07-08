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
  const [hideStatusButtons, setHideStatusButtons] = useState(false);

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
          await fetchCandidateDetails(data);
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

        await fetchCandidateDetails(allCandidates);
      } catch (error) {
        console.error('Error fetching candidates:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    // Her aday için detay bilgilerini çek
    const fetchCandidateDetails = async (candidates) => {
      try {
        // Tekrarlanan adayları kaldır
        const uniqueCandidates = Array.from(new Map(candidates.map(c =>
          [c.candidateEmail, c])).values());
        
        // Her aday için detay bilgilerini al
        const detailPromises = uniqueCandidates.map(candidate => 
          fetch('http://127.0.0.1:8080/userside/get/candidate/details', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              candidateEmail: candidate.candidateEmail,
              jobName: candidate.jobName
            })
          })
          .then(response => {
            if (!response.ok) {
              console.warn(`Could not fetch details for ${candidate.candidateEmail}, using basic info`);
              return candidate;
            }
            return response.json();
          })
          .catch(error => {
            console.error(`Error fetching details for ${candidate.candidateEmail}:`, error);
            return candidate;
          })
        );
        
        const detailedCandidates = await Promise.all(detailPromises);
        
        setCandidates(detailedCandidates.map(c => {
          // Calculate age if birthDay exists but age doesn't
          let calculatedAge = c.candidateAge;
          if (!calculatedAge && c.candidateBirthDay) {
            calculatedAge = calculateAge(c.candidateBirthDay);
          }
          
          return {
            id: c.candidateId || c.candidateEmail,
            name: c.candidateName,
            surname: c.candidateSurname,
            email: c.candidateEmail,
            university: c.candidateUniversity,
            major: c.candidateMajor,
            jobName: c.jobName,
            age: calculatedAge, // Use calculated age or the one from API
            gpa: c.candidateGPA,
            currentYear: c.candidateCurrentYear,
            englishLevel: c.candidateEnglishLevel,
            status: c.applicationStatus || c.status || 'none',
          };
        }));
        
        setLoading(false);
      } catch (error) {
        console.error('Error processing candidate details:', error);
        setError(error.message);
        setLoading(false);
      }
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
    const order = ['graduated', 'fourth', 'third', 'second', 'first'];
  
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
        filteredCandidates.map(c => {
          // Calculate age if birthDay exists but age doesn't
          let calculatedAge = c.candidateAge;
          if (!calculatedAge && c.candidateBirthDay) {
            calculatedAge = calculateAge(c.candidateBirthDay);
          }
          
          return {
            id: c.candidateId || c.candidateEmail,
            name: c.candidateName,
            surname: c.candidateSurname,
            email: c.candidateEmail,
            university: c.candidateUniversity,
            major: c.candidateMajor,
            jobName: c.jobName,
            age: calculatedAge, // Use calculated age or the one from API
            gpa: c.candidateGPA,
            currentYear: c.candidateCurrentYear,
            englishLevel: c.candidateEnglishLevel,
            status: c.applicationStatus || c.status || 'none',
          };
        })
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
    if (!birthday) return null;
    
    try {
      const birth = new Date(birthday);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      return age;
    } catch (error) {
      console.error('Error calculating age:', error);
      return null;
    }
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
            <div className="candidate-header">
              <div className="candidate-name">
                {candidate.name} {candidate.surname}
                {candidate.age && <span className="candidate-age">{candidate.age} years</span>}
              </div>
              {candidate.englishLevel && (
                <div className={`candidate-badge english-level ${candidate.englishLevel.toLowerCase()}`}>
                  {candidate.englishLevel.toUpperCase()}
                </div>
              )}
            </div>

            <div className="candidate-body">
              <div className="candidate-info-grid">
                <div className="info-item">
                  <div className="info-label">University</div>
                  <div className="info-value">{candidate.university || 'Not specified'}</div>
                </div>

                <div className="info-item">
                  <div className="info-label">Major</div>
                  <div className="info-value">{candidate.major || 'Not specified'}</div>
                </div>

                <div className="info-item">
                  <div className="info-label">Class Year</div>
                  <div className="info-value">{candidate.currentYear || 'Not specified'}</div>
                </div>

                {candidate.gpa && (
                  <div className="info-item">
                    <div className="info-label">GPA</div>
                    <div className="info-value">{candidate.gpa}</div>
                  </div>
                )}
              </div>
            </div>

            <div className="candidate-footer">
              <button
                className="detail-btn"
                onClick={() => {
                  setSelected(candidate);

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
                      console.log("API response:", data);
                      setSelected({
                        ...candidate,
                        phone: data.candidatePhone || "Not specified",
                        birthDay: data.candidateBirthDay || "Not specified",
                        sex: data.candidateSex || "Not specified",
                        expectedGraduateYear: data.candidateExpectedGraduateYear || "Not specified",
                        cityName: data.cityName || "Not specified",
                        applicationStatus: data.applicationStatus || "Not specified",
                        englishLevel: data.candidateEnglishLevel || "Not specified",
                      });
                    })
                    .catch(error => {
                      console.error('Error fetching candidate details:', error);
                    });
                }}
              >
                <i className="fas fa-info-circle"></i> Details
              </button>
            </div>
          </div>
        ))
      )}

      {selected && (
        <div
          className="popup-overlay"
          onClick={() => setSelected(null)}
        >
          <div
            className="popup-content detail-popup"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="close-btn"
              onClick={() => setSelected(null)}
              style={{ position: 'absolute', top: '10px', right: '10px', zIndex: '1000', background: 'white', color: 'red', fontSize: '24px', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}
            >
              &times;
            </button>
            
            <div className="detail-header">
              <h2>{selected.name} {selected.surname}</h2>
              <div className="detail-badges">
                {selected.englishLevel && (
                  <span className="detail-badge english">{selected.englishLevel.toUpperCase()}</span>
                )}
                {selected.applicationStatus && (
                  <span className={`detail-badge status-${selected.applicationStatus}`}>
                    {selected.applicationStatus === 'accept' && 'Approved'}
                    {selected.applicationStatus === 'pending' && 'Pending'}
                    {selected.applicationStatus === 'reject' && 'Rejected'}
                    {!['accept', 'pending', 'reject'].includes(selected.applicationStatus) && selected.applicationStatus}
                  </span>
                )}
              </div>
            </div>
            
            <div className="detail-content">
           
              <div className="detail-section">
                <h3>Personal Information</h3>
                <div className="detail-grid">
                  {selected.email && (
                    <div className="detail-item">
                      <div className="detail-info">
                        <div className="detail-label">Email</div>
                        <div className="detail-value">{selected.email}</div>
                      </div>
                    </div>
                  )}
                  
                  {selected.phone && (
                    <div className="detail-item">
                      <div className="detail-info">
                        <div className="detail-label">phone number</div>
                        <div className="detail-value">{selected.phone}</div>
                      </div>
                    </div>
                  )}
                  
                  {selected.age && (
                    <div className="detail-item">
                      <div className="detail-info">
                        <div className="detail-label">Age</div>
                        <div className="detail-value">{selected.age}</div>
                      </div>
                    </div>
                  )}
                  
                  {selected.sex && (
                    <div className="detail-item">
                      <div className="detail-info">
                        <div className="detail-label">Gender</div>
                        <div className="detail-value">{selected.sex}</div>
                      </div>
                    </div>
                  )}
                  
                  {selected.cityName && (
                    <div className="detail-item">
                      <div className="detail-info">
                        <div className="detail-label">City</div>
                        <div className="detail-value">{selected.cityName}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="detail-section">
                <h3>Education Information</h3>
                <div className="detail-grid">
                  {selected.university && (
                    <div className="detail-item">
                      <div className="detail-info">
                        <div className="detail-label">University</div>
                        <div className="detail-value">{selected.university}</div>
                      </div>
                    </div>
                  )}
                  
                  {selected.major && (
                    <div className="detail-item">
                      <div className="detail-info">
                        <div className="detail-label">Major</div>
                        <div className="detail-value">{selected.major}</div>
                      </div>
                    </div>
                  )}
                  
                  {selected.currentYear && (
                    <div className="detail-item">
                      <div className="detail-info">
                        <div className="detail-label">Class</div>
                        <div className="detail-value">{selected.currentYear}</div>
                      </div>
                    </div>
                  )}
                  
                  {selected.gpa && (
                    <div className="detail-item">
                      <div className="detail-info">
                        <div className="detail-label">GPA</div>
                        <div className="detail-value">{selected.gpa}</div>
                      </div>
                    </div>
                  )}
                  
                  {selected.expectedGraduateYear && (
                    <div className="detail-item">
                      <div className="detail-info">
                        <div className="detail-label">Graduation Year</div>
                        <div className="detail-value">{selected.expectedGraduateYear}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="detail-section">
                <h3>Application Information</h3>
                <div className="detail-grid">
                  {selected.jobName && (
                    <div className="detail-item">
                      <div className="detail-info">
                        <div className="detail-label">Position Name</div>
                        <div className="detail-value">{selected.jobName}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="detail-actions">
              <button
                className="download-cv-btn"
                onClick={() => downloadCV(selected)}
              >
                <i className="fas fa-file-download"></i> Download CV
              </button>
              
            {!hideStatusButtons &&(
                  <div className="status-buttons">
                <button
                  className="btn approve"
                  onClick={() => {
                    setConfirmStatus('accept');
                    setConfirmAction(() => async () => {
                      try {
                        await updateStatus(selected.email, selected.jobName, 'accept');
                        setCandidates(prev =>
                          prev.map(c => (c.email === selected.email ? { ...c, status: 'accept' } : c))
                        );
                        setSelected(null);
                        setShowConfirmModal(false);
                        setHideStatusButtons(true);
                      } catch (error) {
                        console.error('Status update failed:', error);
                        setShowConfirmModal(false);
                      }
                    });
                    setShowConfirmModal(true);
                  }}
                >
                  <i className="fas fa-check"></i> Approve
                </button>
                <button
                  className="btn reject"
                  onClick={() => {
                    setConfirmStatus('reject');
                    setConfirmAction(() => async () => {
                      try {
                        await updateStatus(selected.email, selected.jobName, 'reject');
                        setCandidates(prev =>
                          prev.map(c => (c.email === selected.email ? { ...c, status: 'reject' } : c))
                        );
                        setSelected(null);
                        setShowConfirmModal(false);
                        setHideStatusButtons(true);
                      } catch (error) {
                        console.error('Status update failed:', error);
                        setShowConfirmModal(false);
                      }
                    });
                    setShowConfirmModal(true);
                  }}
                >
                  <i className="fas fa-times"></i> Reject
                </button>
              </div>)}
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
            <h3>Confirm Action</h3>
            <p>
              {confirmStatus === 'accept' && "Are you sure you approve the candidate?"}
              {confirmStatus === 'pending' && "Are you sure you want to put the candidate on hold?"}
              {confirmStatus === 'reject' && "Are you sure you want to reject this candidate?"}
            </p>
            <div className="confirm-buttons">
              <button
                className="btn confirm-yes"
                onClick={confirmAction}
              >
                Confirm
              </button>
              <button
                className="btn confirm-no"
                onClick={() => setShowConfirmModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
