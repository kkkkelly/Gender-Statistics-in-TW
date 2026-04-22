// Taiwan Universities Gender Statistics - Main Application

let chart = null;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    initializeSelects();
    bindEvents();
    updateChart();
});

// Initialize dropdown menus
function initializeSelects() {
    const universitySelect = document.getElementById('university');
    
    for (const uniKey in UNIVERSITY_DATA.universities) {
        const uni = UNIVERSITY_DATA.universities[uniKey];
        const option = document.createElement('option');
        option.value = uniKey;
        option.textContent = uni.name + ' (' + uni.shortName + ')';
        universitySelect.appendChild(option);
    }
    
    updateCollegeOptions();
}

// Update college dropdown
function updateCollegeOptions() {
    const universitySelect = document.getElementById('university');
    const collegeSelect = document.getElementById('college');
    const selectedUni = universitySelect.value;
    
    collegeSelect.innerHTML = '<option value="all">All Colleges</option>';
    
    if (selectedUni === 'all') {
        for (const uniKey in UNIVERSITY_DATA.universities) {
            const uni = UNIVERSITY_DATA.universities[uniKey];
            for (const collegeKey in uni.colleges) {
                const option = document.createElement('option');
                option.value = `${uniKey}|${collegeKey}`;
                option.textContent = `${uni.shortName} - ${uni.colleges[collegeKey].name}`;
                collegeSelect.appendChild(option);
            }
        }
    } else {
        const uni = UNIVERSITY_DATA.universities[selectedUni];
        for (const collegeKey in uni.colleges) {
            const option = document.createElement('option');
            option.value = `${selectedUni}|${collegeKey}`;
            option.textContent = uni.colleges[collegeKey].name;
            collegeSelect.appendChild(option);
        }
    }
    
    updateDepartmentOptions();
}

// Update department dropdown
function updateDepartmentOptions() {
    const universitySelect = document.getElementById('university');
    const collegeSelect = document.getElementById('college');
    const departmentSelect = document.getElementById('department');
    
    const selectedUni = universitySelect.value;
    const selectedCollege = collegeSelect.value;
    
    departmentSelect.innerHTML = '<option value="all">All Departments</option>';
    
    if (selectedCollege === 'all') {
        const unisToProcess = selectedUni === 'all' 
            ? Object.keys(UNIVERSITY_DATA.universities) 
            : [selectedUni];
        
        for (const uniKey of unisToProcess) {
            const uni = UNIVERSITY_DATA.universities[uniKey];
            for (const collegeKey in uni.colleges) {
                const college = uni.colleges[collegeKey];
                for (const deptKey in college.departments) {
                    const option = document.createElement('option');
                    option.value = `${uniKey}|${collegeKey}|${deptKey}`;
                    option.textContent = `${uni.shortName} - ${deptKey}`;
                    departmentSelect.appendChild(option);
                }
            }
        }
    } else {
        const [uniKey, collegeKey] = selectedCollege.split('|');
        const uni = UNIVERSITY_DATA.universities[uniKey];
        const college = uni.colleges[collegeKey];
        
        for (const deptKey in college.departments) {
            const option = document.createElement('option');
            option.value = `${uniKey}|${collegeKey}|${deptKey}`;
            option.textContent = deptKey;
            departmentSelect.appendChild(option);
        }
    }
}

// Bind events
function bindEvents() {
    document.getElementById('dataType').addEventListener('change', updateChart);
    
    document.getElementById('university').addEventListener('change', function() {
        updateCollegeOptions();
        updateChart();
    });
    
    document.getElementById('college').addEventListener('change', function() {
        updateDepartmentOptions();
        updateChart();
    });
    
    document.getElementById('department').addEventListener('change', updateChart);
    document.getElementById('level').addEventListener('change', updateChart);
}

// Calculate data for selected filters
function calculateData(dataType) {
    const universitySelect = document.getElementById('university');
    const collegeSelect = document.getElementById('college');
    const departmentSelect = document.getElementById('department');
    const levelSelect = document.getElementById('level');
    
    const selectedUni = universitySelect.value;
    const selectedCollege = collegeSelect.value;
    const selectedDept = departmentSelect.value;
    const selectedLevel = levelSelect.value;
    
    const years = UNIVERSITY_DATA.years;
    const maleData = new Array(years.length).fill(0);
    const femaleData = new Array(years.length).fill(0);
    
    const unisToProcess = selectedUni === 'all' 
        ? Object.keys(UNIVERSITY_DATA.universities) 
        : [selectedUni];
    
    for (const uniKey of unisToProcess) {
        const uni = UNIVERSITY_DATA.universities[uniKey];
        
        let collegesToProcess = [];
        if (selectedCollege === 'all') {
            collegesToProcess = Object.keys(uni.colleges).map(c => [uniKey, c]);
        } else {
            const [collegeUniKey, collegeKey] = selectedCollege.split('|');
            if (collegeUniKey === uniKey) {
                collegesToProcess = [[uniKey, collegeKey]];
            }
        }
        
        for (const [cUniKey, collegeKey] of collegesToProcess) {
            if (cUniKey !== uniKey) continue;
            const college = uni.colleges[collegeKey];
            if (!college) continue;
            
            let deptsToProcess = [];
            if (selectedDept === 'all') {
                deptsToProcess = Object.keys(college.departments);
            } else {
                const parts = selectedDept.split('|');
                if (parts[0] === uniKey && parts[1] === collegeKey) {
                    deptsToProcess = [parts[2]];
                }
            }
            
            for (const deptKey of deptsToProcess) {
                const dept = college.departments[deptKey];
                if (!dept) continue;
                
                const levels = selectedLevel === 'all' 
                    ? ['bachelor', 'master', 'phd'] 
                    : [selectedLevel];
                
                for (const level of levels) {
                    if (dept[level] && dept[level][dataType]) {
                        const data = dept[level][dataType];
                        for (let i = 0; i < years.length; i++) {
                            maleData[i] += data.male[i] || 0;
                            femaleData[i] += data.female[i] || 0;
                        }
                    }
                }
            }
        }
    }
    
    return { years, maleData, femaleData };
}

// Calculate percentages
function calculatePercentages(maleData, femaleData) {
    const malePercent = [];
    const femalePercent = [];
    
    for (let i = 0; i < maleData.length; i++) {
        const total = maleData[i] + femaleData[i];
        if (total > 0) {
            malePercent.push((maleData[i] / total * 100).toFixed(1));
            femalePercent.push((femaleData[i] / total * 100).toFixed(1));
        } else {
            malePercent.push(0);
            femalePercent.push(0);
        }
    }
    
    return { malePercent, femalePercent };
}

// Update stats cards
function updateStatsCards(maleData, femaleData, malePercent, femalePercent) {
    const lastIndex = maleData.length - 1;
    const firstIndex = 0;
    
    document.getElementById('malePercent').textContent = malePercent[lastIndex] + '%';
    document.getElementById('maleCount').textContent = `${maleData[lastIndex].toLocaleString()} students`;
    
    document.getElementById('femalePercent').textContent = femalePercent[lastIndex] + '%';
    document.getElementById('femaleCount').textContent = `${femaleData[lastIndex].toLocaleString()} students`;
    
    const femaleTrend = (parseFloat(femalePercent[lastIndex]) - parseFloat(femalePercent[firstIndex])).toFixed(1);
    const trendSign = femaleTrend >= 0 ? '+' : '';
    document.getElementById('trendValue').textContent = `${trendSign}${femaleTrend}%`;
    
    if (femaleTrend > 0) {
        document.getElementById('trendDesc').textContent = 'Female ratio increased';
        document.getElementById('trendValue').style.color = '#FF6384';
    } else if (femaleTrend < 0) {
        document.getElementById('trendDesc').textContent = 'Female ratio decreased';
        document.getElementById('trendValue').style.color = '#36A2EB';
    } else {
        document.getElementById('trendDesc').textContent = 'Ratio remained stable';
        document.getElementById('trendValue').style.color = '#4BC0C0';
    }
}

// Update raw data table
function updateRawDataTable(years, maleData, femaleData, malePercent, femalePercent) {
    const tbody = document.getElementById('rawDataBody');
    tbody.innerHTML = '';
    
    for (let i = 0; i < years.length; i++) {
        const total = maleData[i] + femaleData[i];
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${years[i]}</strong></td>
            <td class="male-cell">${maleData[i].toLocaleString()}</td>
            <td class="female-cell">${femaleData[i].toLocaleString()}</td>
            <td class="total-cell">${total.toLocaleString()}</td>
            <td class="male-cell">${malePercent[i]}%</td>
            <td class="female-cell">${femalePercent[i]}%</td>
        `;
        tbody.appendChild(row);
    }
}

// Get chart title
function getChartTitle() {
    const dataTypeSelect = document.getElementById('dataType');
    const universitySelect = document.getElementById('university');
    const collegeSelect = document.getElementById('college');
    const departmentSelect = document.getElementById('department');
    const levelSelect = document.getElementById('level');
    
    let title = '';
    
    if (universitySelect.value === 'all') {
        title = 'All Universities';
    } else {
        title = UNIVERSITY_DATA.universities[universitySelect.value].shortName;
    }
    
    if (collegeSelect.value !== 'all') {
        const collegeText = collegeSelect.options[collegeSelect.selectedIndex].text;
        title += ' ' + collegeText;
    }
    
    if (departmentSelect.value !== 'all') {
        const deptText = departmentSelect.options[departmentSelect.selectedIndex].text;
        if (!title.includes(deptText.split(' - ').pop())) {
            title += ' ' + deptText.split(' - ').pop();
        }
    }
    
    const levelMap = {
        'all': 'All Levels',
        'bachelor': 'Bachelor',
        'master': 'Master',
        'phd': 'PhD'
    };
    title += ' - ' + levelMap[levelSelect.value];
    
    const dataTypeMap = {
        'enrolled': 'Enrolled Students',
        'freshman': 'Freshmen',
        'compare': 'Enrolled vs Freshmen'
    };
    title += ' - ' + dataTypeMap[dataTypeSelect.value];
    
    return title + ' - Gender Ratio Trends';
}

// Update chart
function updateChart() {
    const dataTypeSelect = document.getElementById('dataType');
    const selectedDataType = dataTypeSelect.value;
    
    const ctx = document.getElementById('genderChart').getContext('2d');
    
    if (chart) {
        chart.destroy();
    }
    
    if (selectedDataType === 'compare') {
        // Compare mode: show both enrolled and freshman
        const enrolledData = calculateData('enrolled');
        const freshmanData = calculateData('freshman');
        const enrolledPercent = calculatePercentages(enrolledData.maleData, enrolledData.femaleData);
        const freshmanPercent = calculatePercentages(freshmanData.maleData, freshmanData.femaleData);
        
        // Use enrolled data for stats cards
        updateStatsCards(enrolledData.maleData, enrolledData.femaleData, enrolledPercent.malePercent, enrolledPercent.femalePercent);
        updateRawDataTable(enrolledData.years, enrolledData.maleData, enrolledData.femaleData, enrolledPercent.malePercent, enrolledPercent.femalePercent);
        
        chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: UNIVERSITY_DATA.years,
                datasets: [
                    {
                        label: 'Enrolled - Female %',
                        data: enrolledPercent.femalePercent,
                        borderColor: '#FF6384',
                        backgroundColor: 'rgba(255, 99, 132, 0.1)',
                        borderWidth: 3,
                        fill: false,
                        tension: 0.3,
                        pointRadius: 5,
                        pointHoverRadius: 8,
                        pointBackgroundColor: '#FF6384',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2
                    },
                    {
                        label: 'Freshmen - Female %',
                        data: freshmanPercent.femalePercent,
                        borderColor: '#FF9F40',
                        backgroundColor: 'rgba(255, 159, 64, 0.1)',
                        borderWidth: 3,
                        borderDash: [5, 5],
                        fill: false,
                        tension: 0.3,
                        pointRadius: 5,
                        pointHoverRadius: 8,
                        pointBackgroundColor: '#FF9F40',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2
                    },
                    {
                        label: 'Enrolled - Male %',
                        data: enrolledPercent.malePercent,
                        borderColor: '#36A2EB',
                        backgroundColor: 'rgba(54, 162, 235, 0.1)',
                        borderWidth: 3,
                        fill: false,
                        tension: 0.3,
                        pointRadius: 5,
                        pointHoverRadius: 8,
                        pointBackgroundColor: '#36A2EB',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2
                    },
                    {
                        label: 'Freshmen - Male %',
                        data: freshmanPercent.malePercent,
                        borderColor: '#4BC0C0',
                        backgroundColor: 'rgba(75, 192, 192, 0.1)',
                        borderWidth: 3,
                        borderDash: [5, 5],
                        fill: false,
                        tension: 0.3,
                        pointRadius: 5,
                        pointHoverRadius: 8,
                        pointBackgroundColor: '#4BC0C0',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2
                    }
                ]
            },
            options: getChartOptions(enrolledData.maleData, enrolledData.femaleData)
        });
    } else {
        // Single mode: enrolled or freshman
        const { years, maleData, femaleData } = calculateData(selectedDataType);
        const { malePercent, femalePercent } = calculatePercentages(maleData, femaleData);
        
        updateStatsCards(maleData, femaleData, malePercent, femalePercent);
        updateRawDataTable(years, maleData, femaleData, malePercent, femalePercent);
        
        chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: years,
                datasets: [
                    {
                        label: 'Male %',
                        data: malePercent,
                        borderColor: '#36A2EB',
                        backgroundColor: 'rgba(54, 162, 235, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.3,
                        pointRadius: 5,
                        pointHoverRadius: 8,
                        pointBackgroundColor: '#36A2EB',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2
                    },
                    {
                        label: 'Female %',
                        data: femalePercent,
                        borderColor: '#FF6384',
                        backgroundColor: 'rgba(255, 99, 132, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.3,
                        pointRadius: 5,
                        pointHoverRadius: 8,
                        pointBackgroundColor: '#FF6384',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2
                    }
                ]
            },
            options: getChartOptions(maleData, femaleData)
        });
    }
}

// Get chart options
function getChartOptions(maleData, femaleData) {
    return {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            intersect: false,
            mode: 'index'
        },
        plugins: {
            title: {
                display: true,
                text: getChartTitle(),
                font: {
                    size: 16,
                    weight: 'bold'
                },
                padding: {
                    bottom: 20
                }
            },
            legend: {
                position: 'top',
                labels: {
                    usePointStyle: true,
                    padding: 20,
                    font: {
                        size: 12
                    }
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleFont: {
                    size: 14
                },
                bodyFont: {
                    size: 13
                },
                padding: 12
            }
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Year',
                    font: {
                        size: 14,
                        weight: 'bold'
                    }
                },
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)'
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'Percentage (%)',
                    font: {
                        size: 14,
                        weight: 'bold'
                    }
                },
                min: 0,
                max: 100,
                ticks: {
                    callback: function(value) {
                        return value + '%';
                    }
                },
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)'
                }
            }
        }
    };
}
