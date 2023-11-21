const ctx = document.getElementById('chart').getContext('2d');
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

const wrongInput = document.getElementById('wrong-input');
const bitsinput = document.getElementById('input-stream');
const bitsOutput = document.getElementById('output-stream');

let selectedScheme = 'nrz';
let inputStream = '';
let encodedData = [];

// bitsinput.addEventListener('input', generateSignal)


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
        const outputData = bitsOutput.join('');
        bitsOutput.innerHTML = outputData.slice(0, -1);
        console.log(outputData)
        wrongInput.innerHTML = "";
    } else {
        wrongInput.innerText = 'Please Enter a valid Stream...!';
    }
}


function handleSchemeChange(event) {
    selectedScheme = event.target.value;
    generateSignal();
}


function plotGraph() {
    let calibrate = encodedData.at(-1)
    encodedData.push(calibrate)
    chart.data.labels = encodedData.map((_, index) => index.toString());
    console.log(encodedData)
    chart.data.datasets[0].data = encodedData;
    chart.update();
}


function nrzEncoding(inputStream) {
    const nrzSignal = inputStream.split('').map(Number);
    return nrzSignal;
}

function nrzlEncoding(inputStream) {
    const bits = inputStream.split('').map(Number);
    const nrzLSignal = bits.map(bit => bit === 0 ? 1 : -1);
    return nrzLSignal;
}

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
                alternate * -1 > 0 ? encodedBits.splice(i - 5, 5, ...pos) : encodedBits.splice(i - 5, 5, ...neg);
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
// Analog 
const typeSelect = document.getElementById('type-select')
const functioSelect = document.getElementById('function-select')
const samplingRate = document.getElementById('samplingRate')
const frequency = document.getElementById('frequency')
const samplingButton = document.getElementById('sampling-btn')
const q_level = document.getElementById('quantizationLevel')



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

let xValues = [];
let yValues = [];

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
let ySampled = []


function generateSampling() {

    if (samplingButton.checked) {
        ySampled = []
        // ySampled.push(0) 
        let freq = 360 * frequency.value;

        for (let i = freq / (2 * samplingRate.value); i < freq; i += (freq / samplingRate.value)) {
            ySampled.push(yValues[parseInt(i)])
        }
        chart.data.datasets[0].data = ySampled;
        console.log("Y Sampled: ", ySampled);
        // chart.data.datasets[0].stepped = false;
        chart.data.datasets[0].pointRadius = 5;

        chart.update();
    }
    else {
        chart.data.datasets[0].data = yValues;
        chart.data.datasets[0].stepped = false;
        chart.data.datasets[0].pointRadius = 0;

        chart.update();
    }
}


function quantizeSamples() {
    const samples = ySampled;
    const n = q_level.value;
    // Determine the range of values in the samples
    const minSample = Math.min(...samples);
    const maxSample = Math.max(...samples);

    // Calculate the step size between quantization levels
    const stepSize = ((maxSample - minSample) / n).toFixed(2);

    // Perform quantization
    const quantizedData = samples.map(sample => {
        // Calculate the quantization level for the current sample
        const quantizationLevel = Math.floor((sample - minSample) / stepSize);

        // Map the quantization level back to the original value
        const quantizedValue = minSample + quantizationLevel * stepSize;

        return quantizedValue.toFixed(2);
    });

    chart.data.datasets[0].data = quantizedData;
    console.log(quantizedData, 'hello')
    chart.update();
}


document.getElementById("quantizationLevel").addEventListener("change", quantizeSamples);
document.getElementById("quantization-btn").addEventListener("change", quantizeSamples);
document.getElementById("sampling-btn").addEventListener("change", generateSampling);
document.getElementById("samplingRate").addEventListener("change", generateSampling);
document.getElementById("frequency").addEventListener("change", handleFunctionChange);
document.getElementById("frequency").addEventListener("change", handleFunctionChange);
document.getElementById("flatTop").addEventListener("change", (event) => {
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



const digital = document.getElementById('digital');
const analog = document.getElementById('analog');
const digitalForm = document.getElementById('digitalForm');
const analogForm = document.getElementById('analogForm');
digital.addEventListener('click', () => {
    digitalForm.classList.toggle('hide');
    digital.classList.toggle('active');
    analogForm.classList.toggle('hide');
    analog.classList.toggle('active');
    chart.data.datasets[0].stepped = 'before';

})
analog.addEventListener('click', () => {
    analogForm.classList.toggle('hide');
    analog.classList.toggle('active');
    digitalForm.classList.toggle('hide');
    digital.classList.toggle('active');
    chart.data.datasets[0].stepped = false;

})