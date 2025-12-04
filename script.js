// District insights will be populated by DataManager
let districtInsights = {};

// District data with names and descriptions (for fallback)
const districtData = {
    kasaragod: {
        name: "Kasaragod",
        description: "The northernmost district of Kerala, known for its beautiful beaches, historic forts like Bekal Fort, and rich cultural heritage. Famous for Theyyam performances and pristine coastline."
    },
    thiruvananthapuram: {
        name: "Thiruvananthapuram",
        description: "The capital city of Kerala, known for the iconic Padmanabhaswamy Temple, beautiful beaches like Kovalam, and as a center for IT and space research. Rich in art, culture, and colonial architecture."
    }
};

// Get DOM elements
const districts = document.querySelectorAll('.district');
const infoPanel = document.getElementById('info-panel');
const districtName = document.getElementById('district-name');
const districtDescription = document.getElementById('district-description');
const colorGradeToggle = document.getElementById('color-grade-toggle');
const loadingOverlay = document.getElementById('loading-overlay');

// Color grading function based on achievement percentage
function getColorByAchievement(achievement) {
    const percent = parseFloat(achievement);

    if (percent >= 100) {
        return '#10b981'; // Green for 100%+
    } else if (percent >= 70) {
        return '#f59e0b'; // Orange for 70-99%
    } else if (percent >= 40) {
        return '#fbbf24'; // Yellow for 40-69%
    } else {
        return '#ef4444'; // Red for below 40%
    }
}

// Apply color grading to all districts
function applyColorGrading() {
    districts.forEach(district => {
        const districtId = district.id;
        const insights = districtInsights[districtId];

        if (insights) {
            const color = getColorByAchievement(insights.achievement);
            district.style.fill = color;
        }
    });
}

// Remove color grading
function removeColorGrading() {
    districts.forEach(district => {
        district.style.fill = '';
    });
}

// Handle color grade toggle
if (colorGradeToggle) {
    colorGradeToggle.addEventListener('change', function () {
        if (this.checked) {
            applyColorGrading();
        } else {
            removeColorGrading();
        }
    });
}

// Add click event listeners to each district
districts.forEach(district => {
    district.addEventListener('click', function (e) {
        e.stopPropagation(); // Prevent click from bubbling to document

        const districtId = this.id;

        // Remove active class from all other districts
        districts.forEach(d => {
            if (d !== this) d.classList.remove('active');
        });

        // Toggle active state or force active
        this.classList.add('active');

        const insights = districtInsights[districtId];
        const fallback = districtData[districtId];

        if (insights) {
            // Show insights
            districtName.textContent = insights.name;

            const insightsHTML = `
                <div class="insights-container">
                    <div class="insight-row">
                        <span class="insight-label">Population:</span>
                        <span class="insight-value">${insights.population}</span>
                    </div>
                    <div class="insight-row">
                        <span class="insight-label">Number of Dealers:</span>
                        <span class="insight-value">${insights.dealerCount}</span>
                    </div>
                    <div class="insight-row">
                        <span class="insight-label">Total Annual Sales:</span>
                        <span class="insight-value">₹${(parseFloat(insights.totalSales || insights.currentSales) / 100000).toFixed(2)}L</span>
                    </div>
                    <div class="insight-row">
                        <span class="insight-label">Monthly Target:</span>
                        <span class="insight-value">₹${(parseFloat(insights.monthlyTarget) / 100000).toFixed(2)}L</span>
                    </div>
                    <div class="insight-row">
                        <span class="insight-label">Current Sales:</span>
                        <span class="insight-value">₹${(parseFloat(insights.currentSales) / 100000).toFixed(2)}L</span>
                    </div>
                    <div class="insight-row achievement">
                        <span class="insight-label">Achievement:</span>
                        <span class="insight-value ${parseFloat(insights.achievement) >= 100 ? 'success' : parseFloat(insights.achievement) >= 70 ? 'warning' : 'danger'}">${insights.achievement}</span>
                    </div>
                    <div class="insight-section">
                        <div class="insight-subtitle">Dealer Sales Distribution</div>
                        <div class="dealers-list">
                        ${insights.dealers && insights.dealers.length > 0 ? insights.dealers.map((dealer, i) => `
                            <div class="sales-bar">
                                <div class="sales-bar-fill" style="width: ${(dealer.sales / parseFloat(insights.currentSales) * 100).toFixed(1)}%"></div>
                                <span class="sales-bar-label">${dealer.name}: ₹${(dealer.sales / 100000).toFixed(2)}L</span>
                            </div>
                        `).join('') : '<p style="color:var(--text-muted)">No sales data available</p>'}
                        </div>
                    </div>
                </div>
            `;

            districtDescription.innerHTML = insightsHTML;
            infoPanel.classList.add('active');
        } else if (fallback) {
            // Fallback to basic info
            districtName.textContent = fallback.name;
            districtDescription.textContent = fallback.description;
            infoPanel.classList.add('active');
        } else {
            // Generic fallback if no data at all
            districtName.textContent = districtId.charAt(0).toUpperCase() + districtId.slice(1);
            districtDescription.textContent = "No data available for this district.";
            infoPanel.classList.add('active');
        }
    });
});

// Click anywhere else to deselect
document.addEventListener('click', function () {
    districts.forEach(d => d.classList.remove('active'));
    infoPanel.classList.remove('active');
});

// Initialize Data
async function init() {
    if (window.DataManager) {
        const dataManager = new window.DataManager();
        try {
            const data = await dataManager.loadData();
            if (data && Object.keys(data).length > 0) {
                districtInsights = data;
                window.districtInsights = data;
                console.log("District insights updated with real-time data.");

                // Refresh view if needed
                if (colorGradeToggle && colorGradeToggle.checked) {
                    applyColorGrading();
                }
            } else {
                console.warn("No data fetched, using defaults or empty state.");
            }
        } catch (e) {
            console.error("Failed to load data:", e);
        } finally {
            // Hide loading
            if (loadingOverlay) {
                loadingOverlay.classList.add('hidden');
            }
        }
    } else {
        console.error("DataManager not found!");
        if (loadingOverlay) loadingOverlay.classList.add('hidden');
    }
}

// Start initialization
init();

