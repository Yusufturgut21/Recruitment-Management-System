import React from 'react';
import "../css/Statistics.css";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell,
  ResponsiveContainer, LabelList, Label
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#a4de6c', '#d0ed57'];

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
  const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const Statistics = ({ candidates }) => {
  // Existing statistics functions
  const prepareUniversityData = () => {
    const data = candidates.reduce((acc, candidate) => {
      const university = candidate.candidateUniversity;
      const key = university || 'Belirtilmemiş';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  };

  const prepareStatusData = () => {
    const statusMap = {
      accept: 'Onaylanan',
      reject: 'Reddedilen',
      pending: 'Bekleyen',
      none: 'Belirtilmemiş'
    };
    const data = candidates.reduce((acc, candidate) => {
      const status = candidate.applicationStatus;
      const key = statusMap[status] || 'Belirtilmemiş';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  };

  const prepareGPAData = () => {
    const ranges = [
      { name: '0-2', min: 0, max: 2 },
      { name: '2-2.5', min: 2, max: 2.5 },
      { name: '2.5-3', min: 2.5, max: 3 },
      { name: '3-3.5', min: 3, max: 3.5 },
      { name: '3.5-4', min: 3.5, max: 4.01 }
    ];
    return ranges.map(range => ({
      name: range.name,
      count: candidates.filter(c => c.candidateGPA >= range.min && c.candidateGPA < range.max).length
    }));
  };

  const prepareEnglishLevelData = () => {
    const levelMap = {
      a1: 'A1 (Başlangıç)',
      a2: 'A2 (Temel)',
      b1: 'B1 (Orta)',
      b2: 'B2 (Orta Üstü)',
      c1: 'C1 (İleri)',
      c2: 'C2 (Ana Dil)'
    };
    const data = candidates.reduce((acc, candidate) => {
      const englishLevel = candidate.candidateEnglishLevel;
      const key = englishLevel ? (levelMap[englishLevel.toLowerCase()] || englishLevel) : 'Belirtilmemiş';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  };

  const prepareClassYearData = () => {
    const yearMap = {
      first: '1. Sınıf',
      second: '2. Sınıf',
      third: '3. Sınıf',
      fourth: '4. Sınıf',
      graduated: 'Mezun'
    };
    const data = candidates.reduce((acc, candidate) => {
      const currentYear = candidate.candidateCurrentYear;
      const key = currentYear ? (yearMap[currentYear.toLowerCase()] || currentYear) : 'Belirtilmemiş';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  };

  // New statistics functions
  const prepareGenderData = () => {
    const genderMap = {
      male: 'Erkek',
      female: 'Kadın',
      other: 'Diğer'
    };
    const data = candidates.reduce((acc, candidate) => {
      const sex = candidate.candidateSex;
      const key = sex ? (genderMap[sex.toLowerCase()] || sex) : 'Belirtilmemiş';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  };

  const prepareCityData = () => {
    const data = candidates.reduce((acc, candidate) => {
      const cityName = candidate.cityName;
      const key = cityName || 'Belirtilmemiş';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  };

  const prepareAgeData = () => {
    const ranges = [
      { name: '18-21', min: 18, max: 22 },
      { name: '22-25', min: 22, max: 26 },
      { name: '26-30', min: 26, max: 31 },
      { name: '30+', min: 31, max: 100 }
    ];

    return ranges.map(range => ({
      name: range.name,
      count: candidates.filter(c => {
        // Doğum tarihinden yaş hesaplama
        if (c.candidateBirthDay) {
          const birthDate = new Date(c.candidateBirthDay);
          const today = new Date();
          let age = today.getFullYear() - birthDate.getFullYear();
          const m = today.getMonth() - birthDate.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
          return age >= range.min && age < range.max;
        }
        return false;
      }).length
    }));
  };

  const prepareGraduationYearData = () => {
    const data = candidates.reduce((acc, candidate) => {
      const expectedGraduateYear = candidate.candidateExpectedGraduateYear;
      const key = expectedGraduateYear ? expectedGraduateYear.toString() : 'Belirtilmemiş';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  };

  const prepareJobPositionData = () => {
    const data = candidates.reduce((acc, candidate) => {
      const jobName = candidate.jobName;
      const key = jobName || 'Belirtilmemiş';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  };

  const prepareMajorData = () => {
    const data = candidates.reduce((acc, candidate) => {
      const major = candidate.candidateMajor;
      const key = major || 'Belirtilmemiş';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  };

  // Prepare all data
  const universityData = prepareUniversityData();
  const statusData = prepareStatusData();
  const gpaData = prepareGPAData();
  const English_Level = prepareEnglishLevelData();
  const classYearData = prepareClassYearData();
  const genderData = prepareGenderData();
  const cityData = prepareCityData();
  const ageData = prepareAgeData();
  const graduationYearData = prepareGraduationYearData();
  const jobPositionData = prepareJobPositionData();
  const majorData = prepareMajorData();

  return (
    <div className="statistics-container">
      <div className="statistics-header">
        <h2>Aday İstatistikleri</h2>
        <div className="total-candidates">Toplam Aday: {candidates.length}</div>
      </div>

      <div className="statistics-content">
        {/* University Distribution */}
        <div className="chart-row">
          <div className="wide-chart-card">
            <h3>Üniversite Dağılımı</h3>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={universityData}
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={renderCustomizedLabel}
                  labelLine={false}
                >
                  {universityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name, props) => [`${value} aday`, props.payload.name]} />
                <Legend layout="vertical" align="right" verticalAlign="middle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Application Status */}
        <div className="chart-row">
          <div className="wide-chart-card">
            <h3>Başvuru Durumları</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={statusData} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name">
                  <Label value="Başvuru Durumu" offset={-50} position="insideBottom" />
                </XAxis>
                <YAxis>
                  <Label value="Aday Sayısı" angle={-90} position="insideLeft" />
                </YAxis>
                <Tooltip formatter={(value, name, props) => [`${value} aday`, props.payload.name]} />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" name="Aday Sayısı">
                  <LabelList dataKey="value" position="top" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GPA Distribution */}
        <div className="chart-row">
          <div className="wide-chart-card">
            <h3>GPA Dağılımı</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={gpaData} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name">
                  <Label value="GPA Aralığı" offset={-50} position="insideBottom" />
                </XAxis>
                <YAxis>
                  <Label value="Aday Sayısı" angle={-90} position="insideLeft" />
                </YAxis>
                <Tooltip formatter={(value, name, props) => [`${value} aday`, props.payload.name]} />
                <Legend />
                <Bar dataKey="count" fill="#82ca9d" name="Aday Sayısı">
                  <LabelList dataKey="count" position="top" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* English Level */}
        <div className="chart-row">
          <div className="wide-chart-card">
            <h3>İngilizce Seviyeleri</h3>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={English_Level}
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={renderCustomizedLabel}
                  labelLine={false}
                >
                  {English_Level.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name, props) => [`${value} aday`, props.payload.name]} />
                <Legend layout="vertical" align="right" verticalAlign="middle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Class Year Distribution */}
        <div className="chart-row">
          <div className="wide-chart-card">
            <h3>Sınıf Dağılımı</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={classYearData} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name">
                  <Label value="Sınıf" offset={-50} position="insideBottom" />
                </XAxis>
                <YAxis>
                  <Label value="Aday Sayısı" angle={-90} position="insideLeft" />
                </YAxis>
                <Tooltip formatter={(value, name, props) => [`${value} aday`, props.payload.name]} />
                <Legend />
                <Bar dataKey="value" fill="#ffc658" name="Aday Sayısı">
                  <LabelList dataKey="value" position="top" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gender Distribution */}
        <div className="chart-row">
          <div className="wide-chart-card">
            <h3>Cinsiyet Dağılımı</h3>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={genderData}
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={renderCustomizedLabel}
                  labelLine={false}
                >
                  {genderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name, props) => [`${value} aday`, props.payload.name]} />
                <Legend layout="vertical" align="right" verticalAlign="middle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* City Distribution */}
        <div className="chart-row">
          <div className="wide-chart-card">
            <h3>Şehir Dağılımı</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={cityData} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name">
                  <Label value="Şehirler" offset={-50} position="insideBottom" />
                </XAxis>
                <YAxis>
                  <Label value="Aday Sayısı" angle={-90} position="insideLeft" />
                </YAxis>
                <Tooltip formatter={(value, name, props) => [`${value} aday`, props.payload.name]} />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" name="Aday Sayısı">
                  <LabelList dataKey="value" position="top" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Age Distribution */}
        <div className="chart-row">
          <div className="wide-chart-card">
            <h3>Yaş Dağılımı</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={ageData} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name">
                  <Label value="Yaş Aralığı" offset={-50} position="insideBottom" />
                </XAxis>
                <YAxis>
                  <Label value="Aday Sayısı" angle={-90} position="insideLeft" />
                </YAxis>
                <Tooltip formatter={(value, name, props) => [`${value} aday`, props.payload.name]} />
                <Legend />
                <Bar dataKey="count" fill="#82ca9d" name="Aday Sayısı">
                  <LabelList dataKey="count" position="top" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Graduation Year Distribution */}
        <div className="chart-row">
          <div className="wide-chart-card">
            <h3>Mezuniyet Yılı Dağılımı</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={graduationYearData} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name">
                  <Label value="Mezuniyet Yılı" offset={-50} position="insideBottom" />
                </XAxis>
                <YAxis>
                  <Label value="Aday Sayısı" angle={-90} position="insideLeft" />
                </YAxis>
                <Tooltip formatter={(value, name, props) => [`${value} aday`, props.payload.name]} />
                <Legend />
                <Bar dataKey="value" fill="#ffc658" name="Aday Sayısı">
                  <LabelList dataKey="value" position="top" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Job Position Distribution */}
        <div className="chart-row">
          <div className="wide-chart-card">
            <h3>Başvurulan Pozisyonlar</h3>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={jobPositionData}
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={renderCustomizedLabel}
                  labelLine={false}
                >
                  {jobPositionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name, props) => [`${value} aday`, props.payload.name]} />
                <Legend layout="vertical" align="right" verticalAlign="middle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Major Distribution */}
        <div className="chart-row">
          <div className="wide-chart-card">
            <h3>Bölüm Dağılımı</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={majorData} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name">
                  <Label value="Bölümler" offset={-50} position="insideBottom" />
                </XAxis>
                <YAxis>
                  <Label value="Aday Sayısı" angle={-90} position="insideLeft" />
                </YAxis>
                <Tooltip formatter={(value, name, props) => [`${value} aday`, props.payload.name]} />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" name="Aday Sayısı">
                  <LabelList dataKey="value" position="top" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;



