# Taiwan Universities Gender Statistics

An interactive web application visualizing gender ratio trends across Taiwan's major universities over 10 years.

## Features

- 📊 **Interactive Charts** - Dynamic line charts powered by Chart.js
- 🎯 **Multi-level Filters** - Filter by university, college, department, and degree level
- 📈 **Compare Mode** - Compare enrolled students vs freshmen on the same chart
- 📋 **Raw Data Table** - View detailed numbers for each year
- 💡 **Statistics Cards** - Quick overview of latest ratios and 10-year trends
- 📱 **Responsive Design** - Works on desktop and mobile

## Universities Included

- **NTU** - National Taiwan University (台大)
- **NTHU** - National Tsing Hua University (清大)
- **NYCU** - National Yang Ming Chiao Tung University (陽明交大)
- **NCCU** - National Chengchi University (政大)

## Usage

1. Open `index.html` in a browser
2. Use the dropdown menus to select:
   - **Statistics Type** - Enrolled students, Freshmen only, or Compare both
   - **University** - Select a specific university or all
   - **College** - Filter by college
   - **Department** - Filter by department
   - **Degree Level** - Bachelor, Master, PhD, or all

## Files

```
├── index.html    # Main page
├── app.js        # Application logic
├── data.js       # Data file (editable)
└── README.md     # This file
```

## Updating Data

Edit `data.js` to update with real statistics. Data format:

```javascript
"Department Name": {
    bachelor: { 
        enrolled: { male: [...], female: [...] },
        freshman: { male: [...], female: [...] }
    },
    master: { ... },
    phd: { ... }
}
```

## Data Sources

- [Ministry of Education Statistics](https://stats.moe.gov.tw/) - Higher Education Data
- University Academic Affairs Offices - Student Statistics

## Tech Stack

- HTML5
- CSS3
- JavaScript (ES6+)
- Chart.js (via CDN)

## License

MIT - Personal project for educational purposes.
