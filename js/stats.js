import { lifeSpheres, lifeSphereProgress } from './app.js';

export function initializeStats() {
    updateLifeSpheresStats();
}

export function updateLifeSpheresStats() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Собираем статистику за текущий месяц
    const monthStats = {};
    lifeSpheres.forEach(sphere => {
        monthStats[sphere.id] = 0;
    });
    
    let totalTracked = 0;
    let activeDays = 0;
    
    Object.keys(lifeSphereProgress).forEach(dateKey => {
        const progressDate = new Date(dateKey);
        
        // Учитываем только текущий месяц
        if (progressDate.getMonth() === currentMonth && progressDate.getFullYear() === currentYear) {
            const progress = lifeSphereProgress[dateKey];
            let dayTracked = false;
            
            progress.forEach(item => {
                if (item.tracked) {
                    monthStats[item.id]++;
                    totalTracked++;
                    dayTracked = true;
                }
            });
            
            if (dayTracked) {
                activeDays++;
            }
        }
    });
    
    // Обновляем элементы статистики
    const totalTrackedEl = document.getElementById('total-tracked');
    const activeDaysEl = document.getElementById('active-days');
    
    if (totalTrackedEl) totalTrackedEl.textContent = totalTracked;
    if (activeDaysEl) activeDaysEl.textContent = activeDays;
    
    // Обновляем график
    updateMonthlyChart(monthStats);
}

export function updateMonthlyChart(monthStats) {
    const ctx = document.getElementById('monthly-chart');
    if (!ctx) return;
    
    const context = ctx.getContext('2d');
    
    // Подготовка данных для графика
    const labels = lifeSpheres.map(sphere => sphere.name);
    const data = lifeSpheres.map(sphere => monthStats[sphere.id] || 0);
    const backgroundColors = [
        '#FF6B6B',  // Тело
        '#4ECDC4',  // Ментальное здоровье
        '#45B7D1',  // Смыслы
        '#96CEB4',  // Отношения
        '#FFEAA7',  // Личностный рост
        '#DDA0DD',  // Дело и финансы
        '#98D8C8',  // Природа
        '#F7DC6F'   // Забота о себе
    ];
    
    // Создание графика
    if (window.monthlyChart) {
        window.monthlyChart.destroy();
    }
    
    window.monthlyChart = new Chart(context, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: backgroundColors,
                borderColor: backgroundColors.map(color => color),
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        font: {
                            size: 12
                        },
                        padding: 15,
                        color: document.body.getAttribute('data-theme') === 'dark' ? '#ffffff' : '#000000'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}