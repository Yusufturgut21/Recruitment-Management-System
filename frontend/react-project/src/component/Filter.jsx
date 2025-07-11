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
    <>
      <div className="statistics-button-container">
        <button 
          className="statistics-btn-modern"
          onClick={fetchCandidates}
        >
          <i className="fas fa-chart-bar"></i> Statistics
        </button>
      </div>
      
      <div className="filter-card">
        <div className="filter-card-content">
          {/* Sol taraf */}
          <div className="filter-left">
            <div className="filter-header-container">
              <h3 className="filter-header">Filter Groups</h3>
            </div>

            {filtersBuffers.length === 0 && (
              <div className="empty-state">
                <i className="fas fa-filter empty-icon"></i>
                <p>No Filter Groups added yet.<br/>Create filters from the sidebar to get started.</p>
              </div>
            )}

            <div className="filter-buttons">
              {filtersBuffers.map(({ name, filters }) => (
                <button
                  key={name}
                  className="filter-btn"
                  onClick={() => setActiveBuffer({ name, filters })}
                >
                  <i className="fas fa-tag"></i> {name}
                </button>
              ))}
            </div>

            <button
              className="apply-filters-btn"
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
                      .catch(error => {
                        console.error('Error fetching candidate details:', error);
                        return candidate; // Hata durumunda orijinal adayı döndür
                      })
                    );
                    
                    // Tüm detay isteklerinin tamamlanmasını bekleyelim
                    Promise.all(detailPromises)
                      .then(detailedCandidates => {
                        // Detaylı bilgileri alınmış adayları güncelle
                        if (typeof window.updateCandidates === 'function') {
                          window.updateCandidates(detailedCandidates);
                        }
                        
                        // İstatistikler için de detaylı bilgileri kaydet
                        setCandidates(detailedCandidates);
                      });
                  })
                  .catch(error => {
                    console.error('Error:', error);
                    alert('Gönderimde hata oluştu.'); // Hata durumunda alert hala gösteriliyor
                  });
              }}
            >
              <i className="fas fa-search"></i> APPLY FILTERS
            </button>
          </div>

          <div className="filter-divider"></div>

          {/* Sağ taraf */}
          <div className="filter-right">
            <h4 className="sort-header">Sort By</h4>
            <button
              className="action-btn"
              onClick={() => {
                if (typeof window.sortCandidatesByAge === 'function') {
                  window.sortCandidatesByAge();
                }
              }}
            >
              <i className="fas fa-birthday-cake"></i> Age
            </button>
            <button
              className="action-btn"
              onClick={() => {
                if (typeof window.sortCandidatesByGPA === 'function') {
                  window.sortCandidatesByGPA();
                }
              }}
            >
              <i className="fas fa-graduation-cap"></i> GPA
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
                    
                    // Önce her aday için detaylı bilgileri alalım
                    const detailPromises = currentCandidates.map(candidate => 
                      fetch('http://127.0.0.1:8080/userside/get/candidate/details', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          candidateEmail: candidate.email || candidate.candidateEmail,
                          jobName: candidate.jobName
                        })
                      })
                      .then(response => {
                        if (!response.ok) throw new Error('Network response was not ok');
                        return response.json();
                      })
                      .catch(error => {
                        console.error('Error fetching candidate details:', error);
                        // Hata durumunda orijinal adayı döndür
                        return candidate;
                      })
                    );
                    
                    // Tüm detay isteklerinin tamamlanmasını bekleyelim
                    Promise.all(detailPromises)
                      .then(detailedCandidates => {
                        // Detaylı bilgileri alınmış adayları sırala
                        const sortedCandidates = [...detailedCandidates].sort((a, b) => {
                          // candidateEnglishLevel özelliğini kontrol et (API'den gelen doğru alan)
                          const levelA = (a.candidateEnglishLevel || '').toLowerCase();
                          const levelB = (b.candidateEnglishLevel || '').toLowerCase();
                          return levels.indexOf(levelB) - levels.indexOf(levelA);
                        });
                        
                        // Sıralanmış adayları window.updateCandidates fonksiyonu ile güncelle
                        if (typeof window.updateCandidates === 'function') {
                          window.updateCandidates(sortedCandidates);
                        }
                      })
                      .catch(error => {
                        console.error('Error sorting candidates by English level:', error);
                      });
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
              <i className="fas fa-language"></i> English Level
            </button>
            
            <button
              className="action-btn"
              onClick={() => {
                if (typeof window.sortCandidatesByEducationalStatus === 'function') {
                  window.sortCandidatesByEducationalStatus();
                }
              }}
            >
              <i className="fas fa-user-graduate"></i> Educational Status
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
              <button
                className="close-btn"
                onClick={() => setActiveBuffer(null)}
                style={{ position: 'absolute', top: '10px', right: '10px', zIndex: '1000', background: 'white', color: 'red', fontSize: '24px', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}
              >
                &times;
              </button>
              <h4 className="popup-title">{activeBuffer.name} Details</h4>
              <ul className="filter-details-list">
                {Object.entries(activeBuffer.filters).map(([key, value]) => (
                  <li key={key} className="filter-detail-item">
                    <span className="filter-key">{key}:</span>{' '}
                    <span className="filter-value">
                      {Array.isArray(value)
                        ? (value.length > 0 ? value.join(', ') : 'Not selected')
                        : (value !== '' && value !== null && value !== undefined ? value : 'Not selected')}
                    </span>
                  </li>
                ))}
              </ul>
              <button
                className="delete-btn"
                onClick={() => handleDeleteBuffer(activeBuffer.name)}
              >
                <i className="fas fa-trash-alt"></i> Delete Filter Group
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Filter;
