import React, { useState } from 'react';
import Header from './component/Header';
import Sidebar from './component/Sidebar';
import Filter from './component/Filter';
import Candidates from './component/Candidates';

function App() {
  const [filtersBuffers, setFiltersBuffers] = useState([]);

  // Yeni filtre buffer ekleme
  const handleFilterApply = (bufferName, filters) => {
    setFiltersBuffers(prev => [...prev, { name: bufferName, filters }]);
  };

  return (
    <>
      <Header />
      <div style={{ display: 'flex', gap: '20px' }}>
        <Sidebar onFilterApply={handleFilterApply} />
        {/* Yan yana duran filtre ve sidebar */}
        <div style={{ flex: 1 }}>
          <Filter filtersBuffers={filtersBuffers} setFiltersBuffers={setFiltersBuffers} />
          {/* Filter'ın altında Candidates */}
          <Candidates />
        </div>
      </div>
    </>
  );
}

export default App;
