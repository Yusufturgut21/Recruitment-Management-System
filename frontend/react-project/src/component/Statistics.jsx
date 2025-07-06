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
    const data = candidates.reduce((acc, { university }) => {
      const key = university || 'Belirtilmemiş';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  };

  const prepareStatusData = () => {
    const statusMap = {
      approved: 'Onaylanan',
      rejected: 'Reddedilen',
      pending: 'Bekleyen',
      none: 'Belirtilmemiş'
    };
    const data = candidates.reduce((acc, { status }) => {
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
      count: candidates.filter(c => c.gpa >= range.min && c.gpa < range.max).length
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
    const data = candidates.reduce((acc, { englishLevel }) => {
      const key = englishLevel ? (levelMap[englishLevel.toLowerCase()] || englishLevel) : 'Belirtilmemiş';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  };

  const prepareClassYearData = () => {
    const yearMap = {
      freshman: '1. Sınıf',
      sophomore: '2. Sınıf',
      junior: '3. Sınıf',
      senior: '4. Sınıf',
      graduated: 'Mezun'
    };
    const data = candidates.reduce((acc, { currentYear }) => {
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
    const data = candidates.reduce((acc, { sex }) => {
      const key = sex ? (genderMap[sex.toLowerCase()] || sex) : 'Belirtilmemiş';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  };

  const prepareCityData = () => {
    const data = candidates.reduce((acc, { cityName }) => {
      const key = cityName || 'Belirtilmemiş';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  };

  const prepareAgeData = () => {
    const ranges = [
      { name: '18-21', min: 18, max: 21 },
      { name: '22-25', min: 22, max: 25 },
      { name: '26-30', min: 26, max: 30 },
      { name: '30+', min: 30, max: 100 }
    ];
    return ranges.map(range => ({
      name: range.name,
      count: candidates.filter(c => c.age >= range.min && c.age < range.max).length
    }));
  };

  const prepareGraduationYearData = () => {
    const data = candidates.reduce((acc, { expectedGraduateYear }) => {
      const key = expectedGraduateYear || 'Belirtilmemiş';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  };

  const prepareJobPositionData = () => {
    const data = candidates.reduce((acc, { jobName }) => {
      const key = jobName || 'Belirtilmemiş';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  };

  const prepareMajorData = () => {
    const data = candidates.reduce((acc, { major }) => {
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
  const englishData = prepareEnglishLevelData();
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
                  <Label value="Başvuru Durumu" offset={-15} position="insideBottom" />
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
                  <Label value="GPA Aralığı" offset={-15} position="insideBottom" />
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
                  data={englishData}
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={renderCustomizedLabel}
                  labelLine={false}
                >
                  {englishData.map((entry, index) => (
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
                  <Label value="Sınıf" offset={-15} position="insideBottom" />
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
                  <Label value="Şehirler" offset={-15} position="insideBottom" />
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
                  <Label value="Yaş Aralığı" offset={-15} position="insideBottom" />
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
                  <Label value="Mezuniyet Yılı" offset={-15} position="insideBottom" />
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
                  <Label value="Bölümler" offset={-15} position="insideBottom" />
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