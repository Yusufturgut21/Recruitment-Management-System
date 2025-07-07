import React, { useState } from 'react';
import '../css/Filter.css';
import Statistics from './Statistics';

function Filter({ filtersBuffers, setFiltersBuffers }) {
  const [activeBuffer, setActiveBuffer] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const [candidates, setCandidates] = useState([]); // Aday verilerini tutmak için state

  const handleDeleteBuffer = (name) => {
    const filteredBuffers = filtersBuffers.filter(buffer => buffer.name !== name);
    setFiltersBuffers(filteredBuffers);
    setActiveBuffer(null);
  };

  // Aday verilerini almak için fonksiyon
  const fetchCandidates = () => {
    // Önce tüm adayların email ve jobName bilgilerini alalım
    fetch('http://localhost:8080/userside/filter/candidates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([{}]), // Boş filtre ile tüm adayları getir
    })
      .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
      })
      .then(data => {
        // Her aday için detaylı bilgileri alalım
        const detailPromises = data.map(candidate => 
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
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
          })
        );
        
        // Tüm detay isteklerinin tamamlanmasını bekleyelim
        return Promise.all(detailPromises);
      })
      .then(detailedCandidates => {
        // Detaylı aday bilgilerini state'e kaydedelim
        setCandidates(detailedCandidates);
        setShowStats(true); // Veriler yüklendikten sonra popup'ı göster
      })
      .catch(error => {
        console.error('Error fetching candidates:', error);
        alert('Aday bilgileri alınırken hata oluştu.');
      });
  };

  return (
    <div className="filter-card">
      <div className="filter-card-content">
        {/* Sol taraf */}
        <div className="filter-left">
          <div className="filter-header-container">
            <h3 className="filter-header">Filter Groups</h3>
            <button 
              className="filters-send statistics-btn-modern"
              onClick={fetchCandidates}
            >
              Statistics
            </button>
          </div>

          {filtersBuffers.length === 0 && <p>No Filter Groups added yet</p>}

          <div className="filter-buttons">
            {filtersBuffers.map(({ name, filters }) => (
              <button
                key={name}
                className="filter-btn"
                onClick={() => setActiveBuffer({ name, filters })}
              >
                {name}
              </button>
            ))}
          </div>

          <button
            className="filters-send"
            onClick={() => {
              const payload = filtersBuffers.map(buffer => buffer.filters);

              fetch('http://localhost:8080/userside/filter/candidates', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
              })
                .then(response => {
                  if (!response.ok) throw new Error('Network response was not ok');
                  return response.json();
                })
                .then(data => {
                  console.log('Filtered candidates:', data);
                  if (typeof window.updateCandidates === 'function') {
                    window.updateCandidates(data);
                  }
                  // Filtrelenmiş adayları istatistikler için de kaydediyoruz
                  setCandidates(data.map(c => ({
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
                    englishLevel: c.candidateEnglishLevel,
                    status: c.status || 'none',
                  })));
                  // Alert mesajını kaldırdık
                })
                .catch(error => {
                  console.error('Error:', error);
                  alert('Gönderimde hata oluştu.'); // Hata durumunda alert hala gösteriliyor
                });
            }}
          >
            APPLY FILTERS
          </button>
          
        
        </div>

        <div className="filter-divider"></div>

        {/* Sağ taraf */}
        <div className="filter-right">
          <button
            className="action-btn"
            onClick={() => {
              if (typeof window.sortCandidatesByAge === 'function') {
                window.sortCandidatesByAge();
              }
            }}
          >
            Age
          </button>
          <button
            className="action-btn"
            onClick={() => {
              if (typeof window.sortCandidatesByGPA === 'function') {
                window.sortCandidatesByGPA();
              }
            }}
          >
            GPA
          </button>
          <button
            className="action-btn"
            onClick={() => {
              // Mevcut adayları al (window.getCurrentCandidates fonksiyonunu çağıran bileşenden)
              if (typeof window.getCurrentCandidates === 'function') {
                const currentCandidates = window.getCurrentCandidates();
                
                if (currentCandidates && currentCandidates.length > 0) {
                  // İngilizce seviyesine göre sıralama
                  const levels = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2'];
                  const sortedCandidates = [...currentCandidates].sort(
                    (a, b) => {
                      // candidateEnglishLevel veya englishLevel özelliğini kontrol et
                      const levelA = ((a.candidateEnglishLevel || a.englishLevel || '')).toLowerCase();
                      const levelB = ((b.candidateEnglishLevel || b.englishLevel || '')).toLowerCase();
                      return levels.indexOf(levelB) - levels.indexOf(levelA);
                    }
                  );
                  
                  // Sıralanmış adayları window.updateCandidates fonksiyonu ile güncelle
                  if (typeof window.updateCandidates === 'function') {
                    window.updateCandidates(sortedCandidates);
                  }
                } else {
                  console.log('Sıralanacak aday bulunamadı.');
                }
              } else {
                // Eğer getCurrentCandidates fonksiyonu yoksa, window.sortCandidatesByEnglishLevel fonksiyonunu çağır
                if (typeof window.sortCandidatesByEnglishLevel === 'function') {
                  window.sortCandidatesByEnglishLevel();
                } else {
                  console.log('Sıralama fonksiyonu bulunamadı.');
                }
              }
            }}
          >
            English Level
          </button>

          
          <button
            className="action-btn"
            onClick={() => {
              if (typeof window.sortCandidatesByEducationalStatus === 'function') {
                window.sortCandidatesByEducationalStatus();
              }
            }}
          >
            Educational Status
          </button>
        </div>
      </div>

      {/* İstatistik popup'ı */}
      {showStats && (
        <div className="popup-overlay" onClick={() => setShowStats(false)}>
          <div className="popup-content large-popup" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowStats(false)}>
              &times;
            </button>
            <Statistics candidates={candidates} />
          </div>
        </div>
      )}

      {/* Filtre detay popup'ı */}
      {activeBuffer && (
        <div className="popup-overlay" onClick={() => setActiveBuffer(null)}>
          <div className="popup-content" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setActiveBuffer(null)}>
              &times;
            </button>
            <h4>{activeBuffer.name} Details</h4>
            <ul>
              {Object.entries(activeBuffer.filters).map(([key, value]) => (
                <li key={key}>
                  <strong>{key}:</strong>{' '}
                  {Array.isArray(value)
                    ? (value.length > 0 ? value.join(', ') : 'Not selected')
                    : (value !== '' && value !== null && value !== undefined ? value : 'Not selected')}
                </li>
              ))}
            </ul>
            <button
              className="delete-btn"
              onClick={() => handleDeleteBuffer(activeBuffer.name)}
            >
              Delete Filter Group
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Filter;
