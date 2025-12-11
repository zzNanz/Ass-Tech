// frontend/js/dashboard.js
document.addEventListener('DOMContentLoaded', () => {
    // --- VARIÁVEIS GLOBAIS E ELEMENTOS DOM ---
    const token = localStorage.getItem('jwtToken');
    const currentUser = localStorage.getItem('currentUser');
    const logoutButton = document.getElementById('logoutButton');
    const userDisplay = document.getElementById('userDisplay');
    const warrantyTableBody = document.querySelector('#warrantyTable tbody');
    const addWarrantyForm = document.getElementById('addWarrantyForm');
    const formMessage = document.getElementById('formMessage');
    const clientTableBody = document.querySelector('#clientTable tbody'); // Corpo da nova tabela de clientes
    
    // Elementos específicos para o novo fluxo de data
    const creationDateField = document.getElementById('creationDate');
    const expirationDisplayField = document.getElementById('expirationDisplay');

    // 1. Verificação de Autenticação na inicialização
    if (!token) {
        alert('Sessão expirada. Faça login novamente.');
        window.location.href = 'login.html';
        return;
    }

    userDisplay.textContent = `Logado como: ${currentUser}`;

    // --- FUNÇÕES DE CÁLCULO DE DATA ---

    /**
     * Calcula a data de expiração (1 ano após a data de criação).
     * @param {string} creationDateString - Data de criação no formato YYYY-MM-DD.
     * @returns {string|null} - Data de expiração no formato YYYY-MM-DD ou null.
     */
    const calculateExpirationDate = (creationDateString) => {
    if (!creationDateString) return null;

    // 1. Cria a data no fuso horário local para evitar problemas de deslocamento de dia
    const parts = creationDateString.split('-');
    // O construtor de Date usa o mês baseado em zero (0 para Janeiro, 11 para Dezembro), 
    // por isso subtraímos 1 do mês.
    const creationDate = new Date(parts[0], parts[1] - 1, parts[2]);
    
    // 2. 🚨 MUDANÇA CRÍTICA AQUI:
    // setMonth() adiciona 3 meses à data atual. O JavaScript lida automaticamente
    // com a virada do ano e meses com 30/31 dias.
    creationDate.setMonth(creationDate.getMonth() + 3);

    // 3. Formata a data resultante de volta para YYYY-MM-DD
    const year = creationDate.getFullYear();
    const month = String(creationDate.getMonth() + 1).padStart(2, '0'); // Mês + 1 para voltar ao formato 1-12
    const day = String(creationDate.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
};

    // Listener para calcular e exibir a data de expiração em tempo real
    if (creationDateField && expirationDisplayField) {
        creationDateField.addEventListener('change', () => {
            const creationDateValue = creationDateField.value;
            const calculatedDate = calculateExpirationDate(creationDateValue);
            
            if (calculatedDate) {
                // Formata para exibição visual (DD/MM/YYYY)
                const parts = calculatedDate.split('-');
                expirationDisplayField.value = `${parts[2]}/${parts[1]}/${parts[0]}`; 
            } else {
                expirationDisplayField.value = "Aguardando data...";
            }
        });
    }

    // --- FUNÇÕES AUXILIARES DE API E AUTH ---

    /**
     * Função para fazer requisições seguras à API, incluindo o token JWT.
     */
    const fetchApi = async (url, options = {}) => {
        options.headers = {
            ...options.headers,
            'Content-Type': 'application/json',
            // Envia o Token JWT no cabeçalho
            'Authorization': `Bearer ${token}` 
        };

        const response = await fetch(url, options);
        if (response.status === 401 || response.status === 403) {
            alert('Sessão inválida ou expirada. Redirecionando para o login.');
            handleLogout();
            return null;
        }
        return response;
    };

    /**
     * Função para limpar a sessão e redirecionar para o login.
     */
    const handleLogout = () => {
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    };

    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
    }
    
    // --- FUNÇÕES CRUD ---

    // 1. READ ALL: Carregar a Lista de Garantias
    const loadWarranties = async () => {
    warrantyTableBody.innerHTML = '<tr><td colspan="7">Carregando garantias...</td></tr>';
    
    try {
        const response = await fetchApi('http://localhost:3000/warranties'); 
        if (!response) return;

        const warranties = await response.json();
        warrantyTableBody.innerHTML = ''; 

        if (warranties.length === 0) {
            warrantyTableBody.innerHTML = '<tr><td colspan="7">Nenhuma garantia cadastrada.</td></tr>';
            return;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0); // Zera o horário para comparação precisa de data

        warranties.forEach(warranty => {
            const row = warrantyTableBody.insertRow();
            
            const vencimentoDate = new Date(warranty.warrantyEndDate);
            vencimentoDate.setHours(0, 0, 0, 0);

            // 🚨 NOVO: Lógica de Status Inteligente para exibição
            let displayStatus = warranty.status;
            if (warranty.status === 'Ativa' && vencimentoDate < today) {
                displayStatus = 'Expirada'; // Exibe como Expirada, mesmo se o DB disser 'Ativa'
                row.classList.add('expired-row'); // Adiciona classe para estilização
            } else if (warranty.status === 'Ativa' && vencimentoDate >= today) {
                displayStatus = 'Ativa';
            } else {
                displayStatus = warranty.status; // Mantém status como Finalizada/Cancelada, se for o caso
            }


            const vencimentoFormatado = vencimentoDate.toLocaleDateString('pt-BR');
            
            row.insertCell().textContent = warranty.clientName;
            row.insertCell().textContent = warranty.clientDocument;
            row.insertCell().textContent = warranty.productName;
            row.insertCell().textContent = warranty.serialNumber;
            row.insertCell().textContent = vencimentoFormatado;
            row.insertCell().textContent = displayStatus; // Usa o status inteligente
            
            // Botões de Ações (Deletar e Editar Status)
            const actionsCell = row.insertCell();

            const editBtn = document.createElement('button');
            editBtn.textContent = 'Mudar Status';
            editBtn.classList.add('edit-btn');
            editBtn.onclick = () => updateWarrantyStatus(warranty.id, warranty.status);
            actionsCell.appendChild(editBtn);

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Deletar';
            deleteBtn.classList.add('delete-btn');
            deleteBtn.onclick = () => deleteWarranty(warranty.id);
            actionsCell.appendChild(deleteBtn);
        });
    } catch (error) {
        console.error('Erro ao carregar garantias:', error);
        warrantyTableBody.innerHTML = '<tr><td colspan="7">Erro ao conectar à API.</td></tr>';
    }
};

    // 2. DELETE: Deletar Garantia
    const deleteWarranty = async (id) => {
        if (!confirm(`Tem certeza que deseja deletar a garantia #${id}?`)) {
            return;
        }
        
        try {
            const response = await fetchApi(`http://localhost:3000/warranties/${id}`, { method: 'DELETE' });
            if (response && response.ok) {
                alert(`Garantia #${id} deletada com sucesso!`);
                loadWarranties();
            } else if (response) {
                const result = await response.json();
                alert(`Falha ao deletar: ${result.message}`);
            }
        } catch (error) {
            console.error('Erro ao deletar:', error);
            alert('Erro de comunicação com o servidor.');
        }
    };
    
    // 3. CREATE: Adicionar Garantia
    if (addWarrantyForm) {
        addWarrantyForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            formMessage.textContent = '';
            formMessage.classList.remove('success-message', 'error-message');

            const formData = new FormData(addWarrantyForm);
            const data = Object.fromEntries(formData.entries());

            // Pega a data de criação e calcula a data de expiração (1 ano)
            const creationDateValue = data.creationDate; 
            const warrantyEndDateValue = calculateExpirationDate(creationDateValue);
            
            if (!warrantyEndDateValue) {
                formMessage.textContent = 'Data de criação inválida.';
                formMessage.classList.add('error-message');
                return;
            }

            // Mapeia os dados do formulário para o formato da API
            const apiData = {
                clientName: data.clientName,
                clientDocument: data.clientDocument,
                clientContact: data.clientContact,
                productName: data.productName,
                serialNumber: data.serialNumber,
                // O backend usa 'purchaseDate' (a data de criação da garantia)
                purchaseDate: creationDateValue, 
                // O backend usa 'warrantyEndDate' (a data calculada)
                warrantyEndDate: warrantyEndDateValue
            };

            try {
                const response = await fetchApi('http://localhost:3000/warranties', {
                    method: 'POST',
                    body: JSON.stringify(apiData)
                });
                
                if (!response) return;

                const result = await response.json();

                if (response.ok) {
                    formMessage.textContent = result.message;
                    formMessage.classList.add('success-message');
                    addWarrantyForm.reset();
                    expirationDisplayField.value = "Aguardando data...";
                    loadWarranties();
                } else {
                    formMessage.textContent = result.message || 'Falha ao cadastrar a garantia.';
                    formMessage.classList.add('error-message');
                }
            } catch (error) {
                console.error('Erro ao cadastrar:', error);
                formMessage.textContent = 'Erro de comunicação com a API.';
                formMessage.classList.add('error-message');
            }
        });
    }

    const loadClients = async () => {
        clientTableBody.innerHTML = '<tr><td colspan="3">Carregando clientes...</td></tr>';
        
        try {
            const response = await fetchApi('http://localhost:3000/clients'); // GET /api/clients
            if (!response) return;

            const clients = await response.json();
            clientTableBody.innerHTML = ''; // Limpa a mensagem de carregamento

            if (clients.length === 0) {
                clientTableBody.innerHTML = '<tr><td colspan="3">Nenhum cliente cadastrado.</td></tr>';
                return;
            }

            clients.forEach(client => {
                const row = clientTableBody.insertRow();
                row.insertCell().textContent = client.clientName;
                row.insertCell().textContent = client.clientDocument;
                row.insertCell().textContent = client.clientContact || 'N/A';
            });
        } catch (error) {
            console.error('Erro ao carregar clientes:', error);
            clientTableBody.innerHTML = '<tr><td colspan="3">Erro ao conectar à API.</td></tr>';
        }
    };

    const updateWarrantyStatus = async (id, currentStatus) => {
        // Lógica de alternância: Mudar entre 'Ativa' e 'Finalizada'.
        // Se já estiver como 'Finalizada' (ou outro), volta para 'Ativa'
        const newStatus = currentStatus === 'Ativa' ? 'Finalizada' : 'Ativa';
        
        if (!confirm(`Mudar o status da garantia #${id} de "${currentStatus}" para "${newStatus}"?`)) {
            return;
        }

        try {
            // Requisição PUT para a rota /api/warranties/:id
            const response = await fetchApi(`http://localhost:3000/warranties/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ status: newStatus }) // Envia apenas o novo status no corpo
            });
            
            if (response && response.ok) {
                // Sucesso na API
                alert(`Status da Garantia #${id} atualizado para ${newStatus}.`);
                loadWarranties(); // Recarrega a lista para mostrar o status atualizado
            } else if (response) {
                const result = await response.json();
                alert(`Falha ao atualizar status: ${result.message}`);
            }
        } catch (error) {
            console.error('Erro ao atualizar:', error);
            alert('Erro de comunicação com o servidor.');
        }
    };

    // --- INICIALIZAÇÃO ---
    loadWarranties();
    loadClients();
});