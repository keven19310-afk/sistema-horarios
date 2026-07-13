// Dados de exemplo - Substituir com dados reais da API
const SALAS_DATA = [
    { id: 'A001', name: 'Sala A001', icon: '🏛️', info: 'Piso 0' },
    { id: 'A002', name: 'Sala A002', icon: '🏛️', info: 'Piso 0' },
    { id: 'B101', name: 'Sala B101', icon: '💻', info: 'Laboratório' },
    { id: 'B102', name: 'Sala B102', icon: '💻', info: 'Laboratório' },
    { id: 'C201', name: 'Sala C201', icon: '📚', info: 'Piso 1' },
    { id: 'C202', name: 'Sala C202', icon: '📚', info: 'Piso 1' },
];

// Dados de horário de exemplo
const HORARIO_DATA = {
    'A001': {
        '2026-07-13': [
            { time: '09:00-10:30', name: 'Programação Web', type: 'horario' },
            { time: '11:00-12:30', name: 'Bases de Dados', type: 'horario' }
        ],
        '2026-07-14': [
            { time: '09:00-10:30', name: 'Redes', type: 'horario' },
            { time: '14:00-16:00', name: 'Exame de Matemática', type: 'exame' }
        ],
        '2026-07-15': [
            { time: '10:00-12:00', name: 'Avaliação de Projeto', type: 'avaliacao' }
        ]
    },
    'B101': {
        '2026-07-13': [
            { time: '14:00-15:30', name: 'Laboratório de Redes', type: 'horario' },
            { time: '16:00-17:30', name: 'Programação', type: 'horario' }
        ],
        '2026-07-16': [
            { time: '09:00-11:00', name: 'Exame de Redes', type: 'exame' }
        ]
    }
};

// Estado global
let currentRoomId = null;
let currentWeekStart = getWeekStart(new Date());

// Função para obter o início da semana (Segunda-feira)
function getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
}

// Função para formatar data
function formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

// Função para formatar data ISO
function formatDateISO(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Função para escapar HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ==================== LISTA DE SALAS ====================
function renderRooms() {
    const container = document.getElementById('roomsContainer');
    if (!container) return;

    let html = '';
    SALAS_DATA.forEach(room => {
        html += `
            <div class="room-card" data-room-id="${room.id}">
                <div class="room-icon">${room.icon}</div>
                <div class="room-name">${escapeHtml(room.name)}</div>
                <div class="room-info">${escapeHtml(room.info)}</div>
            </div>
        `;
    });

    container.innerHTML = html;

    // Adicionar event listeners
    document.querySelectorAll('.room-card').forEach(card => {
        card.addEventListener('click', function() {
            const roomId = this.dataset.roomId;
            window.location.href = `room.html?id=${roomId}`;
        });
        // Suporte para touch
        card.addEventListener('touchend', function(e) {
            e.preventDefault();
            const roomId = this.dataset.roomId;
            window.location.href = `room.html?id=${roomId}`;
        });
    });
}

// ==================== HORÁRIO ====================
function loadSchedule(roomId, weekStart) {
    const container = document.getElementById('daysContainer');
    const weekLabel = document.getElementById('weekLabel');
    const roomTitle = document.getElementById('roomTitle');

    // Verificar se está na página de horário
    if (!container) return;

    // Encontrar nome da sala
    const room = SALAS_DATA.find(r => r.id === roomId);
    if (room) {
        roomTitle.textContent = `📍 ${room.name}`;
    }

    // Calcular fim da semana
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    // Atualizar label
    weekLabel.textContent = `${formatDate(weekStart)} - ${formatDate(weekEnd)}`;

    // Mostrar loading
    container.innerHTML = '<div class="loading">⏳ A carregar horário...</div>';

    // Simular carregamento
    setTimeout(() => {
        renderDays(roomId, weekStart, container);
    }, 500);
}

function renderDays(roomId, weekStart, container) {
    const daysOfWeek = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];
    const today = new Date();
    const todayStr = formatDateISO(today);

    let html = '';

    for (let i = 0; i < 5; i++) {
        const currentDate = new Date(weekStart);
        currentDate.setDate(currentDate.getDate() + i);
        const dateStr = formatDateISO(currentDate);
        const isToday = dateStr === todayStr;
        const dayName = daysOfWeek[i];

        // Buscar eventos para este dia
        const roomSchedule = HORARIO_DATA[roomId] || {};
        const events = roomSchedule[dateStr] || [];

        html += `
            <div class="day-card ${isToday ? 'current-day' : ''}">
                <div class="day-header">
                    <span class="day-name">${dayName}</span>
                    <span class="day-date">${formatDate(currentDate)}</span>
                    <span class="event-count">${events.length}</span>
                </div>
        `;

        if (events.length === 0) {
            html += `
                <div class="empty-state" style="padding: 10px; text-align: center;">
                    <p style="color: #7f8c8d; font-size: 0.85rem;">Sem eventos</p>
                </div>
            `;
        } else {
            events.forEach(event => {
                const typeLabels = {
                    'horario': 'Horário',
                    'exame': 'Exame',
                    'avaliacao': 'Avaliação'
                };
                html += `
                    <div class="event type-${event.type}">
                        <div class="event-time">⏰ ${escapeHtml(event.time)}</div>
                        <div class="event-name">${escapeHtml(event.name)}</div>
                        <span class="event-type">${typeLabels[event.type] || event.type}</span>
                    </div>
                `;
            });
        }

        html += `</div>`;
    }

    container.innerHTML = html;
}

// ==================== INICIALIZAÇÃO ====================
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se estamos na página de lista de salas
    if (document.getElementById('roomsContainer')) {
        renderRooms();
        return;
    }

    // Verificar se estamos na página de horário
    if (document.getElementById('daysContainer')) {
        // Obter ID da sala da URL
        const urlParams = new URLSearchParams(window.location.search);
        const roomId = urlParams.get('id');

        if (!roomId || !SALAS_DATA.find(r => r.id === roomId)) {
            // Sala não encontrada, redirecionar para lista
            window.location.href = 'index.html';
            return;
        }

        currentRoomId = roomId;

        // Configurar navegação
        const prevBtn = document.getElementById('prevWeek');
        const nextBtn = document.getElementById('nextWeek');
        const backBtn = document.getElementById('backButton');

        if (prevBtn) {
            prevBtn.addEventListener('click', function() {
                currentWeekStart.setDate(currentWeekStart.getDate() - 7);
                loadSchedule(currentRoomId, currentWeekStart);
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', function() {
                currentWeekStart.setDate(currentWeekStart.getDate() + 7);
                loadSchedule(currentRoomId, currentWeekStart);
            });
        }

        if (backBtn) {
            backBtn.addEventListener('click', function() {
                window.location.href = 'index.html';
            });
        }

        // Suporte para swipe (touch)
        let touchStartX = 0;
        let touchEndX = 0;

        document.addEventListener('touchstart', function(e) {
            touchStartX = e.changedTouches[0].screenX;
        });

        document.addEventListener('touchend', function(e) {
            touchEndX = e.changedTouches[0].screenX;
            const diff = touchStartX - touchEndX;
            
            if (diff > 50 && nextBtn) {
                nextBtn.click();
            } else if (diff < -50 && prevBtn) {
                prevBtn.click();
            }
        });

        // Carregar horário inicial
        loadSchedule(currentRoomId, currentWeekStart);
    }
});

// ==================== EXPORTAÇÃO PARA TESTES ====================
// (Opcional - permite usar no console para debug)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        SALAS_DATA,
        HORARIO_DATA,
        getWeekStart,
        formatDate,
        renderRooms,
        loadSchedule
    };
}