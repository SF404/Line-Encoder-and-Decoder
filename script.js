const ctx = $('chart').getContext('2d');
const chart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: '',
        datasets: [{
            label: 'Output Signal',
            color: 'white',
            backgroundColor: "#f44336",
            borderColor: "rgba(255,0,0,1)",
            data: [],
            borderWidth: 4,
            stepped: 'before',
            pointRadius: 0,
        }]
    },
    options: {
        autoPadding: false,
        animations: {
            tension: {
                duration: 1000,
                easing: 'linear',
                from: 1,
                to: 0,

            }
        },
        scales: {
            x: {
                type: 'linear',
                position: 'bottom',
                ticks: {
                    stepSize: 1,
                    color: 'white'
                },
                grid: {
                    color: '#7f7f7f'
                }
            },
            y: {
                min: -2,
                max: 2,
                ticks: {
                    color: 'white'
                },
                grid: {
                    color: '#7f7f7f'
                }
            },
        },
        legend: { display: false },
        layout: {
            padding: 0
        },
        title: {
            display: true,
            text: "Plot",
            fontSize: 16,
            color: 'red'
        }
    }
});


function $(id) {
    return document.getElementById(id);
}

const wrongInput = $('wrong-input');
const bitsinput = $('input-stream');
const bitsOutput = $('output-stream');
const decodeButton = $('decode');

let selectedScheme = 'nrz';
let inputStream = '';
let encodedData = [];

// Function to generate Signal
function generateSignal() {
    inputStream = bitsinput.value;
    const isValid = /^[01]*$/.test(inputStream);
    console.log(inputStream)

    if (isValid) {
        switch (selectedScheme) {
            case 'nrz':
                encodedData = nrzEncoding(inputStream);
                break;
            case 'nrzl':
                encodedData = nrzlEncoding(inputStream);
                break;
            case 'nrzi':
                encodedData = nrziEncoding(inputStream);
                break;
            case 'manchester':
                encodedData = manchesterEncoding(inputStream);
                break;
            case 'diffmanchester':
                encodedData = differentialManchesterEncoding(inputStream);
                break;
            case 'ami':
                encodedData = amiEncoding(inputStream);
                break;
            case 'b8zs':
                encodedData = b8zsEncoding(inputStream);
                break;
            case 'hdb3':
                encodedData = hdb3Encoding(inputStream);
                break;

            default:
                wrongInput.innerText = '!Please select a valid scheme';
                return;
        }
        plotGraph();
        // const outputData = encodedData
        // outputData.splice(-1, 1);
        // chartBar.children[0].innerHTML = 'Out: ' + outputData.join('')
        wrongInput.innerHTML = "";
    } else {
        wrongInput.innerText = 'Please Enter a valid Stream...!';
    }
}

// Scheme change handler
$('scheme-name').addEventListener('change', (event) => {
    selectedScheme = event.target.value;
    generateSignal();
})


// function to plot Graph
function plotGraph() {
    let calibrate = encodedData.at(-1)
    encodedData.push(calibrate)
    chart.data.labels = encodedData.map((_, index) => index.toString());
    chart.data.datasets[0].data = encodedData;
    chart.update();
}

// ---------------------- Encoding Scheme Functions ---------------
function nrzEncoding(inputStream) {
    const nrzSignal = inputStream.split('').map(Number);
    return nrzSignal;
}

function nrzlEncoding(inputStream) {
    const bits = inputStream.split('').map(Number);
    const nrzLSignal = bits.map(bit => bit === 0 ? 1 : -1);
    return nrzLSignal;
}

// function nrzlDecoding(inputStream) {
//     const bits = inputStream.split('').map(Number);
//     const nrzLSignal = bits.map(bit => bit === 1 ? 0 : 1);
//     return nrzLSignal;
// }

function nrziEncoding(inputStream) {
    const bits = inputStream.split('').map(Number);
    const nrziSignal = [];
    let previous = 1;
    for (let i = 0; i < bits.length; i++) {
        if (bits[i] == 0) {
            nrziSignal.push(previous)
        }
        else {
            nrziSignal.push(previous * -1)
            previous = previous * -1;
        }
    }
    return nrziSignal;
}

function manchesterEncoding(inputStream) {
    const bits = inputStream.split('').map(Number);
    const manchesterSignal = [];
    for (let i = 0; i < bits.length; i++) {
        manchesterSignal.push(bits[i] === 0 ? 1 : -1);
        manchesterSignal.push(bits[i] === 0 ? -1 : 1);
    }
    return manchesterSignal;
}

function differentialManchesterEncoding(inputStream) {
    const bits = inputStream.split('').map(Number);
    const diffManchesterSignal = [];
    for (let i = 0; i < bits.length; i++) {
        if (bits[i] === 0) {
            diffManchesterSignal.push(-1, 1);
        } else {
            diffManchesterSignal.push(1, -1);
        }
    }
    return diffManchesterSignal;
}

function amiEncoding(inputStream) {
    const bits = inputStream.split('').map(Number);
    const amiSignal = [];
    let alternate = 1;
    for (let i = 0; i < bits.length; i++) {
        if (bits[i] === 0) {
            amiSignal.push(0);
        } else {
            amiSignal.push(alternate);
            alternate *= -1;
        }
    }
    return amiSignal;
}

function b8zsEncoding(inputStream) {
    const encodedBits = [];
    let zeroCount = 0;
    const pos = [1, -1, 0, -1, 1]
    const neg = [-1, 1, 0, 1, -1]
    let alternate = 1;

    for (let i = 0; i < inputStream.length; i++) {
        if (inputStream[i] == 0) {
            encodedBits.push(0)
            zeroCount++;
            if (zeroCount == 8) {
                alternate * -1 > 0 ? encodedBits.splice(i - 4, 5, ...pos) : encodedBits.splice(i - 4, 5, ...neg);
                zeroCount = 0;
            }
        } else {
            encodedBits.push(alternate);
            alternate *= -1;
            zeroCount = 0;
        }
    }

    return encodedBits;
}
function hdb3Encoding(inputStream) {
    const encodedBits = [];
    let zeroCount = 0;
    let xor_even_odd = 0;
    let alternate = 1;

    for (let i = 0; i < inputStream.length; i++) {

        if (inputStream[i] == 0) {
            encodedBits.push(0)
            zeroCount++;
            if (zeroCount == 4) {
                console.log(zeroCount)
                let previous_voltage = alternate * -1;
                if (xor_even_odd) {
                    previous_voltage > 0 ? encodedBits.splice(i, 1, 1) : encodedBits.splice(i, 1, -1);
                    previous_voltage > 0 ? alternate = -1 : alternate = 1;
                }
                else {
                    previous_voltage > 0 ? encodedBits.splice(i, 1, -1) : encodedBits.splice(i, 1, 1);
                    previous_voltage > 0 ? encodedBits.splice(i - 3, 1, -1) : encodedBits.splice(i - 3, 1, 1);
                    previous_voltage > 0 ? alternate = 1 : alternate = -1;
                }
                zeroCount = 0;
                xor_even_odd = 0;
            }
        } else {
            encodedBits.push(alternate);
            zeroCount = 0;
            alternate *= -1;
            xor_even_odd = xor_even_odd ^ 1;
        }
    }

    return encodedBits;
}

// ------------------------------------------------

const typeSelect = $('type-select')
const functioSelect = $('function-select')
const samplingRate = $('samplingRate')
const frequency = $('frequency')
const samplingButton = $('sampling-btn')
const q_level = $('quantizationLevel')
const chartBar = $('chart-bar')

let ySampled = []
let xValues = [];
let yValues = [];


function handleFunctionChange() {
    const func = functioSelect.value;
    switch (func) {
        case 'sin':
            generateSignalWave("Math.sin(x * Math.PI / 180)");
            break;
        case 'cos':
            generateSignalWave("Math.cos(x * Math.PI / 180)");
            break;
        case 'triangle':
            generateSignalWave("(2 / Math.PI) * Math.asin(Math.sin(x * Math.PI / 180))");
            break;
        case 'square':
            generateSignalWave("Math.sign(Math.sin(x * Math.PI / 180))");
            break;
        case 'sawtooth':
            generateSignalWave("((x + 90) % 360 - 180) / 180");
            break;
    }
}


function generateSignalWave(signal) {
    xValues = []
    yValues = []
    for (let x = 0; x < 360 * frequency.value; x++) {
        yValues.push((eval(signal) * 10).toFixed(2));
        xValues.push(x);
    }
    chart.data.labels = xValues.map((_, index) => index.toString());
    chart.data.datasets[0].data = yValues;
    chart.options.scales.y.max = 15;
    chart.options.scales.y.min = -15;
    chart.update();
    if (samplingButton.checked) {
        generateSampling()
    }
}

function generateSampling() {
    if (samplingButton.checked) {
        ySampled = []
        let freq = 360 * frequency.value;

        for (let i = freq / (2 * samplingRate.value); i < freq; i += (freq / samplingRate.value)) {
            ySampled.push(yValues[parseInt(i)])
        }
        chart.data.datasets[0].data = ySampled;
        console.log("Y Sampled: ", ySampled);
        chart.data.datasets[0].pointRadius = 5;
        chart.data.datasets[0].data = ySampled;
        chartBar.children[0].innerHTML = "__Sampled: " + ySampled.join('   ')
        chart.update();
    }
    else {
        chart.data.datasets[0].data = yValues;
        chart.data.datasets[0].stepped = false;
        chart.data.datasets[0].pointRadius = 0;
        chartBar.children[0].innerHTML = ""
        chart.update();
    }
}


function quantizeSamples() {
    if (quantizationButton.checked) {
        const samples = ySampled;
        const n = q_level.value;

        const minSample = Math.min(...samples);
        const maxSample = Math.max(...samples);

        const stepSize = ((maxSample - minSample) / n).toFixed(2);

        // Perform quantization
        const quantizedData = samples.map(sample => {
            const quantizationLevel = Math.round((sample - minSample) / stepSize);
            const quantizedValue = minSample + quantizationLevel * stepSize;

            return quantizedValue.toFixed(2);
        });

        chart.data.datasets[0].data = quantizedData;
        chartBar.children[1].innerHTML = "Quantized: " + quantizedData.join('   ')
        chartBar.children[2].innerHTML = "Step Size: " + stepSize;
    }
    else {
        chart.data.datasets[0].data = ySampled;
        chartBar.children[0].innerHTML = "__Sampled:  " + ySampled.join('   ')
    }

    chart.update();
}


const quantizationButton = $("quantization-btn")
quantizationButton.addEventListener("change", quantizeSamples);
$("quantizationLevel").addEventListener("change", quantizeSamples)
$("sampling-btn").addEventListener("change", generateSampling);
$("samplingRate").addEventListener("change", generateSampling);
$("frequency").addEventListener("change", handleFunctionChange);
$("flatTop").addEventListener("change", (event) => {
    if (event.target.checked) {
        chart.data.datasets[0].stepped = 'before';
        chart.data.datasets[0].pointRadius = 0;
        chart.update();
    }
    else {
        chart.data.datasets[0].stepped = false;
        chart.data.datasets[0].pointRadius = 5;
        chart.update();

    }
});



const digital = $('digital');
const analog = $('analog');
const digitalForm = $('digitalForm');
const analogForm = $('analogForm');
digital.addEventListener('click', () => {
    digitalForm.classList.toggle('hide');
    digital.classList.toggle('active');
    analogForm.classList.toggle('hide');
    analog.classList.toggle('active');
    chart.data.datasets[0].stepped = 'before';
    chart.options.scales.y.max = 2;
    chart.options.scales.y.min = -2;

})
analog.addEventListener('click', () => {
    analogForm.classList.toggle('hide');
    analog.classList.toggle('active');
    digitalForm.classList.toggle('hide');
    digital.classList.toggle('active');
    chart.data.datasets[0].stepped = false;

})



// let decodedData = []
// function DecodeSignal() {
//     let inputStream = encodedData.join('');

//     switch (selectedScheme) {
//         case 'nrz':
//             decodedData = nrzEncoding(inputStream);
//             break;
//         case 'nrzl':
//             decodedData = nrzlDecoding(inputStream);
//             break;
//         case 'nrzi':
//             decodedData = nrziEncoding(inputStream);
//             break;
//         case 'manchester':
//             decodedData = manchesterEncoding(inputStream);
//             break;
//         case 'diffmanchester':
//             decodedData = differentialManchesterEncoding(inputStream);
//             break;
//         case 'ami':
//             decodedData = amiEncoding(inputStream);
//             break;
//         case 'b8zs':
//             decodedData = b8zsEncoding(inputStream);
//             break;
//         case 'hdb3':
//             decodedData = hdb3Encoding(inputStream);
//             break;

//         default:
//             wrongInput.innerText = '!Please select a valid scheme';
//             return;
//     }
// }