let puerto;
let lector;
let conectado = false;
let escribiendo = false;
let vecesEncendido = 0;

// Elementos HTML
const btnConectar = document.getElementById("btnConectar");
const btnEncenderTodo = document.getElementById("btnEncenderTodo");
const btnApagarTodo = document.getElementById("btnApagarTodo");
const btnParpadear = document.getElementById("btnParpadear");
const btnPararParpadeo = document.getElementById("btnPararParpadeo");

const btnAzulOn = document.getElementById("btnAzulOn");
const btnAzulOff = document.getElementById("btnAzulOff");
const btnNaranjaOn = document.getElementById("btnNaranjaOn");
const btnNaranjaOff = document.getElementById("btnNaranjaOff");
const btnVerdeOn = document.getElementById("btnVerdeOn");
const btnVerdeOff = document.getElementById("btnVerdeOff");

const pwmSlider = document.getElementById("pwmSlider");
const contadorElemento = document.getElementById("contador");

const estadoConexion = document.getElementById("estadoConexion");
const estadoLed = document.getElementById("estadoLed");
const bombilla = document.getElementById("bombilla");
const mensaje = document.getElementById("mensaje");

btnConectar.addEventListener("click", conectar);

async function conectar() {
    try {
        if (!("serial" in navigator)) {
            alert("Utiliza Google Chrome o Microsoft Edge");
            return;
        }

        puerto = await navigator.serial.requestPort();
        await puerto.open({ baudRate: 9600 });
        conectado = true;

        estadoConexion.textContent = "Arduino conectado";
        mensaje.textContent = "Ya puedes controlar los LEDs";
        btnConectar.disabled = true;
        
        // Habilitar todos los controles
        const elementos = [
            btnEncenderTodo, btnApagarTodo, btnParpadear, btnPararParpadeo,
            btnAzulOn, btnAzulOff, btnNaranjaOn, btnNaranjaOff, btnVerdeOn, btnVerdeOff, pwmSlider
        ];
        elementos.forEach(el => { if (el) el.disabled = false; });

        const decoder = new TextDecoderStream();
        puerto.readable.pipeTo(decoder.writable).catch(error => console.log(error));
        lector = decoder.readable.getReader();

        leerArduino();
    } catch (error) {
        console.error(error);
        mensaje.textContent = "Error al conectar Arduino";
    }
}

async function leerArduino() {
    let texto = "";
    try {
        while (conectado) {
            const { value, done } = await lector.read();
            if (done) break;
            texto += value;
            const lineas = texto.split("\n");
            texto = lineas.pop();

            for (const linea of lineas) {
                const respuesta = linea.trim();
                if (respuesta === "ESTADO_ON") {
                    incrementarContador();
                    mostrarEstado(true);
                }
                if (respuesta === "ESTADO_OFF") {
                    mostrarEstado(false);
                }
            }
        }
    } catch (error) {
        console.error(error);
    }
}

async function enviarOrden(orden) {
    if (!conectado || escribiendo) return;
    escribiendo = true;
    try {
        const writer = puerto.writable.getWriter();
        await writer.write(new TextEncoder().encode(orden + "\n"));
        writer.releaseLock();
    } catch (error) {
        console.error(error);
        mensaje.textContent = "Error enviando la orden";
    } finally {
        escribiendo = false;
    }
}

// Eventos generales
btnEncenderTodo.addEventListener("click", () => enviarOrden("ON_ALL"));
btnApagarTodo.addEventListener("click", () => enviarOrden("OFF_ALL"));
if (btnParpadear) btnParpadear.addEventListener("click", () => enviarOrden("BLINK"));
if (btnPararParpadeo) btnPararParpadeo.addEventListener("click", () => enviarOrden("STOP_BLINK"));

// Eventos individuales
if (btnAzulOn) btnAzulOn.addEventListener("click", () => enviarOrden("AZUL_ON"));
if (btnAzulOff) btnAzulOff.addEventListener("click", () => enviarOrden("AZUL_OFF"));
if (btnNaranjaOn) btnNaranjaOn.addEventListener("click", () => enviarOrden("NARANJA_ON"));
if (btnNaranjaOff) btnNaranjaOff.addEventListener("click", () => enviarOrden("NARANJA_OFF"));
if (btnVerdeOn) btnVerdeOn.addEventListener("click", () => enviarOrden("VERDE_ON"));
if (btnVerdeOff) btnVerdeOff.addEventListener("click", () => enviarOrden("VERDE_OFF"));

// Luminosidad global (PWM para todos)
if (pwmSlider) {
    pwmSlider.addEventListener("input", function() {
        enviarOrden("PWM_" + pwmSlider.value);
    });
}

function incrementarContador() {
    vecesEncendido++;
    if (contadorElemento) {
        contadorElemento.textContent = vecesEncendido;
    }
}

function mostrarEstado(encendido) {
    if (encendido) {
        estadoLed.textContent = "SISTEMA ACTIVO";
        bombilla.classList.remove("apagado");
        bombilla.classList.add("encendido");
        mensaje.textContent = "Arduino ha procesado la orden";
    } else {
        estadoLed.textContent = "SISTEMA APAGADO";
        bombilla.classList.remove("encendido");
        bombilla.classList.add("apagado");
        mensaje.textContent = "Arduino ha apagado los elementos";
    }
}