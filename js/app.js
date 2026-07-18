/*
=========================================
FleetOS Alpha 0.1
Main Application
=========================================
*/

const app = document.getElementById("app");

function dashboard() {

app.innerHTML = `

<header class="topbar">

<h1>FleetOS</h1>

<p>Fleet Management Platform</p>

</header>

<section class="cards">

<div class="card">

<h2>Vehicule</h2>

<h1>68</h1>

</div>

<div class="card">

<h2>În Service</h2>

<h1>3</h1>

</div>

<div class="card">

<h2>Atenție</h2>

<h1>5</h1>

</div>

<div class="card">

<h2>Documente</h2>

<h1>2</h1>

</div>

</section>

<button class="fab">+</button>

<nav class="bottomNav">

<button>🏠</button>

<button>🚐</button>

<button>📅</button>

<button>⚙️</button>

</nav>

`;

}

dashboard();