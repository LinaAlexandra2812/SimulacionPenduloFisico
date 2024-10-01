//#region Variables
let l, masa, tension, beta;
let posInicialXa;
let posXa;
let amplitudA1, amplitudA2;
let w;
let m1, m2;
let C;
let radio;
let w0, tiempo = 0, ϕ = 0; // Inicializar ϕ a 0
let xSimulacion = 300, ySimulacion = 100;
let sliderposInicialXa;
let slidervelInicialVa;
let velInicialVa; // Velocidad inicial
let velVa; // Velocidad actual
let resetButton;
let phiButton;
let coeficienteAmortiguamiento = 0.05; // Coeficiente de amortiguamiento (ajusta a tu gusto)


//#endregion

//#region Variables para los gráficos
let xGraficos = 1025, yGraficos = 100;
let xspacing = 1;
let period = 0;
let dx = 0.1;
let yvalues = new Array(95);
let yvaluesVel = new Array(95); // Array para la gráfica de velocidad
let yvaluesAceleracion = new Array(95); // Array para la gráfica de aceleración

//#endregion

function setup() {
    createCanvas(1366, 768);
    //#region Sliders
    sliderLongitud = createSlider(0.5, 12, 2, 0.1);
    sliderLongitud.position(180, 170);
    sliderLongitud.style('width', '80px');

    sliderMasa = createSlider(1, 20, 10);  // Changed range to 1-20, initial value to 10
    sliderMasa.position(180, 200);
    sliderMasa.style('width', '80px');
    
    sliderTension = createSlider(1, 20, 5);  // Changed range to 1-10, initial value to 5
    sliderTension.position(180, 230);
    sliderTension.style('width', '80px');

    sliderAmortiguamiento = createSlider(0, 1, 0.05, 0.01);
    sliderAmortiguamiento.position(180, 260);
    sliderAmortiguamiento.style('width', '80px');

    sliderposInicialXa = createSlider(-8, 8, 0, 0.01);
    sliderposInicialXa.position(180, 290);
    sliderposInicialXa.style('width', '80px');

    slidervelInicialVa = createSlider(-10, 10, 0, 0.01);
    slidervelInicialVa.position(180, 320);
    slidervelInicialVa.style('width', '80px');
    
    phiButton = createButton('Calcular ϕ');
    phiButton.position(180, 375); // Ajusta la posición según sea necesario
    phiButton.mousePressed(acceptPhi); // Llama a acceptPhi al hacer clic

    // Crear el botón de reinicio
    resetButton = createButton('Reiniciar Valores');
    resetButton.position(50, 375); // Ajusta la posición según sea necesario
    resetButton.mousePressed(resetValues); // Llama a resetValues al hacer clic

    //#endregion
    //Escala 1 metro son 100 pixeles
    //#region Condiciones iniciales
    radio = 30;
    amplitudA1 = 0;
    amplitudA2 = 0;
    estadoInicial();
    
    //#endregion
    frameRate(24);
}

function draw() {
    l = sliderLongitud.value();
    masa = sliderMasa.value();
    tension = sliderTension.value();
    beta = sliderAmortiguamiento.value();
    w0 = Math.sqrt((2 * tension) / (masa * l)); // Actualiza w0 según tensión y masa
    w = sqrt(w0*w0 - beta*beta);
    
    if (w0 > beta) {
        w = Math.sqrt((w0 * w0) - (beta * beta));
    } else if (w0 == beta) {
        m1 = -beta;
        m2 = -beta;
    } else {
        m1 = -beta + Math.sqrt((beta * beta) - (w0 * w0));
        m2 = -beta - Math.sqrt((beta * beta) - (w0 * w0));
    }    


    background(255);
    textFont("Georgia");
    strokeWeight(1);

    //#region Titulo
    fill(220);
    noStroke();
    rect(0, 0, width, 60);
    fill(40);
    textSize(27);
    textStyle(BOLD);
    text("Simulación Sistema de un Péndulo", 20, 40);
    textSize(17);
    textStyle(NORMAL);
    text("| Vibraciones y Ondas | Proyecto Grupo 6 |", 580, 40);
    //#endregion

    //#region Tablero de Opciones
    var xTablero = 25, yTablero = 100;
    fill(250);
    stroke(220);
    rect(xTablero, yTablero, 250, 300);
    fill(0, 150, 55);
    rect(xTablero, yTablero, 250, 5);
    fill(20);
    noStroke();
    textSize(17);
    textStyle(NORMAL);
    text("Condiciones Iniciales", xTablero + 20, yTablero + 40);
    textSize(12);
    fill(80);
    text("Longitud: " + l + " m", xTablero + 30, yTablero + 80);
    text("Masa: " + masa + " kg", xTablero + 30, yTablero + 110);
    text("Tensión: " + tension + " N", xTablero + 30, yTablero + 140);
    text("Amortiguamiento: " + beta, xTablero + 30, yTablero + 170);
    text("Xa(0): " + sliderposInicialXa.value() + " m", xTablero + 30, yTablero + 200);
    text("Va(0): " + slidervelInicialVa.value() + " m/s", xTablero + 30, yTablero + 230);
    text("ϕ: " + ϕ, xTablero + 30, yTablero + 260); // Muestra el valor de phi
    //#endregion

    //#region Resultados
    var xResultados = 25, yResultados = 425;
    fill(250);
    stroke(220);
    rect(xResultados, yResultados, 975, 200);
    fill(0, 150, 255);
    rect(xResultados, yResultados, 5, 200);
    fill(20);
    noStroke();
    textSize(17);
    textStyle(BOLD);
    text("Resultados", xResultados + 20, yResultados + 30);
    textSize(12);
    textStyle(NORMAL);
    fill(80);

    text("C = √(" + nf((amplitudA1*amplitudA1), 1, 3) + " + " + nf(Math.pow(amplitudA2*amplitudA2, 2), 1, 3) + ") = " + nf(C, 1, 3), xResultados + 30, yResultados + 50);
    
    //#region Movimiento subamortiguado
    if(beta < w0){
        text(": Movimiento subamortiguado", xResultados + 120, yResultados + 30);
        text("Xa(t) = C · e^(-βt) · cos(w · t + ϕ )", xResultados + 30, yResultados + 70);
        text("= [" + nf(C, 1, 3) + "e^(-" + nf(beta, 1, 3) + " · t) · cos(" + nf(w, 1, 3) + " · t + " + nf(ϕ, 1, 3) + ")]", xResultados + 63, yResultados + 90);
        text("Va(t) = -C · e^(-βt) · [β · cos(w · t + ϕ ) + w · sen(w · t + ϕ )]", xResultados + 30, yResultados + 110);
        text("= [" + nf(-C, 1, 3) + " · e^(-" + nf(beta, 1, 3) + " · t) · [" + nf(beta, 1, 3) + " · cos(" + nf(w, 1, 3) + " · t + " + nf(ϕ, 1, 3) + ")" + " + " + nf(w, 1, 3) + " · sen(" + nf(w, 1, 3) + " · t + " + nf(ϕ, 1, 3) + ")]", xResultados + 63, yResultados + 130);
        text("a(t) = C · e^(-βt) · [w^2 · cos(w · t + ϕ ) + 2β · w · sen(w · t + ϕ ) + β^2 · cos(w · t + ϕ )]", xResultados + 30, yResultados + 150);
        text("= [" + nf(-C, 1, 3) + " · e^(-" + nf(beta, 1, 3) + " · t) · [" + nf(Math.pow(w, 2), 1, 3) + " · Cos(" + nf(w, 1, 3) + " · t + " + nf(ϕ, 1, 3) + ") + " + nf(2*beta, 1, 3) + " · " + nf(w, 1, 3) + " · sen(" + nf(w, 1, 3) + " · t + " + nf(ϕ, 1, 3) + ") + " + nf(Math.pow(beta, 2), 1, 3) + " · Cos(" + nf(w, 1, 3) + " · t + " + nf(ϕ, 1, 3) + ")]", xResultados + 68   , yResultados + 170);
    //#endregion

    //#region Movimiento criticamente amortiguado
    } else if(beta == w0){
        text(": Movimiento críticamente amortiguado", xResultados + 120, yResultados + 30);
        text("Xa(t) = A · e^(m1 · t) + B · e^(m2 · t)", xResultados + 30, yResultados + 70);
        text("= [" + nf(amplitudA1, 1, 3) + "e^(" + nf(m1, 1, 3) + " · t) · cos(" + nf(w0, 1, 3) + " · t + " + nf(ϕ, 1, 3) + ")]", xResultados + 63, yResultados + 90);
        text("Va(t) = -C · e^(-βt) · [β · cos(w0 · t + ϕ ) + w0 · sen(w0 · t + ϕ )]", xResultados + 30, yResultados + 110);
        text("= [" + nf(-C, 1, 3) + " · e^(-" + nf(beta, 1, 3) + " · t) · [" + nf(beta, 1, 3) + " · cos(" + nf(w0, 1, 3) + " · t + " + nf(ϕ, 1, 3) + ")" + " + " + nf(w0, 1, 3) + " · sen(" + nf(w0, 1, 3) + " · t + " + nf(ϕ, 1, 3) + ")]", xResultados + 63, yResultados + 130);
        text("a(t) = C · e^(-βt) · [w0^2 · cos(w0 · t + ϕ ) + 2β · w0 · sen(w0 · t + ϕ ) + β^2 · cos(w0 · t + ϕ )]", xResultados + 30, yResultados + 150);
        text("= [" + nf(-C, 1, 3) + " · e^(-" + nf(beta, 1, 3) + " · t) · [" + nf(Math.pow(w0, 2), 1, 3) + " · Cos(" + nf(w0, 1, 3) + " · t + " + nf(ϕ, 1, 3) + ") + " + nf(2*beta, 1, 3) + " · " + nf(w0, 1, 3) + " · sen(" + nf(w0, 1, 3) + " · t + " + nf(ϕ, 1, 3) + ") + " + nf(Math.pow(beta, 2), 1, 3) + " · Cos(" + nf(w0, 1, 3) + " · t + " + nf(ϕ, 1, 3) + ")]", xResultados + 68   , yResultados + 170);
    //#endregion

    //#region Movimiento Sobreamortiguado
    } else {
        text(": Movimiento sobreamortiguado", xResultados + 120, yResultados + 30);
        text("Xa(t) = A · e^(m1 · t) + B · e^(m2 · t)", xResultados + 30, yResultados + 70);
        text("= [" + nf(amplitudA1, 1, 3) + " · e^(" + nf(m1, 1, 3) + " · t) · " + nf(amplitudA2, 1, 3) + " · e^(" + nf(m2, 1, 3) + " · t)]", xResultados + 63, yResultados + 90);
        text("Va(t) = m1 · A · e^(m1 · t) + m2 · B · e^(m2 · t)]", xResultados + 30, yResultados + 110);
        text("= [" + nf(m1, 1, 3) + " · " + nf(amplitudA1, 1, 3) + " · e^(" + nf(m1, 1, 3) + " · t)  · " + nf(m2, 1, 3) + " · " + nf(amplitudA2, 1, 3) + " · e^(" + nf(m2, 1, 3) + " · t)]", xResultados + 63, yResultados + 130);
        text("a(t) = m1^2 · A · e^(m1 · t) + m2^2 · B · e^(m2 · t)]]", xResultados + 30, yResultados + 150);
        text("= [" + nf(m1*m1, 1, 3) + " · " + nf(amplitudA1, 1, 3) + " · e^(" + nf(m1, 1, 3) + " · t)  · " + nf(m2*m2, 1, 3) + " · " + nf(amplitudA2, 1, 3) + " · e^(" + nf(m2, 1, 3) + " · t)]", xResultados + 68   , yResultados + 170);
    }
    //#endregion
    
    //#region Simulacion
    fill(198, 211, 180);
    rect(xSimulacion, ySimulacion, 700, 300);
    fill(0, 150, 55);
    rect(xSimulacion, ySimulacion, 700, 5);

    // Definición de las variables baseX y baseY
    let baseX = xSimulacion + 50 + 600 / 2; // Posición de la base (mitad del área de simulación)
    let baseY = ySimulacion + 150; // Posición fija de la base del péndulo (anclaje superior)

    // Dibuja las cuerdas en función de la longitud l
    strokeWeight(2);
    stroke(20); // Color para las cuerdas
    let cuerdaLongitud = l * 25; // Escalar la longitud visualmente con l

    // Mantener la posición de la esfera fija en el medio
    let esferaX = baseX; 
    let esferaY = baseY - posXa * 10 + velVa; // Ajuste para el movimiento vertical

    // Dibuja las cuerdas, ajustando su longitud de acuerdo con el valor de l
    line(baseX - cuerdaLongitud, baseY, esferaX, esferaY); // Cuerda izquierda ajustada
    line(esferaX, esferaY, baseX + cuerdaLongitud, baseY); // Cuerda derecha ajustada

    // Dibuja las barras laterales conectadas a las cuerdas
    strokeWeight(20);
    stroke(128);
    let barraIzquierdaX = baseX - cuerdaLongitud; // Posición de la barra izquierda
    let barraDerechaX = baseX + cuerdaLongitud; // Posición de la barra derecha

    // Dibuja las barras laterales (verticales)
    line(barraIzquierdaX, baseY -100, barraIzquierdaX, baseY + 100); // Barra izquierda
    line(barraDerechaX, baseY -100, barraDerechaX, baseY + 100); // Barra derecha
 
     // Cambiar el tamaño de la esfera según la masa
    strokeWeight(3);
    stroke(1);  
     radio = masa * 3; // Cambiar el tamaño de la esfera basado en la masa
     fill(0, 0, 255);
     ellipse(esferaX, esferaY, radio); // Dibuja la esfera con el nuevo tamaño y en la nueva posición
     //#endregion

    //#region Tabla de graficos
    fill(20);
    stroke(100);
    rect(xGraficos, yGraficos, 310, 450);
    fill(0, 140, 25);
    rect(xGraficos, yGraficos, 310, 5);
    
    noStroke();
    textSize(16);
    fill(200);
    text("Posición Respecto al Tiempo", xGraficos + 50, yGraficos + 30);
    text("Velocidad Respecto al Tiempo", xGraficos + 50, yGraficos + 160);
    text("Aceleracion Respecto al Tiempo", xGraficos + 50, yGraficos + 290);
    // --- Gráfica de Xa(t) ---
    fill(240);
    text("Xa(t)", xGraficos + 50, yGraficos + 70);
    text("t", xGraficos + 220, yGraficos + 90);
    
    stroke(200);
    line(xGraficos + 99, yGraficos + 70, xGraficos + 220, yGraficos + 70);
    // Gráfico de la posición
    renderWave(xGraficos + 100, yGraficos + 70, yvalues);
    
    // --- Gráfica de Va(t) ---
    fill(240);
    text("Va(t)", xGraficos + 50, yGraficos + 220); // Mover hacia abajo la etiqueta de Va(t)
    text("t", xGraficos + 220, yGraficos + 240); // Ajustar el texto de t

    stroke(200);
    line(xGraficos + 99, yGraficos + 220, xGraficos + 220, yGraficos + 220); // Mover la línea
    // Gráfico de la velocidad
    renderWave(xGraficos + 100, yGraficos + 220, yvaluesVel);
    //#endregion

    // --- Gráfica de a(t) ---
    fill(240);
    text("a(t)", xGraficos + 50, yGraficos + 370);
    text("t", xGraficos + 220, yGraficos + 390);

    stroke(200);
    line(xGraficos + 99, yGraficos + 370, xGraficos + 220, yGraficos + 370);
    // Gráfico de la acelaracion
    renderWave(xGraficos + 100, yGraficos + 370, yvaluesAceleracion);

    calcPosiciones(); // Mover la llamada aquí para que se actualice cada vez que se dibuja
    tiempo += 0.25; // Aumentar el tiempo en cada frame
}
//#endregion

function mouseDragged() {
    // Se eliminó el estadoInicial(); para que no se reinicien los valores
    posInicialXa = sliderposInicialXa.value();
    velInicialVa = slidervelInicialVa.value(); // Captura la velocidad inicial
    w0 = Math.sqrt((2 * tension) / (masa * l)); // Actualiza w0 según tensión y masa
 
    calcAmplitudes(); // Actualiza las amplitudes cada vez que se arrastra un slider
    // Llama a acceptPhi para actualizar ϕ
    acceptPhi(); 
}

function resetValues() {
    sliderposInicialXa.value(0); // Restablecer el slider de posición inicial a 0
    slidervelInicialVa.value(0); // Restablecer el slider de velocidad inicial a 0
    sliderLongitud.value(1);
    sliderTension.value(1);
    sliderMasa.value(1);
    ϕ = 0; // Reiniciar el valor de ϕ a 0
    estadoInicial(); // Llama a la función para actualizar las condiciones iniciales
}

function acceptPhi() {
   
    // Calcular ϕ1

    let ϕ1 = Math.atan(velInicialVa / (posInicialXa * w0));
    // Determinar cosϕ y senϕ
    let cosϕ = posInicialXa / amplitudA1;
    let senϕ = velInicialVa / (-amplitudA2 * w0);
    // Calcular ϕ basado en el cuadrante
    if (cosϕ > 0 && senϕ > 0) {
        ϕ = (Math.PI / 2) - Math.abs(ϕ1);
    } else if (cosϕ < 0 && senϕ > 0) {
        ϕ = Math.PI - Math.abs(ϕ1);
    } else if (cosϕ < 0 && senϕ < 0) {
        ϕ = (3 * Math.PI / 2) - Math.abs(ϕ1);
    } else if (cosϕ > 0 && senϕ < 0) {
        ϕ = 2 * Math.PI - Math.abs(ϕ1);
    }
}

function estadoInicial() {
    posInicialXa = sliderposInicialXa.value();
    velInicialVa = slidervelInicialVa.value(); // Captura la velocidad inicial
    w0 = Math.sqrt((2 * tension) / (masa * l)); // Actualiza w0 según tensión y masa
    w = sqrt(w0*w0 - beta*beta);
    if (w0 > beta) {
        w = Math.sqrt(w0 * w0 - beta * beta);
    } else if (w0 == beta) {
        m1 = -beta;
        m2 = -beta;
    } else {
        m1 = -beta + Math.sqrt((beta * beta) - (w0 * w0));
        m2 = -beta - Math.sqrt((beta * beta) - (w0 * w0));
    }

    calcAmplitudes();

    tiempo = 0; // Reinicia el tiempo
}

//#region Calculos
function calcAmplitudes() {
    // Definir A1 = Xa(0) / cos(ϕ), asegurando que no se divida por cero
    if (Math.cos(ϕ) !== 0) { 
        amplitudA1 = posInicialXa / Math.cos(ϕ);
    } else {
        amplitudA1 = 0; // Manejo del caso donde cos(ϕ) es 0
    }

    // Definir A2 = -Va(0) / (w0 * sin(ϕ)), asegurando que no se divida por cero
    if (Math.sin(ϕ) !== 0) { 
        amplitudA2 = - velInicialVa / (w0 * Math.sin(ϕ));
    } else {
        amplitudA2 = 0; // Manejo del caso donde sin(ϕ) es 0
    }

    C = Math.sqrt((amplitudA1*amplitudA1) + (amplitudA2*amplitudA2));
}

function calcPosiciones() {
    // Calcula la posición y velocidad
    posXa = constrain(amplitudA1 * Math.cos(w0 * tiempo + ϕ) + (velInicialVa / w0) * Math.sin(w0 * tiempo), -8, 8); // Incluye la velocidad inicial y phi
    velVa = -amplitudA2 * w0 * Math.sin(w0 * tiempo + ϕ); // Calcula la velocidad actual
    calcPosWave(amplitudA1, amplitudA2); // Llama a la función para calcular la onda
}

function calcPosWave(amplitud1, amplitud2) {
    var modo1 = w0 * tiempo;
    
    // Para la gráfica de posición Xa(t)
    for (let i = 0; i < yvalues.length; i++) {
        yvalues[i] = (amplitud1 * Math.cos(modo1)); // Factor de escala para posición
        modo1 += dx;
    }

    // Para la gráfica de velocidad Va(t)
    modo1 = w0 * tiempo; // Reiniciar el modo1 para la velocidad
    for (let i = 0; i < yvaluesVel.length; i++) {
        yvaluesVel[i] = (-amplitudA2 * w0 * Math.sin(modo1)); // Factor de escala para velocidad
        modo1 += dx;
    }

    // --- Cálculo de aceleración a(t) ---
    modo1 = w0 * tiempo; // Reiniciar el modo1 para la aceleración
    for (let i = 0; i < yvaluesAceleracion.length; i++) {
        yvaluesAceleracion[i] =  (-amplitud1 * w0 * w0 * Math.cos(modo1)); // Calcula a(t)
        modo1 += dx;
    }
}
//#endregion

function renderWave(xMargen, yMargen, yValues) {
    noStroke();
    for (let i = 0; i < yValues.length; i++) {
        ellipse(xMargen + (i * xspacing), yMargen - yValues[i], 2);
    }
}