// 頂大男女在學人數趨勢分析 - 主應用程式邏輯

let chart = null;

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeSelects();
    bindEvents();
    updateChart();
});

// 初始化下拉選單
function initializeSelects() {
    const universitySelect = document.getElementById('university');
    
    // 加入大學選項
    for (const uniKey in UNIVERSITY_DATA.universities) {
        const uni = UNIVERSITY_DATA.universities[uniKey];
        const option = document.createElement('option');
        option.value = uniKey;
        option.textContent = uni.name;
        universitySelect.appendChild(option);
    }
    
    updateCollegeOptions();
}

// 更新學院下拉選單
function updateCollegeOptions() {
    const universitySelect = document.getElementById('university');
    const collegeSelect = document.getElementById('college');
    const selectedUni = universitySelect.value;
    
    collegeSelect.innerHTML = '<option value="all">全部學院</option>';
    
    if (selectedUni === 'all') {
        // 顯示所有大學的所有學院
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
        // 只顯示選定大學的學院
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

// 更新系所下拉選單
function updateDepartmentOptions() {
    const universitySelect = document.getElementById('university');
    const collegeSelect = document.getElementById('college');
    const departmentSelect = document.getElementById('department');
    
    const selectedUni = universitySelect.value;
    const selectedCollege = collegeSelect.value;
    
    departmentSelect.innerHTML = '<option value="all">全部系所</option>';
    
    if (selectedCollege === 'all') {
        // 根據大學選擇顯示系所
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
        // 只顯示選定學院的系所
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

// 綁定事件
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

// 計算選定條件的數據
function calculateData() {
    const dataTypeSelect = document.getElementById('dataType');
    const universitySelect = document.getElementById('university');
    const collegeSelect = document.getElementById('college');
    const departmentSelect = document.getElementById('department');
    const levelSelect = document.getElementById('level');
    
    const selectedDataType = dataTypeSelect.value; // 'enrolled' or 'freshman'
    const selectedUni = universitySelect.value;
    const selectedCollege = collegeSelect.value;
    const selectedDept = departmentSelect.value;
    const selectedLevel = levelSelect.value;
    
    const years = UNIVERSITY_DATA.years;
    const maleData = new Array(years.length).fill(0);
    const femaleData = new Array(years.length).fill(0);
    
    // 取得要處理的大學
    const unisToProcess = selectedUni === 'all' 
        ? Object.keys(UNIVERSITY_DATA.universities) 
        : [selectedUni];
    
    for (const uniKey of unisToProcess) {
        const uni = UNIVERSITY_DATA.universities[uniKey];
        
        // 取得要處理的學院
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
            
            // 取得要處理的系所
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
                    if (dept[level] && dept[level][selectedDataType]) {
                        const data = dept[level][selectedDataType];
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

// 計算百分比
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

// 更新統計卡片
function updateStatsCards(maleData, femaleData, malePercent, femalePercent) {
    const lastIndex = maleData.length - 1;
    const firstIndex = 0;
    
    // 最新年度男性比例
    document.getElementById('malePercent').textContent = malePercent[lastIndex] + '%';
    document.getElementById('maleCount').textContent = `${maleData[lastIndex].toLocaleString()} 人`;
    
    // 最新年度女性比例
    document.getElementById('femalePercent').textContent = femalePercent[lastIndex] + '%';
    document.getElementById('femaleCount').textContent = `${femaleData[lastIndex].toLocaleString()} 人`;
    
    // 十年女性比例變化
    const femaleTrend = (parseFloat(femalePercent[lastIndex]) - parseFloat(femalePercent[firstIndex])).toFixed(1);
    const trendSign = femaleTrend >= 0 ? '+' : '';
    document.getElementById('trendValue').textContent = `${trendSign}${femaleTrend}%`;
    
    if (femaleTrend > 0) {
        document.getElementById('trendDesc').textContent = '女性比例上升';
        document.getElementById('trendValue').style.color = '#FF6384';
    } else if (femaleTrend < 0) {
        document.getElementById('trendDesc').textContent = '女性比例下降';
        document.getElementById('trendValue').style.color = '#36A2EB';
    } else {
        document.getElementById('trendDesc').textContent = '比例維持穩定';
        document.getElementById('trendValue').style.color = '#4BC0C0';
    }
}

// 更新原始數據表格
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

// 取得圖表標題
function getChartTitle() {
    const dataTypeSelect = document.getElementById('dataType');
    const universitySelect = document.getElementById('university');
    const collegeSelect = document.getElementById('college');
    const departmentSelect = document.getElementById('department');
    const levelSelect = document.getElementById('level');
    
    let title = '';
    
    if (universitySelect.value === 'all') {
        title = '頂大';
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
        'all': '全部學制',
        'bachelor': '學士班',
        'master': '碩士班',
        'phd': '博士班'
    };
    title += ' ' + levelMap[levelSelect.value];
    
    const dataTypeMap = {
        'enrolled': '在學人數',
        'freshman': '當年度新生'
    };
    title += ' ' + dataTypeMap[dataTypeSelect.value];
    
    return title + ' 男女比例趨勢';
}

// 更新圖表
function updateChart() {
    const { years, maleData, femaleData } = calculateData();
    const { malePercent, femalePercent } = calculatePercentages(maleData, femaleData);
    
    updateStatsCards(maleData, femaleData, malePercent, femalePercent);
    updateRawDataTable(years, maleData, femaleData, malePercent, femalePercent);
    
    const ctx = document.getElementById('genderChart').getContext('2d');
    
    if (chart) {
        chart.destroy();
    }
    
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: years,
            datasets: [
                {
                    label: '男性比例 (%)',
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
                    label: '女性比例 (%)',
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
        options: {
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
                        size: 18,
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
                            size: 14
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
                    padding: 12,
                    callbacks: {
                        afterBody: function(context) {
                            const index = context[0].dataIndex;
                            const male = maleData[index];
                            const female = femaleData[index];
                            return [
                                '',
                                `男性人數: ${male.toLocaleString()} 人`,
                                `女性人數: ${female.toLocaleString()} 人`,
                                `總人數: ${(male + female).toLocaleString()} 人`
                            ];
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: '年度',
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
                        text: '百分比 (%)',
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
        }
    });
}
