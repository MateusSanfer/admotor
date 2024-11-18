document.addEventListener("DOMContentLoaded", function () {
  // Inicializar Firebase
  firebase.auth().onAuthStateChanged(async (user) => {
    if (user) {
      try {
        // Obter informações do usuário do Firestore
        const userDoc = await firebase
          .firestore()
          .collection("users")
          .doc(user.uid)
          .get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          localStorage.setItem("userRole", userData.papel); // Salvar o papel no localStorage

          // Atualizar o painel com os dados do usuário
          document.getElementById("userName").textContent = userData.fullName;
          document.getElementById("profileName").textContent =
            userData.fullName;
          document.getElementById("profileEmail").textContent = userData.email;
          document.getElementById("profileRole").textContent = userData.papel;

          // Exibir/ocultar o menu com base no papel
          if (userData.papel !== "Administrador") {
            document.getElementById("employeesMenu").style.display = "none";
          }
        }
      } catch (error) {
        console.error("Erro ao carregar dados do usuário:", error);
      }
    } else {
      // Redirecionar para a página de login se o usuário não estiver autenticado
      window.location.href = "login.html";
    }
  });

  // Alternar entre seções
  document.querySelectorAll(".nav, ul li a").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      document
        .querySelectorAll(".dashboard-section")
        .forEach((section) => section.classList.remove("active"));
      const target = e.target.id.replace("Link", "Section");
      const targetSection = document.getElementById(target);
      if (targetSection) {
        targetSection.classList.add("active");
      }
    });
  });

  // Logout
  document.getElementById("logoutLink").addEventListener("click", async () => {
    try {
      await firebase.auth().signOut();
      localStorage.clear();
      window.location.href = "login.html";
    } catch (error) {
      console.error("Erro ao sair:", error);
    }
  });

  // Inicializar na página de boas-vindas
  document.getElementById("welcomeSection").classList.add("active");
});

document.addEventListener("DOMContentLoaded", async () => {
  const responsavelSelect = document.getElementById("responsavelId");
  const responsaveisSnapshot = await firebase
    .firestore()
    .collection("users")
    .get();

  responsaveisSnapshot.forEach((doc) => {
    const user = doc.data();
    const option = document.createElement("option");
    option.value = doc.id; // ID do usuário
    option.textContent = user.fullName; // Nome completo
    responsavelSelect.appendChild(option);
  });
});

document
  .getElementById("vehicleForm")
  .addEventListener("submit", async (event) => {
    event.preventDefault();

    const veiculoData = {
      dono: document.getElementById("dono").value,
      placa: document.getElementById("placa").value,
      marca: document.getElementById("marca").value,
      modelo: document.getElementById("modelo").value,
      ano: parseInt(document.getElementById("ano").value, 10),
      cor: document.getElementById("cor").value,
      situacao: document.getElementById("situacao").value,
      evento: document.getElementById("evento").value,

      responsavel_id: document.getElementById("responsavelId").value,
    };

    try {
      await firebase.firestore().collection("veiculos").add(veiculoData);
      alert("Veículo cadastrado com sucesso!");
      document.getElementById("vehicleForm").reset();
      const modalElement = document.getElementById("addVehicleModal");
      const modal = bootstrap.Modal.getInstance(modalElement);
      modal.hide();
    } catch (error) {
      console.error("Erro ao cadastrar veículo:", error);
      alert("Erro ao cadastrar veículo. Tente novamente.");
    }
  });

async function loadVehicleList() {
  const vehicleTableBody = document.getElementById("vehicleTableBody");
  vehicleTableBody.innerHTML = "";

  // Obter todos os usuários (responsáveis)
  const usersSnapshot = await firebase.firestore().collection("users").get();
  const userMap = {};
  usersSnapshot.forEach((doc) => {
    const userData = doc.data();
    userMap[doc.id] = userData.fullName; // Mapeia o ID para o nome
  });

  // Obter todos os veículos
  const vehiclesSnapshot = await firebase
    .firestore()
    .collection("veiculos")
    .get();
  vehiclesSnapshot.forEach((doc) => {
    const vehicle = doc.data();
    const responsibleName = userMap[vehicle.responsavel_id] || "Não definido";

    const row = `
              <tr>
                  <td>${vehicle.modelo}</td>
                  <td>${vehicle.dono}</td>
                  <td>${vehicle.situacao}</td>
                  <td>${vehicle.evento}</td>
                  <td>${responsibleName}</td>
                 <td>
                
                <button class="btn btn-sm" onclick="viewComments('${doc.id}')"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0,0,256,256" width="24px" height="24px" fill-rule="nonzero"><g fill="#3bebe5" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal"><g transform="scale(5.33333,5.33333)"><path d="M37,39h-26l-6,6v-34c0,-3.3 2.7,-6 6,-6h26c3.3,0 6,2.7 6,6v22c0,3.3 -2.7,6 -6,6z"></path></g></g></svg></button>


                <button class="btn  btn-sm" onclick="viewHistory('${doc.id}')"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-book" viewBox="0 0 16 16">
  <path d="M1 2.828c.885-.37 2.154-.769 3.388-.893 1.33-.134 2.458.063 3.112.752v9.746c-.935-.53-2.12-.603-3.213-.493-1.18.12-2.37.461-3.287.811zm7.5-.141c.654-.689 1.782-.886 3.112-.752 1.234.124 2.503.523 3.388.893v9.923c-.918-.35-2.107-.692-3.287-.81-1.094-.111-2.278-.039-3.213.492zM8 1.783C7.015.936 5.587.81 4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 0 0 0 2.5v11a.5.5 0 0 0 .707.455c.882-.4 2.303-.881 3.68-1.02 1.409-.142 2.59.087 3.223.877a.5.5 0 0 0 .78 0c.633-.79 1.814-1.019 3.222-.877 1.378.139 2.8.62 3.681 1.02A.5.5 0 0 0 16 13.5v-11a.5.5 0 0 0-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.809 8.985.936 8 1.783"/>
</svg></button>


                <button class="btn btn-sm" onclick="editVehicle('${doc.id}')"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0,0,256,256" width="24px" height="24px" fill-rule="nonzero"><g fill="#c8b400" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal"><g transform="scale(10.66667,10.66667)"><path d="M18.41406,2c-0.25587,0 -0.51203,0.09747 -0.70703,0.29297l-1.70703,1.70703l4,4l1.70703,-1.70703c0.391,-0.391 0.391,-1.02406 0,-1.41406l-2.58594,-2.58594c-0.1955,-0.1955 -0.45116,-0.29297 -0.70703,-0.29297zM14.5,5.5l-11.5,11.5v4h4l11.5,-11.5z"></path></g></g></svg></button>


                <button class="btn  btn-sm" onclick="deleteVehicle('${doc.id}')"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="red" class="bi bi-trash" viewBox="0 0 16 16">
  <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
  <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
</svg></button>

            </td>
              </tr>
          `;
    vehicleTableBody.insertAdjacentHTML("beforeend", row);
  });
}

// Chamar essa função ao carregar a página
document.addEventListener("DOMContentLoaded", loadVehicleList);

// Botão para abrir o modal
document.getElementById("addEmployeeBtn").addEventListener("click", () => {
  const role = localStorage.getItem("userRole");
  if (role === "Administrador") {
    const modalElement = new bootstrap.Modal(
      document.getElementById("employeeModal"),
    );
    modalElement.show();
  } else {
    alert("Apenas administradores podem gerenciar funcionários.");
  }
});

// Submeter formulário de funcionário
document
  .getElementById("employeeForm")
  .addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = document.getElementById("employeeName").value;
    const email = document.getElementById("employeeEmail").value;
    const role = document.getElementById("employeeRole").value;

    try {
      const newUser = await firebase.firestore().collection("users").add({
        fullName: name,
        email: email,
        papel: role,
      });
      alert("Funcionário cadastrado com sucesso!");
      document.getElementById("employeeForm").reset();
      loadEmployees(); // Atualizar lista de funcionários
    } catch (error) {
      console.error("Erro ao cadastrar funcionário:", error);
      alert("Erro ao cadastrar funcionário. Tente novamente.");
    }
  });

// Carregar lista de funcionários
async function loadEmployees() {
  const employeesList = document.getElementById("employeesList");
  employeesList.innerHTML = ""; // Limpar lista

  try {
    const snapshot = await firebase.firestore().collection("users").get();
    snapshot.forEach((doc) => {
      const user = doc.data();
      const listItem = document.createElement("li");
      listItem.classList.add("list-group-item");
      listItem.textContent = `${user.fullName} (${user.papel})`;
      employeesList.appendChild(listItem);
    });
  } catch (error) {
    console.error("Erro ao carregar funcionários:", error);
  }
}

// Carregar lista ao iniciar
loadEmployees();

let selectedVehicleId;

async function viewComments(vehicleId) {
    selectedVehicleId = vehicleId;
    const commentsList = document.getElementById('commentsList');
    commentsList.innerHTML = '';

    const commentsSnapshot = await firebase.firestore()
        .collection('veiculos')
        .doc(vehicleId)
        .collection('comentarios')
        .get();

    commentsSnapshot.forEach(doc => {
        const comment = doc.data();
        console.log(comment); // Adicione um log para verificar os dados do comentário
        const commentElement = `
            <div class="comment">
                <strong>${comment.userName || 'Desconhecido'}</strong> <em>${new Date(comment.timestamp).toLocaleString()}</em>
                <p>${comment.text}</p>
            </div>
            <hr>
        `;
        commentsList.insertAdjacentHTML('beforeend', commentElement);
    });

    const commentsModal = new bootstrap.Modal(document.getElementById('commentsModal'));
    commentsModal.show();
}


async function addComment() {
  const newCommentText = document.getElementById("newComment").value;
  if (!newCommentText) return;

  const user = firebase.auth().currentUser;

  // Buscar o fullName diretamente na coleção 'users'
  const userDoc = await firebase.firestore().collection("users").doc(user.uid).get();
  const userFullName = userDoc.exists ? userDoc.data().fullName : "Nome não disponível"; // Usar fullName ou valor padrão

  await firebase
    .firestore()
    .collection("veiculos")
    .doc(selectedVehicleId)
    .collection("comentarios")
    .add({
      text: newCommentText,
      userId: user.uid,
      fullName: userFullName, // Usar fullName aqui
      timestamp: Date.now(),
    });

  document.getElementById("newComment").value = "";
  viewComments(selectedVehicleId); // Atualizar os comentários
}

async function viewHistory(vehicleId) {
  const historyList = document.getElementById("historyList");
  historyList.innerHTML = "";

  try {
    const historySnapshot = await firebase
      .firestore()
      .collection("veiculos")
      .doc(vehicleId)
      .collection("historico_atualizacoes")
      .orderBy("timestamp", "desc") // Ordenar pelo mais recente
      .get();

    if (historySnapshot.empty) {
      historyList.innerHTML = "<li>Nenhum histórico disponível.</li>";
    } else {
      historySnapshot.forEach((doc) => {
        const record = doc.data();
        const recordElement = `
              <li>
                  <strong>${record.userName}</strong> realizou <em>${
          record.action
        }</em> em ${new Date(record.timestamp?.toDate()).toLocaleString()}.
              </li>
          `;
        historyList.insertAdjacentHTML("beforeend", recordElement);
      });
    }

    const historyModal = new bootstrap.Modal(document.getElementById("historyModal"));
    historyModal.show();
  } catch (error) {
    console.error("Erro ao carregar histórico:", error);
    alert("Erro ao carregar histórico. Tente novamente.");
  }
}


async function logHistory(vehicleId, action) {
  const user = firebase.auth().currentUser;

  if (!user) {
    console.error("Usuário não autenticado. Não foi possível registrar o histórico.");
    return;
  }

  try {
    // Buscar o nome completo do Firestore
    const userDoc = await firebase.firestore().collection("users").doc(user.uid).get();
    const userFullName = userDoc.exists ? userDoc.data().fullName : "Usuário não identificado";

    // Registrar histórico
    await firebase
      .firestore()
      .collection("veiculos")
      .doc(vehicleId)
      .collection("historico_atualizacoes")
      .add({
        userId: user.uid,
        userName: userFullName, // Usar o fullName do Firestore
        action: action,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      });
  } catch (error) {
    console.error("Erro ao registrar histórico:", error);
  }
}


async function deleteVehicle(vehicleId) {
  try {
    const vehicleRef = firebase.firestore().collection("veiculos").doc(vehicleId);
    const vehicleDoc = await vehicleRef.get();
    if (vehicleDoc.exists) {
      const vehicleData = vehicleDoc.data();

      // Registrar histórico
      await logHistory(vehicleId, `Exclusão do veículo (${vehicleData.modelo})`);

      // Excluir o veículo
      await vehicleRef.delete();
      alert("Veículo excluído com sucesso!");
      loadVehicleList(); // Atualiza a tabela após exclusão
    } else {
      alert("Veículo não encontrado.");
    }
  } catch (error) {
    console.error("Erro ao excluir veículo:", error);
    alert("Erro ao excluir o veículo. Tente novamente.");
  }
}

async function editVehicle(vehicleId) {
  try {
    const vehicleDoc = await firebase
      .firestore()
      .collection("veiculos")
      .doc(vehicleId)
      .get();
    if (vehicleDoc.exists) {
      const vehicleData = vehicleDoc.data();

      // Preencher o modal com os dados do veículo
      document.getElementById("editVehicleId").value = vehicleId; // Escondido no modal
      document.getElementById("editModelo").value = vehicleData.modelo || "";
      document.getElementById("editSituacao").value =
        vehicleData.situacao || "";

      const modalElement = new bootstrap.Modal(
        document.getElementById("editVehicleModal")
      );
      modalElement.show();
    } else {
      alert("Veículo não encontrado.");
    }
  } catch (error) {
    console.error("Erro ao buscar veículo:", error);
    alert("Erro ao carregar os dados do veículo. Tente novamente.");
  }
}

async function saveVehicleChanges() {
  const vehicleId = document.getElementById("editVehicleId").value;
  const modelo = document.getElementById("editModelo").value;
  const situacao = document.getElementById("editSituacao").value;

  try {
    await firebase.firestore().collection("veiculos").doc(vehicleId).update({
      modelo,
      situacao,
    });

    await logHistory(vehicleId, `Edição do veículo (${modelo})`);
    
    alert("Veículo atualizado com sucesso!");
    const modalElement = bootstrap.Modal.getInstance(
      document.getElementById("editVehicleModal")
    );
    modalElement.hide();
    loadVehicleList(); // Atualiza a tabela após edição
  } catch (error) {
    console.error("Erro ao atualizar veículo:", error);
    alert("Erro ao salvar as alterações. Tente novamente.");
  }
}

// Função para atualizar os valores dos cartões
function updateStats(stats) {
  if (stats.totalVehicles !== undefined) {
      document.querySelector(".stat-card:nth-child(1) .card-value").textContent = stats.totalVehicles;
  }
  if (stats.activeEmployees !== undefined) {
      document.querySelector(".stat-card:nth-child(2) .card-value").textContent = stats.activeEmployees;
  }
  if (stats.tasksInProgress !== undefined) {
      document.querySelector(".stat-card:nth-child(3) .card-value").textContent = stats.tasksInProgress;
  }
  if (stats.pendingMaintenances !== undefined) {
      document.querySelector(".stat-card:nth-child(4) .card-value").textContent = stats.pendingMaintenances;
  }
}

// Referência ao nó do Firebase
const statsRef = ref(database, 'stats');

// Ouve atualizações em tempo real no Firebase
onValue(statsRef, (snapshot) => {
  const data = snapshot.val();
  if (data) {
      updateStats(data);
  }
});

async function updateStats() {
  try {
    // Total de Veículos
    const vehiclesSnapshot = await db.collection("Veículos").get();
    document.getElementById("totalVehicles").textContent = vehiclesSnapshot.size;

    // Funcionários Ativos
    const employeesSnapshot = await db.collection("Usuários")
      .where("ativo", "==", true) // Certifique-se de que existe um campo "ativo" no documento.
      .get();
    document.getElementById("activeEmployees").textContent = employeesSnapshot.size;

    // Tarefas em Andamento
    const tasksSnapshot = await db.collection("Tarefas")
      .where("status", "==", "em andamento") // Ajuste o campo/status conforme o schema.
      .get();
    document.getElementById("ongoingTasks").textContent = tasksSnapshot.size;

    // Manutenções Pendentes
    const maintenancesSnapshot = await db.collection("Manutenções")
      .where("status", "==", "pendente") // Ajuste o campo/status conforme o schema.
      .get();
    document.getElementById("pendingMaintenances").textContent = maintenancesSnapshot.size;
  } catch (error) {
    console.error("Erro ao buscar estatísticas: ", error);
  }
}

// Atualize as estatísticas ao carregar a página
document.addEventListener("DOMContentLoaded", updateStats);