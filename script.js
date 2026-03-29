/* ═══════════════ RELÓGIO ═══════════════ */
function updateClock() {
    const now = new Date();
    const opts = { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
    document.getElementById('clock-display').textContent = now.toLocaleDateString('pt-BR', opts);
}
updateClock();
setInterval(updateClock, 1000);

/* ═══════════════ ACESSIBILIDADE ═══════════════ */
let textScale = 1;
document.getElementById('btn-increase-text').addEventListener('click', () => {
    textScale = Math.min(textScale + 0.1, 1.4);
    document.documentElement.style.fontSize = (textScale * 16) + 'px';
    document.getElementById('btn-increase-text').classList.add('active');
});
document.getElementById('btn-decrease-text').addEventListener('click', () => {
    textScale = Math.max(textScale - 0.1, 0.85);
    document.documentElement.style.fontSize = (textScale * 16) + 'px';
});
document.getElementById('btn-contrast').addEventListener('click', function() {
    document.body.classList.toggle('high-contrast');
    this.classList.toggle('active');
});
document.getElementById('btn-reset-a11y').addEventListener('click', () => {
    textScale = 1;
    document.documentElement.style.fontSize = '16px';
    document.body.classList.remove('high-contrast');
    document.querySelectorAll('.a11y-bar button').forEach(b => b.classList.remove('active'));
});

/* ═══════════════ CARRINHO ═══════════════ */
let cartCount = 0;
const cartCountEl = document.getElementById('cart-count');
const toast = new bootstrap.Toast(document.getElementById('liveToast'), { delay: 2500 });

document.querySelectorAll('.btn-add').forEach(btn => {
    btn.addEventListener('click', () => {
        cartCount++;
        cartCountEl.textContent = cartCount;
        cartCountEl.setAttribute('aria-label', `Carrinho: ${cartCount} item${cartCount > 1 ? 's' : ''}`);
        const product = btn.dataset.product || 'Item';
        document.getElementById('toast-msg').textContent = `🛒 "${product}" adicionado ao carrinho!`;
        toast.show();

      // micro-animação
        btn.textContent = '✓ Adicionado';
        btn.style.background = 'var(--accent)';
        setTimeout(() => {
            btn.textContent = '+ Carrinho';
            btn.style.background = '';
    }, 1600);
    });
});

/* ═══════════════ CALENDÁRIO ═══════════════ */
let calYear, calMonth, selectedDate = null;

const DAYS_PT = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
const MONTHS_PT = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

function renderCalendar(year, month) {
    calYear = year; calMonth = month;
    document.getElementById('cal-month-year').textContent = `${MONTHS_PT[month]} ${year}`;
    const grid = document.getElementById('calendar-grid');
    grid.innerHTML = '';

    // cabeçalho
    DAYS_PT.forEach(d => {
        const h = document.createElement('div');
        h.className = 'cal-header';
        h.textContent = d;
        h.setAttribute('aria-hidden', 'true');
        grid.appendChild(h);
    });

    const today = new Date();
    today.setHours(0,0,0,0);
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month+1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement('div');
        empty.className = 'cal-day empty';
        empty.setAttribute('aria-hidden', 'true');
        grid.appendChild(empty);
    }

    for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(year, month, d);
        date.setHours(0,0,0,0);
        const dayEl = document.createElement('div');
        dayEl.className = 'cal-day';
        dayEl.textContent = d;
        dayEl.setAttribute('role', 'gridcell');

        const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        const dayOfWeek = date.getDay();
        const isPast = date < today;
        const isSunday = dayOfWeek === 0;

        if (isPast || isSunday) {
            dayEl.classList.add('disabled');
            dayEl.setAttribute('aria-disabled', 'true');
            dayEl.setAttribute('aria-label', `${d} de ${MONTHS_PT[month]} – indisponível`);
        } else {
            if (date.toDateString() === today.toDateString()) {
            dayEl.classList.add('today');
            dayEl.setAttribute('aria-label', `${d} de ${MONTHS_PT[month]} – hoje`);
            } else {
            dayEl.setAttribute('aria-label', `${d} de ${MONTHS_PT[month]}`);
            }
            if (selectedDate === dateStr) dayEl.classList.add('selected');
            dayEl.setAttribute('tabindex', '0');
            dayEl.addEventListener('click', () => selectDate(dateStr, d, month, year, dayEl));
            dayEl.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectDate(dateStr, d, month, year, dayEl); }});
        }
        grid.appendChild(dayEl);
    }
}

function selectDate(dateStr, d, month, year, el) {
    selectedDate = dateStr;
    document.getElementById('data-selecionada').value = dateStr;
    document.getElementById('data-display').textContent = `📅 Data selecionada: ${d} de ${MONTHS_PT[month]} de ${year}`;
    document.querySelectorAll('.cal-day').forEach(x => x.classList.remove('selected'));
    el.classList.add('selected');
    renderTimeSlots(dateStr);
    document.getElementById('time-section').style.display = 'block';
}

function renderTimeSlots(date) {
    const slots = document.getElementById('time-slots');
    slots.innerHTML = '';
    const HOURS = ['08:00','09:00','10:00','11:00','13:00','14:00','15:00','16:00','17:00'];
    // simula alguns horários ocupados aleatoriamente mas deterministicamente
    const seed = date.split('-').reduce((a,b) => +a + +b, 0);
    HOURS.forEach((h, i) => {
        const el = document.createElement('button');
        el.type = 'button';
        el.className = 'time-slot';
        el.textContent = h;
        const taken = (seed + i) % 5 === 0;
        if (taken) {
            el.classList.add('taken');
            el.setAttribute('aria-disabled', 'true');
            el.setAttribute('aria-label', `${h} – ocupado`);
        } else {
            el.setAttribute('aria-label', `Agendar às ${h}`);
            el.addEventListener('click', () => {
            document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
            el.classList.add('selected');
            document.getElementById('horario-selecionado').value = h;
        });
    }
    slots.appendChild(el);
    });
}

// Init calendário com mês atual
const now = new Date();
renderCalendar(now.getFullYear(), now.getMonth());

document.getElementById('cal-prev').addEventListener('click', () => {
    let m = calMonth - 1, y = calYear;
    if (m < 0) { m = 11; y--; }
    renderCalendar(y, m);
});
document.getElementById('cal-next').addEventListener('click', () => {
    let m = calMonth + 1, y = calYear;
    if (m > 11) { m = 0; y++; }
    renderCalendar(y, m);
});

/* ═══════════════ MULTI-STEP FORM ═══════════════ */
const steps = [
    document.getElementById('step-1'),
    document.getElementById('step-2'),
    document.getElementById('step-3'),
];
const dots = [
    document.getElementById('dot-1'),
    document.getElementById('dot-2'),
    document.getElementById('dot-3'),
];
const stepLabelText = document.getElementById('step-label-text');
const stepLabels = [
    'Passo 1 de 3 – Dados do Cliente e Pet',
    'Passo 2 de 3 – Serviço e Agendamento',
    'Passo 3 de 3 – Revisão e Confirmação',
];

function showStep(n) {
    steps.forEach((s, i) => s.style.display = i === n ? '' : 'none');
    dots.forEach((d, i) => d.classList.toggle('active', i <= n));
    stepLabelText.textContent = stepLabels[n];
    const progressbar = document.querySelector('.step-indicator');
    if (progressbar) progressbar.setAttribute('aria-valuenow', n + 1);
}

// Validação passo 1
document.getElementById('btn-next-1').addEventListener('click', () => {
    const fields = ['nome','cpf','email','telefone','endereco','pet-nome','pet-especie','pet-idade'];
    let valid = true;
    fields.forEach(id => {
        const el = document.getElementById(id);
        if (!el.value.trim()) { el.classList.add('is-invalid'); valid = false; }
        else el.classList.remove('is-invalid');
    });
    // CPF básico
    const cpf = document.getElementById('cpf');
    if (cpf.value.replace(/\D/g,'').length !== 11) { cpf.classList.add('is-invalid'); valid = false; }
    if (valid) showStep(1);
    else { const firstInvalid = document.querySelector('#step-1 .is-invalid'); if (firstInvalid) firstInvalid.focus(); }
    console.log("foppagnopsdan")
});

// Validação passo 2
document.getElementById('btn-next-2').addEventListener('click', () => {
    const servico = document.getElementById('servico-select');
    const entrega = document.querySelector('input[name="entrega"]:checked');
    const data = document.getElementById('data-selecionada').value;
    const horario = document.getElementById('horario-selecionado').value;
    let valid = true;
    if (!servico.value) { servico.classList.add('is-invalid'); valid = false; } else servico.classList.remove('is-invalid');
    if (!entrega) { valid = false; alert('Por favor, selecione o método de entrega.'); }
    if (!data) { valid = false; alert('Por favor, selecione uma data de agendamento.'); }
    if (!horario) { valid = false; alert('Por favor, selecione um horário.'); }
    if (valid) {
        buildRevisao();
        showStep(2);
    }
});

document.getElementById('btn-back-2').addEventListener('click', () => showStep(0));
document.getElementById('btn-back-3').addEventListener('click', () => showStep(1));

// Destaca entrega selecionada
document.querySelectorAll('input[name="entrega"]').forEach(radio => {
    radio.addEventListener('change', () => {
    document.querySelectorAll('input[name="entrega"]').forEach(r => {
        r.closest('label').style.borderColor = '#e0ddd8';
        r.closest('label').style.background = '';
    });
    radio.closest('label').style.borderColor = 'var(--brand)';
    radio.closest('label').style.background = 'var(--brand-light)';
    });
});

// Revisar dados
function buildRevisao() {
    const nome = document.getElementById('nome').value;
    const petNome = document.getElementById('pet-nome').value;
    const petEspecie = document.getElementById('pet-especie').value;
    const servico = document.getElementById('servico-select').options[document.getElementById('servico-select').selectedIndex].text;
    const entrega = document.querySelector('input[name="entrega"]:checked').value;
    const data = document.getElementById('data-selecionada').value.split('-').reverse().join('/');
    const horario = document.getElementById('horario-selecionado').value;
    const entregaLabel = entrega === 'telebusca' ? '🚗 Tele-busca (buscamos na sua casa)' : '🏪 Levo ao local';

    document.getElementById('revisao-content').innerHTML = `
    <div class="row g-3">
        <div class="col-md-6">
            <div class="p-3 rounded-3 bg-light">
                <p class="small text-muted mb-1"><i class="bi bi-person me-1"></i>Cliente</p>
                <strong>${nome}</strong>
            </div>
        </div>
        <div class="col-md-6">
            <div class="p-3 rounded-3 bg-light">
                <p class="small text-muted mb-1"><i class="bi bi-heart me-1"></i>Pet</p>
                <strong>${petNome}</strong> (${petEspecie})
            </div>
        </div>
        <div class="col-md-6">
            <div class="p-3 rounded-3 bg-light">
                <p class="small text-muted mb-1"><i class="bi bi-scissors me-1"></i>Serviço</p>
                <strong>${servico}</strong>
            </div>
        </div>
        <div class="col-md-6">
            <div class="p-3 rounded-3 bg-light">
                <p class="small text-muted mb-1"><i class="bi bi-truck me-1"></i>Entrega</p>
                <strong>${entregaLabel}</strong>
            </div>
        </div>
        <div class="col-12">
            <div class="p-3 rounded-3" style="background:var(--brand-light);border:1.5px solid var(--brand);">
                <p class="small text-muted mb-1"><i class="bi bi-calendar-check me-1"></i>Agendamento</p>
                <strong style="font-size:1.1rem;">${data} às ${horario}</strong>
            </div>
        </div>
    </div>
    `;
}

// Submit do formulário
document.getElementById('agendamento-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const termos = document.getElementById('aceita-termos');
    if (!termos.checked) { termos.classList.add('is-invalid'); return; }
    termos.classList.remove('is-invalid');

    // Substituir conteúdo por confirmação
    this.innerHTML = `
    <div class="confirmation-box" role="alert" aria-live="assertive">
        <div class="check-icon" aria-hidden="true">✓</div>
        <h3 style="font-family:'Playfair Display',serif;font-weight:700;color:#15803d;margin-bottom:8px;">Agendamento Confirmado! 🎉</h3>
        <p class="text-muted mb-2">Obrigado! Seu agendamento foi registrado com sucesso.</p>
        <p class="small text-muted">Você receberá uma confirmação no e-mail informado. Em caso de dúvidas, entre em contato pelo (51) 1234-5678.</p>
        <button type="button" class="btn-brand mt-3" style="width:auto;padding:10px 28px;" data-bs-dismiss="modal">
            <i class="bi bi-check2-circle me-1"></i> Fechar
        </button>
    </div>
    `;
    document.getElementById('dot-1').style.background = '#22c55e';
    document.getElementById('dot-2').style.background = '#22c55e';
    document.getElementById('dot-3').style.background = '#22c55e';
    document.querySelector('.step-indicator').setAttribute('aria-label', 'Agendamento concluído');
});

// Máscara CPF
document.getElementById('cpf').addEventListener('input', function() {
    let v = this.value.replace(/\D/g,'');
    v = v.replace(/(\d{3})(\d)/, '$1.$2');
    v = v.replace(/(\d{3})(\d)/, '$1.$2');
    v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    this.value = v;
});

// Máscara telefone
document.getElementById('telefone').addEventListener('input', function() {
    let v = this.value.replace(/\D/g,'');
    v = v.replace(/^(\d{2})(\d)/,'($1) $2');
    v = v.replace(/(\d{5})(\d)/,'$1-$2');
    this.value = v;
});

// Pré-selecionar serviço ao clicar no botão de agendar dos cards
document.querySelectorAll('[data-service]').forEach(btn => {
    btn.addEventListener('click', () => {
        const map = { 'banho-tosa': 'banho-tosa', 'consulta': 'consulta' };
        const val = map[btn.dataset.service];
        if (val) {
            document.getElementById('agendamento-form').querySelectorAll('fieldset').forEach((f, i) => {
            f.style.display = i === 0 ? '' : 'none';
            });
            showStep(0);
          // Pré-preenche após pequeno delay para o modal abrir
            setTimeout(() => {
            const sel = document.getElementById('servico-select');
            if (sel) sel.value = val;
            }, 400);
        }
    });
});

// Reset modal ao fechar
document.getElementById('agendamentoModal').addEventListener('hidden.bs.modal', () => {
    showStep(0);
});